'use client';

import { useT } from '@/lib/use-translations';
import type { RoomSnapshot } from '@/lib/snapshot';
import { ResultBar } from './ResultBar';

interface StatusBarProps {
  snapshot: RoomSnapshot;
  compact: boolean;
  onNewRound: () => void;
}

export function NewRoundButton({
  onClick,
  primary,
  block,
}: {
  onClick: () => void;
  primary: boolean;
  block?: boolean;
}) {
  const t = useT();
  const size = block
    ? 'h-12 w-full text-base'
    : primary
      ? 'h-[52px] px-[26px] text-[17px]'
      : 'h-12 px-[22px] text-base';
  const tone = primary
    ? 'border-card-ink bg-primary text-on-primary shadow-[4px_4px_0_var(--shadow)]'
    : 'hard-shadow-sm border-line bg-sec-bg text-sec-ink';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center justify-center gap-2.5 whitespace-nowrap rounded-lg border-2 font-bold ${size} ${tone}`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7" />
      </svg>
      {t.room.newRound}
    </button>
  );
}

export function StatusBar({ snapshot, compact, onNewRound }: StatusBarProps) {
  const t = useT();
  const { phase, seats, isHost } = snapshot;
  const canResetRound = isHost && (snapshot.votedCount > 0 || snapshot.round > 0);

  return (
    <div className="flex min-h-14 shrink-0 items-center justify-between gap-4 md:h-[72px] md:gap-6">
      {phase === 'voting' && (
        <>
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex min-w-0 flex-col gap-0.5 md:gap-1">
              <span className="text-base font-bold md:text-xl">{t.room.waiting}</span>
              <span className="text-[13px] text-muted md:text-sm" aria-live="polite">
                {t.room.votedOf(snapshot.votedCount, seats.length)}
              </span>
            </div>
            <div className="hidden flex-wrap gap-[5px] sm:flex" aria-hidden="true">
              {seats.map((seat) => (
                <span
                  key={seat.cid}
                  className="h-4 w-3 rounded-[3px] border-2 border-line"
                  style={{ background: seat.voted ? 'var(--card-red)' : 'transparent' }}
                />
              ))}
            </div>
          </div>
          {canResetRound && !compact && <NewRoundButton onClick={onNewRound} primary={false} />}
        </>
      )}

      {phase === 'revealing' && (
        <div className="flex min-w-0 flex-1 items-center gap-3.5">
          <span
            role="status"
            className="inline-flex min-h-11 items-center rounded-lg border-2 border-card-ink bg-yellow px-4 py-1 text-[15px] font-bold text-card-ink md:text-lg"
          >
            {t.room.revealing}
          </span>
          <span className="hidden text-sm text-muted sm:inline">{t.room.votedOf(seats.length, seats.length)}</span>
        </div>
      )}

      {phase === 'revealed' && snapshot.stats && <ResultBar stats={snapshot.stats} compact={compact} />}
      {phase === 'revealed' &&
        !compact &&
        (isHost ? (
          <NewRoundButton onClick={onNewRound} primary />
        ) : (
          <span className="max-w-[200px] shrink-0 text-right text-sm text-muted">{t.room.waitHost}</span>
        ))}
    </div>
  );
}
