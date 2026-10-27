'use client';

import { type RefObject, useEffect, useRef, useState } from 'react';
import { avatarColor, initialsOf } from '@/lib/avatar';
import { useT } from '@/lib/use-translations';
import type { SeatInfo } from '@/lib/snapshot';
import { SeatCard } from './SeatCard';

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

  useEffect(() => {
    if (!confirming) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setConfirming(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && setConfirming(false);
    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [confirming]);

  const avatar = (
    <span
      aria-hidden="true"
      className="grid shrink-0 place-items-center rounded-full border-2 border-card-ink font-display font-extrabold text-card-ink"
      style={{
        width: avatarSize,
        height: avatarSize,
        background: avatarColor(seat.cid),
        fontSize: Math.round(avatarSize * 0.38),
        boxShadow: seat.isSelf ? '0 0 0 3px var(--felt), 0 0 0 5px var(--paper)' : undefined,
      }}
    >
      {initialsOf(seat.name)}
    </span>
  );

  const name = (
    <span className="flex max-w-full items-center justify-center gap-1.5">
      <span className="min-w-0 truncate font-semibold" style={{ fontSize: nameSize }}>
        {seat.name}
      </span>
      {seat.isSelf && !(compact && seat.isHost) && <Tag>{t.room.you}</Tag>}
      {seat.isSelf && compact && seat.isHost && <span className="sr-only">{t.room.you}</span>}
      {seat.isHost && <Tag highlighted>{t.room.host}</Tag>}
    </span>
  );

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
        <div
          role="dialog"
          aria-label={t.room.removeAsk(seat.name)}
          className="absolute left-1/2 z-30 flex min-w-[168px] -translate-x-1/2 flex-col gap-1 rounded-[10px] border-2 border-card-ink bg-ivory p-1 text-card-ink shadow-[3px_3px_0_var(--card-ink)]"
          style={{ top: avatarSize + 36 }}
        >
          <span className="px-2.5 pb-0.5 pt-1.5 text-xs text-stone">{t.room.removeAsk(seat.name)}</span>
          <div className="flex gap-1">
            <button
              type="button"
              autoFocus
              onClick={() => {
                setConfirming(false);
                onKick(seat.cid);
              }}
              className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-md px-2 text-[15px] font-bold text-brick hover:bg-bone"
            >
              <CrossIcon size={15} color="var(--brick)" strokeWidth={2.4} />
              {t.room.removeBtn}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="h-11 rounded-md px-3 text-[15px] font-semibold hover:bg-bone"
            >
              {t.room.cancel}
            </button>
          </div>
        </div>
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

function Tag({ children, highlighted }: { children: React.ReactNode; highlighted?: boolean }) {
  return (
    <span
      className={`shrink-0 rounded-[3px] px-[5px] py-0.5 text-[10px] font-bold uppercase tracking-[.08em] text-card-ink ${
        highlighted ? 'bg-yellow' : 'bg-paper'
      }`}
    >
      {children}
    </span>
  );
}

function CrossIcon({ size, color, strokeWidth }: { size: number; color: string; strokeWidth: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
