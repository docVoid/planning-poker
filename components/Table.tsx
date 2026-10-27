'use client';

import type { RefObject } from 'react';
import { useElementSize } from '@/lib/hooks';
import { chunk, layoutSeats } from '@/lib/layout';
import { useT } from '@/lib/use-translations';
import type { Phase, SeatInfo } from '@/lib/snapshot';
import { Seat } from './Seat';

interface TableProps {
  seats: SeatInfo[];
  phase: Phase;
  compact: boolean;
  canKick: boolean;
  onKick: (cid: string) => void;
  hideSelfCard: boolean;
  selfSlotRef: RefObject<HTMLDivElement | null>;
  countdown: number | null;
}

export function Table({ seats, phase, compact, canKick, onKick, hideSelfCard, selfSlotRef, countdown }: TableProps) {
  const t = useT();
  const [ref, size] = useElementSize<HTMLElement>();
  const layout = layoutSeats(size.width, size.height, seats.length, compact);
  const rows = chunk(seats, layout.cols);
  const seatIndex = new Map(seats.map((seat, index) => [seat.cid, index]));

  return (
    <section
      ref={ref}
      aria-label="Table"
      className="felt relative flex min-h-0 flex-1 flex-col items-center justify-center border-2 border-line"
      style={{
        borderRadius: compact ? 20 : 32,
        boxShadow: `inset 0 0 0 ${compact ? 6 : 10}px var(--felt-deep)`,
        gap: layout.gapY,
      }}
    >
      {phase === 'revealing' && countdown !== null && (
        <div
          role="status"
          className="absolute left-1/2 top-3 z-20 flex -translate-x-1/2 items-center gap-2.5 whitespace-nowrap rounded-full border-2 border-card-ink bg-paper py-1.5 pl-[18px] pr-2 text-[15px] font-bold text-card-ink md:top-[22px]"
        >
          {t.room.revealIn}
          <span
            key={countdown}
            className="anim-count grid size-[34px] place-items-center rounded-full bg-(--card-red) font-display text-[22px] font-black text-ivory"
          >
            {countdown}
          </span>
        </div>
      )}
      {rows.map((row) => (
        <div key={row[0].cid} className="flex justify-center" style={{ gap: layout.gapX }}>
          {row.map((seat) => (
            <Seat
              key={seat.cid}
              seat={seat}
              index={seatIndex.get(seat.cid) ?? 0}
              seatCount={seats.length}
              cardWidth={layout.cardW}
              seatWidth={layout.seatW}
              revealed={phase === 'revealed'}
              canKick={canKick && !seat.isSelf}
              onKick={onKick}
              cardHidden={seat.isSelf && hideSelfCard}
              slotRef={seat.isSelf ? selfSlotRef : undefined}
              compact={compact}
            />
          ))}
        </div>
      ))}
    </section>
  );
}
