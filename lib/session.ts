import { buildSnapshot } from './build-snapshot';
import { type Deck, getDeck } from './decks';
import { HostElection } from './host';
import { parseMsg } from './parse-msg';
import {
  type CardIcon,
  type JoinMsg,
  type Msg,
  PROTOCOL_VERSION,
  type RevealPayload,
  type RoomConfig,
  type WithoutEnvelope,
} from './protocol';
import { Roster } from './roster';
import type { RoomSnapshot, Status } from './snapshot';
import type { SyncTransport } from './sync';
import { Voting } from './voting';
import type { Member } from './member';
import type { VoteStorage } from './vote-storage';

export interface Timing {
  heartbeatMs: number;
  peerTimeoutMs: number;
  peerLeaveGraceMs: number;
  notFoundMs: number;
  notFoundExtendMs: number;
  countdownMs: number;
  revealTimeoutMs: number;
  tickMs: number;
}

export const DEFAULT_TIMING: Timing = {
  heartbeatMs: 2500,
  peerTimeoutMs: 10_000,
  peerLeaveGraceMs: 1500,
  notFoundMs: 8000,
  notFoundExtendMs: 7000,
  countdownMs: 1200,
  revealTimeoutMs: 6000,
  tickMs: 1000,
};

export interface SessionOptions {
  code: string;
  selfCid: string;
  name: string;
  transport: SyncTransport;
  createConfig?: RoomConfig;
  observer?: boolean;
  onChange: (snapshot: RoomSnapshot) => void;
  timing?: Partial<Timing>;
  storage?: VoteStorage | null;
  now?: () => number;
}

const KICK_IGNORE_MS = 3000;
const MISSING_HOST_GRACE_MS = 3000;
const TIMER_SLACK_MS = 5;

type Outgoing = WithoutEnvelope<Msg>;

export class RoomSession {
  private readonly code: string;
  private readonly selfCid: string;
  private readonly transport: SyncTransport;
  private readonly onChange: (snapshot: RoomSnapshot) => void;
  private readonly timing: Timing;
  private readonly storage: VoteStorage | null;
  private readonly now: () => number;
  private readonly observer: boolean;

  private readonly roster: Roster;
  private readonly host: HostElection;
  private readonly voting: Voting;
  private status: Status;
  private config: RoomConfig | null;
  private readyAt: number;
  private sawPeer = false;
  private stopped = false;

  private readonly cidByPeer = new Map<string, string>();
  private readonly pendingRemoval = new Map<string, ReturnType<typeof setTimeout>>();
  private readonly ignoreUntil = new Map<string, number>();
  private readonly timeouts = new Set<ReturnType<typeof setTimeout>>();
  private intervals: ReturnType<typeof setInterval>[] = [];
  private phaseTimer: ReturnType<typeof setTimeout> | null = null;
  private lastSnapshot: RoomSnapshot | null = null;
  private lastSnapshotJson = '';

  constructor(options: SessionOptions) {
    this.code = options.code;
    this.selfCid = options.selfCid;
    this.transport = options.transport;
    this.onChange = options.onChange;
    this.timing = { ...DEFAULT_TIMING, ...options.timing };
    this.storage = options.storage ?? null;
    this.now = options.now ?? Date.now;
    this.observer = !!options.observer;
    this.config = options.createConfig ?? null;
    this.status = options.createConfig ? 'ready' : 'connecting';
    this.readyAt = this.now();
    this.roster = new Roster(this.selfCid, options.name, this.readyAt);
    this.host = new HostElection(options.createConfig ? this.selfCid : null);
    this.voting = new Voting(this.selfCid, this.timing);
  }

  start(): void {
    void Promise.resolve(
      this.transport.connect({
        onMessage: (data, peerId) => this.handleMessage(data, peerId),
        onPeerJoin: (peerId) => this.handlePeerJoin(peerId),
        onPeerLeave: (peerId) => this.handlePeerLeave(peerId),
      }),
    ).catch(() => undefined);
    this.intervals.push(
      setInterval(() => this.sendHeartbeat(), this.timing.heartbeatMs),
      setInterval(() => this.expireSilentMembers(), this.timing.tickMs),
    );
    if (this.status === 'connecting') this.giveUpIfNobodyAnswers();
    else this.persistVote();
    this.emit();
  }

  /** `explicit` forgets the saved vote; a plain leave (page hide, reload) keeps it. */
  leave(explicit = false): void {
    if (this.stopped) return;
    if (this.status === 'ready' && !this.observer) this.send({ t: 'leave' });
    if (explicit) this.storage?.save(null);
    this.shutdown();
  }

  getSnapshot(): RoomSnapshot {
    return this.lastSnapshot ?? this.buildSnapshot();
  }

  vote(value: string): void {
    const deck = this.deck();
    if (this.status !== 'ready' || !deck) return;
    const commitment = this.voting.castVote(this.roster.me, deck, value);
    if (!commitment) return;
    this.persistVote();
    this.send({ t: 'vote-commit', round: this.voting.round, ...commitment });
    this.evaluate();
  }

  newRound(): void {
    if (!this.isHost || this.status !== 'ready') return;
    const round = this.voting.round + 1;
    this.startRound(round);
    this.send({ t: 'reset', round });
    this.evaluate();
  }

  kick(cid: string): void {
    if (!this.isHost || this.status !== 'ready' || cid === this.selfCid || !this.roster.has(cid)) return;
    this.send({ t: 'kick', target: cid });
    this.ignoreUntil.set(cid, this.now() + KICK_IGNORE_MS);
    this.removeMember(cid);
  }

  private get isHost(): boolean {
    return this.host.cid === this.selfCid;
  }

  private deck(): Deck | undefined {
    return this.config ? getDeck(this.config.deck) : undefined;
  }

  private shutdown(): void {
    this.stopped = true;
    this.intervals.forEach(clearInterval);
    this.intervals = [];
    this.timeouts.forEach(clearTimeout);
    this.timeouts.clear();
    this.pendingRemoval.forEach(clearTimeout);
    this.pendingRemoval.clear();
    if (this.phaseTimer) clearTimeout(this.phaseTimer);
    void Promise.resolve(this.transport.disconnect()).catch(() => undefined);
  }

  private later(ms: number, action: () => void): void {
    const timer = setTimeout(() => {
      this.timeouts.delete(timer);
      if (!this.stopped) action();
    }, ms);
    this.timeouts.add(timer);
  }

  private giveUpIfNobodyAnswers(): void {
    this.later(this.timing.notFoundMs, () => {
      if (this.status !== 'connecting') return;
      if (!this.sawPeer) return this.markNotFound();
      this.later(this.timing.notFoundExtendMs, () => {
        if (this.status === 'connecting') this.markNotFound();
      });
    });
  }

  private markNotFound(): void {
    this.status = 'not-found';
    this.shutdown();
    this.emit();
  }

  private markRemoved(): void {
    this.status = 'removed';
    this.storage?.save(null);
    this.shutdown();
    this.emit();
  }

  private send(message: Outgoing, target?: string): void {
    if (this.stopped) return;
    const full = { ...message, v: PROTOCOL_VERSION, from: this.selfCid } as Msg;
    try {
      this.transport.send(full, target);
    } catch {
      // Not connected yet; heartbeats repair whatever gets lost.
    }
  }

  private presence(): WithoutEnvelope<JoinMsg> {
    const me = this.roster.me;
    return {
      t: 'join',
      name: me.name,
      joinedAt: me.joinedAt,
      round: this.voting.round,
      commit: me.commit,
      icon: me.icon,
      reveal: this.voting.locked && me.reveal ? { value: me.reveal.value, salt: me.reveal.salt } : null,
    };
  }

  private sendHeartbeat(): void {
    if (this.observer || this.status === 'not-found' || this.status === 'removed') return;
    this.send({ ...this.presence(), t: 'heartbeat', hostCid: this.host.cid, hostEpoch: this.host.epoch });
  }

  private sendRoomConfig(peerId: string): void {
    if (!this.config || !this.host.cid) return;
    this.send(
      {
        t: 'config',
        config: this.config,
        hostCid: this.host.cid,
        hostEpoch: this.host.epoch,
        round: this.voting.round,
      },
      peerId,
    );
  }

  private handlePeerJoin(peerId: string): void {
    if (this.stopped || this.status === 'removed') return;
    this.sawPeer = true;
    if (this.observer) return;
    this.send(this.presence(), peerId);
    if (this.status === 'ready') this.sendRoomConfig(peerId);
  }

  // A reload reconnects with a new peer id, so removal waits briefly before it counts.
  private handlePeerLeave(peerId: string): void {
    const cid = this.cidByPeer.get(peerId);
    this.cidByPeer.delete(peerId);
    if (!cid || cid === this.selfCid) return;
    this.cancelPendingRemoval(cid);
    this.pendingRemoval.set(
      cid,
      setTimeout(() => {
        this.pendingRemoval.delete(cid);
        const stillConnected = [...this.cidByPeer.values()].includes(cid);
        if (!this.stopped && !stillConnected) this.removeMember(cid);
      }, this.timing.peerLeaveGraceMs),
    );
  }

  private cancelPendingRemoval(cid: string): void {
    const timer = this.pendingRemoval.get(cid);
    if (timer) clearTimeout(timer);
    this.pendingRemoval.delete(cid);
  }

  private handleMessage(data: unknown, peerId: string): void {
    if (this.stopped || this.status === 'removed' || this.status === 'not-found') return;
    const message = parseMsg(data);
    if (!message || message.from === this.selfCid || this.isIgnored(message)) return;

    this.cidByPeer.set(peerId, message.from);
    this.cancelPendingRemoval(message.from);
    this.roster.touch(message.from, this.now());

    this.applyMessage(message);
    if (!this.stopped) this.evaluate();
  }

  // A just-kicked client may still send for a moment; only a fresh join is accepted.
  private isIgnored(message: Msg): boolean {
    const until = this.ignoreUntil.get(message.from);
    if (until === undefined) return false;
    if (message.t === 'join' || this.now() >= until) {
      this.ignoreUntil.delete(message.from);
      return false;
    }
    return true;
  }

  private applyMessage(message: Msg): void {
    const from = message.from;
    switch (message.t) {
      case 'join':
      case 'heartbeat': {
        const member = this.roster.upsert(from, message.name, message.joinedAt, this.now());
        if (message.t === 'heartbeat') this.host.adopt(message.hostCid, message.hostEpoch);
        this.applyRemoteVote(member, message.round, message.commit, message.icon, message.reveal);
        break;
      }
      case 'config':
        this.adoptConfig(message.config, message.hostCid, message.hostEpoch, message.round);
        break;
      case 'vote-commit': {
        const member = this.roster.get(from);
        if (member) this.applyRemoteVote(member, message.round, message.commit, message.icon, member.reveal);
        break;
      }
      case 'reveal': {
        const member = this.roster.get(from);
        if (member) this.voting.applyRemoteReveal(member, message.round, message);
        break;
      }
      case 'reset':
        if (from === this.host.cid && message.round > this.voting.round) this.startRound(message.round);
        break;
      case 'kick':
        if (from !== this.host.cid) break;
        if (message.target === this.selfCid) return this.markRemoved();
        this.ignoreUntil.set(message.target, this.now() + KICK_IGNORE_MS);
        this.removeMember(message.target);
        break;
      case 'leave':
        this.removeMember(from);
        break;
      case 'host-change':
        this.host.adopt(message.hostCid, message.hostEpoch);
        break;
    }
  }

  private removeMember(cid: string): void {
    if (!this.roster.remove(cid)) return;
    this.cancelPendingRemoval(cid);
    for (const [peerId, memberCid] of this.cidByPeer) if (memberCid === cid) this.cidByPeer.delete(peerId);
    if (cid === this.host.cid) this.electHost();
    this.evaluate();
  }

  private expireSilentMembers(): void {
    if (this.stopped) return;
    const now = this.now();
    this.roster.silentSince(now, this.timing.peerTimeoutMs).forEach((cid) => this.removeMember(cid));
    const hostMissing = this.host.isMissingFrom(this.roster.all());
    if (this.status === 'ready' && hostMissing && now - this.readyAt > MISSING_HOST_GRACE_MS) this.electHost();
    this.evaluate();
  }

  private electHost(): void {
    const election = this.host.electFrom(this.roster.all());
    if (election) this.send({ t: 'host-change', ...election });
  }

  private adoptConfig(config: RoomConfig, hostCid: string, hostEpoch: number, round: number): void {
    this.config ??= config;
    this.host.adopt(hostCid, hostEpoch);
    this.adoptRound(round);
    if (this.status === 'connecting') this.becomeReady();
  }

  private becomeReady(): void {
    this.status = 'ready';
    this.readyAt = this.now();
    if (this.observer) return;
    this.roster.joinAfterEveryoneElse();
    this.restoreVote();
    this.send(this.presence());
  }

  private startRound(round: number): void {
    this.voting.startRound(round, this.roster.all());
    this.storage?.save(null);
  }

  private adoptRound(round: number): void {
    if (round > this.voting.round) this.startRound(round);
  }

  private applyRemoteVote(
    member: Member,
    round: number,
    commit: string | null,
    icon: CardIcon | null,
    reveal: RevealPayload | null,
  ): void {
    this.adoptRound(round);
    this.voting.applyRemoteVote(member, round, commit, icon, reveal);
  }

  private persistVote(): void {
    this.storage?.save(this.voting.toSavedVote(this.roster.me));
  }

  private restoreVote(): void {
    const deck = this.deck();
    const commitment = deck && this.voting.restore(this.roster.me, deck, this.storage?.load() ?? null);
    if (commitment) this.send({ t: 'vote-commit', round: this.voting.round, ...commitment });
  }

  private evaluate(): void {
    if (this.stopped && this.status === 'ready') return;
    if (this.status === 'ready') {
      const members = this.roster.all();
      this.voting.syncRevealClock(members, this.now());
      if (this.voting.everyoneVoted(members)) {
        this.revealOwnVote();
        this.schedulePhaseChange();
      }
    }
    this.emit();
  }

  private revealOwnVote(): void {
    const reveal = this.voting.takeOwnReveal(this.roster.me);
    if (reveal) this.send({ t: 'reveal', round: this.voting.round, ...reveal });
  }

  private schedulePhaseChange(): void {
    if (this.phaseTimer) clearTimeout(this.phaseTimer);
    this.phaseTimer = null;
    const now = this.now();
    const next = this.voting.nextPhaseChangeAt(now);
    if (next === null) return;
    this.phaseTimer = setTimeout(
      () => {
        this.phaseTimer = null;
        if (!this.stopped) this.evaluate();
      },
      next - now + TIMER_SLACK_MS,
    );
  }

  private buildSnapshot(): RoomSnapshot {
    return buildSnapshot({
      status: this.status,
      code: this.code,
      config: this.config,
      roster: this.roster,
      host: this.host,
      voting: this.voting,
      now: this.now(),
    });
  }

  private emit(): void {
    const snapshot = this.buildSnapshot();
    const json = JSON.stringify(snapshot);
    if (json === this.lastSnapshotJson) return;
    this.lastSnapshotJson = json;
    this.lastSnapshot = snapshot;
    this.onChange(snapshot);
  }
}
