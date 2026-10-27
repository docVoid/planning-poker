import { ABSTAIN, type Deck, numericValue, sortIndex } from './decks';
import { CARD_ICONS, type CardIcon } from './protocol';
import { sha256Hex } from './sha256';
import type { Stats } from './snapshot';

export function commitFor(round: number, cid: string, value: string, salt: string): string {
  return sha256Hex(`${round}:${cid}:${value}:${salt}`);
}

interface Joiner {
  cid: string;
  joinedAt: number;
}

export function byJoinOrder(a: Joiner, b: Joiner): number {
  return a.joinedAt - b.joinedAt || (a.cid < b.cid ? -1 : a.cid > b.cid ? 1 : 0);
}

export function displayNames(members: (Joiner & { name: string })[]): Record<string, string> {
  const seen = new Map<string, number>();
  const names: Record<string, string> = {};
  for (const member of [...members].sort(byJoinOrder)) {
    const key = member.name.toLocaleLowerCase();
    const occurrence = (seen.get(key) ?? 0) + 1;
    seen.set(key, occurrence);
    names[member.cid] = occurrence === 1 ? member.name : `${member.name} ${occurrence}`;
  }
  return names;
}

export function randomInt(max: number): number {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return buffer[0] % max;
}

export function pickIcon(previous: CardIcon | null): CardIcon {
  const pool = CARD_ICONS.filter((icon) => icon !== previous);
  return pool[randomInt(pool.length)];
}

const MAX_TILT_DEGREES = 3;

export function tiltOf(commit: string): number {
  return (parseInt(commit.slice(0, 4), 16) / 0xffff) * 2 * MAX_TILT_DEGREES - MAX_TILT_DEGREES;
}

export function computeStats(deck: Deck, values: string[]): Stats {
  const counted = values.filter((value) => value !== ABSTAIN);
  const ordered = [...counted].sort((a, b) => sortIndex(deck, a) - sortIndex(deck, b));
  const votesPerValue = new Map<string, number>();
  for (const value of values) votesPerValue.set(value, (votesPerValue.get(value) ?? 0) + 1);
  const tally = [...votesPerValue]
    .map(([value, n]) => ({ value, n }))
    .sort((a, b) => sortIndex(deck, a.value) - sortIndex(deck, b.value));
  const numbers = deck.kind === 'numeric' ? counted.map((value) => numericValue(value) ?? 0) : [];
  return {
    low: ordered[0] ?? null,
    high: ordered[ordered.length - 1] ?? null,
    avg: numbers.length ? numbers.reduce((sum, n) => sum + n, 0) / numbers.length : null,
    consensus: counted.length >= 2 && new Set(counted).size === 1,
    tally,
    counted: counted.length,
  };
}
