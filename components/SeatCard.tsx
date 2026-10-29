'use client';

import { type RefObject, useState } from 'react';
import { ABSTAIN } from '@/lib/decks';
import { useLingering } from '@/lib/hooks';
import { useT } from '@/lib/use-translations';
import type { SeatInfo } from '@/lib/snapshot';
import { Card } from './Card';
import { cardMetrics } from '@/lib/card-metrics';

const FLIP_MS = 560;
const FRONT_LINGER_MS = 700;
const REVEAL_STAGGER_MS = 70;
const MAX_REVEAL_DELAY_MS = 600;
const COVER_STAGGER_MS = 40;
const MAX_COVER_DELAY_MS = 400;

interface SeatCardProps {
  seat: SeatInfo;
  width: number;
  index: number;
  seatCount: number;
  revealed: boolean;
  hidden: boolean;
  slotRef?: RefObject<HTMLDivElement | null>;
}

function useVoteAnimation(commit: string | null): string {
  const [seen, setSeen] = useState({ commit, animation: commit ? 'anim-deal' : '' });
  if (seen.commit !== commit) {
    const animation = commit ? (seen.commit ? 'anim-swap' : 'anim-deal') : '';
    setSeen({ commit, animation });
  }
  return seen.animation;
}

export function SeatCard({ seat, width, index, seatCount, revealed, hidden, slotRef }: SeatCardProps) {
  const t = useT();
  const { height } = cardMetrics(width);
  const frontMounted = useLingering(revealed, FRONT_LINGER_MS);
  const animation = useVoteAnimation(seat.commit);

  if (!seat.voted) {
    return (
      <div ref={slotRef} style={{ width, height }}>
        <Card face="empty" w={width} />
      </div>
    );
  }

  const flipDelay = revealed
    ? Math.min(index * REVEAL_STAGGER_MS, MAX_REVEAL_DELAY_MS)
    : Math.min((seatCount - 1 - index) * COVER_STAGGER_MS, MAX_COVER_DELAY_MS);

  return (
    <div
      ref={slotRef}
      style={{
        width,
        height,
        visibility: hidden ? 'hidden' : undefined,
        perspective: 900,
        transform: `rotate(${revealed ? 0 : seat.tilt}deg)`,
        transition: 'transform 400ms cubic-bezier(.2,.8,.2,1)',
      }}
    >
      <div key={seat.commit} className={animation} style={{ width, height }}>
        <div
          style={{
            position: 'relative',
            width,
            height,
            transformStyle: 'preserve-3d',
            transform: `rotateY(${revealed ? 0 : 180}deg)`,
            transition: `transform ${FLIP_MS}ms cubic-bezier(.45,0,.2,1) ${flipDelay}ms`,
          }}
        >
          <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden' }}>
            {frontMounted && <Front seat={seat} width={width} coffeeLabel={t.room.coffee} quip={t.room.quip} />}
          </div>
          <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <Card face="back" w={width} icon={seat.icon} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Front({
  seat,
  width,
  coffeeLabel,
  quip,
}: {
  seat: SeatInfo;
  width: number;
  coffeeLabel: string;
  quip: string;
}) {
  if (seat.invalid) return <Card face="front" w={width} value="?" />;
  if (seat.value === ABSTAIN) return <Card face="abstain" w={width} label={coffeeLabel} quip={quip} />;
  return <Card face="front" w={width} value={seat.value ?? ''} />;
}
