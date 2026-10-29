'use client';

import { type RefObject, useRef, useState } from 'react';
import { useDismiss } from '@/lib/hooks';
import { useT } from '@/lib/use-translations';
import type { SeatInfo } from '@/lib/snapshot';
import { CrossIcon } from './Icons';
import { RemoveConfirmation } from './RemoveConfirmation';
import { SeatAvatar } from './SeatAvatar';
import { SeatCard } from './SeatCard';
import { SeatName } from './SeatName';

interface SeatProps {
  seat: SeatInfo;
  index: number;
  seatCount: number;
  cardWidth: number;
  seatWidth: number;
  revealed: boolean;
  canKick: boolean;
  onKick: (cid: string) => void;
  cardHidden: boolean;
  slotRef?: RefObject<HTMLDivElement | null>;
  compact: boolean;
}

export function Seat({
  seat,
  index,
  seatCount,
  cardWidth,
  seatWidth,
  revealed,
  canKick,
  onKick,
  cardHidden,
  slotRef,
  compact,
}: SeatProps) {
  const t = useT();
  const [confirming, setConfirming] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const avatarSize = Math.round(Math.min(52, Math.max(34, cardWidth * 0.52)));
  const nameSize = cardWidth >= 80 ? 16 : cardWidth >= 60 ? 14 : 13;

  const closeConfirmation = () => setConfirming(false);
  useDismiss(confirming, containerRef, closeConfirmation);

  const avatar = <SeatAvatar cid={seat.cid} name={seat.name} size={avatarSize} isSelf={seat.isSelf} />;
  const name = <SeatName seat={seat} fontSize={nameSize} compact={compact} />;

  return (
    <div
      ref={containerRef}
      className="anim-seat-in relative flex flex-col items-center"
      style={{ width: seatWidth, gap: Math.round(cardWidth * 0.12) + 4, zIndex: confirming ? 40 : undefined }}
    >
      {canKick ? (
        <button
          type="button"
          onClick={() => setConfirming((open) => !open)}
          aria-label={t.room.removeAria(seat.name)}
          aria-expanded={confirming}
          className="group flex max-w-full flex-col items-center gap-1.5 rounded-md text-felt-ink"
        >
          <span className="relative">
            {avatar}
            <span className="absolute -right-2.5 -top-2 grid size-[22px] place-items-center rounded-full border-2 border-felt bg-card-ink opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              <CrossIcon size={10} color="var(--ivory)" strokeWidth={3.5} />
            </span>
          </span>
          {name}
        </button>
      ) : (
        <div className="flex max-w-full flex-col items-center gap-1.5">
          {avatar}
          {name}
        </div>
      )}

      {confirming && (
        <RemoveConfirmation
          name={seat.name}
          top={avatarSize + 36}
          onConfirm={() => {
            closeConfirmation();
            onKick(seat.cid);
          }}
          onCancel={closeConfirmation}
        />
      )}

      <SeatCard
        seat={seat}
        width={cardWidth}
        index={index}
        seatCount={seatCount}
        revealed={revealed}
        hidden={cardHidden}
        slotRef={slotRef}
      />
    </div>
  );
}
