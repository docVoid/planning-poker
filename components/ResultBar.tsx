'use client';

import { ABSTAIN } from '@/lib/decks';
import { formatNumber } from '@/lib/i18n';
import { useLang, useT } from '@/lib/use-translations';
import type { Stats } from '@/lib/snapshot';

const NO_VALUE = '—';

const cellClass = 'flex flex-col justify-center';
const labelClass = 'text-[10px] font-bold uppercase tracking-[.08em] md:text-[11px]';
const valueClass = 'font-display text-[28px] font-black leading-none md:text-4xl';

export function ResultBar({ stats, compact }: { stats: Stats; compact: boolean }) {
  const t = useT();
  const lang = useLang();

  return (
    <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-5" aria-live="polite">
      <div className="flex h-14 overflow-hidden rounded-xl border-2 border-line bg-surface md:h-[68px]">
        <div className={`${cellClass} min-w-[78px] px-3 md:min-w-24 md:px-5`}>
          <span className={`${labelClass} text-muted`}>{t.room.low}</span>
          <span className={valueClass}>{stats.low ?? NO_VALUE}</span>
        </div>
        <div className="w-0.5 bg-line" />
        <div className={`${cellClass} min-w-[78px] px-3 md:min-w-24 md:px-5`}>
          <span className={`${labelClass} text-muted`}>{t.room.high}</span>
          <span className={valueClass}>{stats.high ?? NO_VALUE}</span>
        </div>
        {stats.avg !== null && (
          <>
            <div className="w-0.5 bg-line" />
            <div className={`${cellClass} min-w-[88px] bg-yellow px-3 text-card-ink md:min-w-[110px] md:px-5`}>
              <span className={labelClass}>{t.room.avg}</span>
              <span className={valueClass}>{formatNumber(stats.avg, lang)}</span>
            </div>
          </>
        )}
      </div>

      {stats.consensus && (
        <div className="hidden items-center gap-3 md:flex">
          <span className="anim-stamp inline-flex h-[38px] items-center rounded border-[3px] border-primary px-3.5 font-display text-2xl font-black uppercase tracking-[.06em] text-primary">
            {t.room.consensus}
          </span>
          <span className="text-sm text-muted">{t.room.consensusSub(stats.low ?? '')}</span>
        </div>
      )}

      {!compact && (
        <div className="hidden items-center gap-2 xl:flex">
          <span className="text-[11px] font-bold uppercase tracking-[.08em] text-muted">{t.room.votes}</span>
          {stats.tally.map(({ value, n }) => (
            <span
              key={value}
              className={`inline-flex h-[30px] items-baseline gap-[3px] rounded border-[1.5px] px-2 pt-1 ${
                value === ABSTAIN ? 'border-card-ink bg-yellow text-card-ink' : 'border-line text-ink'
              }`}
            >
              <b className="font-display text-[17px] font-black">{value === ABSTAIN ? t.room.coffee : value}</b>
              <span className="font-mono text-xs">×{n}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
