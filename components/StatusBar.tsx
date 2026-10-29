'use client';

import { useT } from '@/lib/use-translations';
import type { RoomSnapshot } from '@/lib/snapshot';
import { Button } from './Button';
import { RefreshIcon } from './Icons';
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
  return (
    <Button
      variant={primary ? 'primary' : 'secondary'}
      size={primary && !block ? 'lg' : 'md'}
      className={block ? 'w-full' : ''}
      onClick={onClick}
    >
      <RefreshIcon size={18} strokeWidth={2.4} />
      {t.room.newRound}
    </Button>
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
