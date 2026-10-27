'use client';

import { useEffect, useRef, useState } from 'react';
import { getDeck } from '@/lib/decks';
import { useIsCompact, useNow, usePrefersReducedMotion } from '@/lib/hooks';
import { useT } from '@/lib/use-translations';
import { useRoomStore } from '@/lib/room-store';
import type { ReadyRoomSnapshot, RoomSnapshot } from '@/lib/snapshot';
import { type Flight, FlyingCard } from './FlyingCard';
import { Hand } from './Hand';
import { RoomHeader } from './RoomHeader';
import { NewRoundButton, StatusBar } from './StatusBar';
import { Table } from './Table';

const COUNTDOWN_STEPS = 3;
const COUNTDOWN_REFRESH_MS = 80;

function countdownDigit(snapshot: RoomSnapshot, now: number): number | null {
  if (snapshot.phase !== 'revealing' || snapshot.revealStartedAt === null) return null;
  const remainingMs = snapshot.revealStartedAt + snapshot.countdownMs - now;
  const digit = Math.ceil(remainingMs / (snapshot.countdownMs / COUNTDOWN_STEPS));
  return Math.max(1, Math.min(COUNTDOWN_STEPS, digit));
}

export function RoomView({ snapshot }: { snapshot: ReadyRoomSnapshot }) {
  const t = useT();
  const session = useRoomStore((state) => state.session);
  const compact = useIsCompact();
  const reducedMotion = usePrefersReducedMotion();
  const [flight, setFlight] = useState<Flight | null>(null);
  const flightCount = useRef(0);
  const selfSlotRef = useRef<HTMLDivElement>(null);

  const { config } = snapshot;
  const deck = getDeck(config.deck);
  const me = snapshot.seats.find((seat) => seat.isSelf);
  const now = useNow(snapshot.phase === 'revealing' ? COUNTDOWN_REFRESH_MS : null);

  useEffect(() => {
    document.title = `${config.name} · Planning Poker`;
  }, [config.name]);

  function playCard(value: string, from: DOMRect) {
    if (!session || snapshot.locked) return;
    const isFirstThrow = !me?.voted;
    session.vote(value);
    if (!isFirstThrow || reducedMotion) return;
    const mine = session.getSnapshot().seats.find((seat) => seat.isSelf);
    if (mine?.icon) setFlight({ key: ++flightCount.current, value, from, tilt: mine.tilt, icon: mine.icon });
  }

  const startNewRound = () => session?.newRound();
  const canStartNewRound =
    snapshot.isHost && (snapshot.phase === 'revealed' || snapshot.votedCount > 0 || snapshot.round > 0);

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <RoomHeader name={config.name} count={snapshot.seats.length} compact={compact} />
      <main className="flex min-h-0 flex-1 flex-col gap-2 px-3 pb-3 pt-2 md:gap-4 md:px-8 md:pb-[18px] md:pt-[18px]">
        <StatusBar snapshot={snapshot} compact={compact} onNewRound={startNewRound} />
        <Table
          seats={snapshot.seats}
          phase={snapshot.phase}
          compact={compact}
          canKick={snapshot.isHost}
          onKick={(cid) => session?.kick(cid)}
          hideSelfCard={flight !== null}
          selfSlotRef={selfSlotRef}
          countdown={countdownDigit(snapshot, now)}
        />
        {compact && snapshot.phase === 'revealed' && !snapshot.isHost && (
          <p className="text-center text-sm text-muted">{t.room.waitHost}</p>
        )}
        {compact && canStartNewRound && snapshot.phase !== 'revealing' && (
          <NewRoundButton onClick={startNewRound} primary={snapshot.phase === 'revealed'} block />
        )}
      </main>
      <Hand
        deck={deck}
        deckTitle={t.deckTitle[config.deck]}
        selected={snapshot.myValue}
        locked={snapshot.locked}
        compact={compact}
        onPick={playCard}
      />
      {flight && <FlyingCard key={flight.key} flight={flight} targetRef={selfSlotRef} onDone={() => setFlight(null)} />}
    </div>
  );
}
