'use client';

import { ABSTAIN, type Deck } from '@/lib/decks';
import { useElementSize } from '@/lib/hooks';
import type { Translations } from '@/lib/i18n';
import { handCardWidth } from '@/lib/layout';
import { useT } from '@/lib/use-translations';
import { ValueCard } from './Card';

const COMPACT_CARD_WIDTH = 62;
const HAND_PADDING_X = 64;
const LIFT_HEADROOM = 22;

interface HandProps {
  deck: Deck;
  deckTitle: string;
  selected: string | null;
  locked: boolean;
  compact: boolean;
  onPick: (value: string, cardRect: DOMRect) => void;
}

function handNote(t: Translations, selected: string | null, locked: boolean): string {
  if (locked) return t.room.locked;
  if (selected === null) return t.room.pickCard;
  return selected === ABSTAIN ? t.room.sittingOut : t.room.played(selected);
}

function moveFocusWithArrowKeys(event: React.KeyboardEvent<HTMLElement>) {
  const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
  if (!step) return;
  const cards = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
  const current = cards.indexOf(document.activeElement as HTMLButtonElement);
  if (current < 0) return;
  event.preventDefault();
  cards[(current + step + cards.length) % cards.length].focus();
}

export function Hand({ deck, deckTitle, selected, locked, compact, onPick }: HandProps) {
  const t = useT();
  const [rowRef, size] = useElementSize<HTMLDivElement>();
  const values = [...deck.values, ABSTAIN];
  const gap = compact ? 10 : 12;
  const cardWidth = compact
    ? COMPACT_CARD_WIDTH
    : handCardWidth(size.width - HAND_PADDING_X, size.height - LIFT_HEADROOM, values.length, gap);

  return (
    <section
      aria-label={t.room.hand}
      className="flex shrink-0 flex-col gap-1.5 border-t-2 border-line bg-surface2 px-4 pt-3 md:px-8"
      style={{ height: compact ? undefined : 'clamp(150px, 24dvh, 204px)', paddingBottom: compact ? 14 : 0 }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="whitespace-nowrap text-xs font-bold uppercase tracking-[.08em]">
          {t.room.hand} · {deckTitle}
        </span>
        <span className="truncate text-[13px] text-muted md:text-sm" aria-live="polite">
          {handNote(t, selected, locked)}
        </span>
      </div>
      <div
        ref={rowRef}
        onKeyDown={moveFocusWithArrowKeys}
        role="group"
        aria-label={t.room.hand}
        className={`flex min-h-0 flex-1 items-end ${
          compact ? 'scroll-hidden snap-x snap-mandatory overflow-x-auto pb-1 pt-5' : 'justify-center pb-[18px]'
        }`}
        style={{ gap, opacity: locked ? 0.55 : 1, transition: 'opacity 200ms' }}
      >
        {values.map((value) => {
          const isSelected = value === selected;
          return (
            <button
              key={value}
              type="button"
              disabled={locked}
              aria-pressed={isSelected}
              aria-label={value === ABSTAIN ? t.room.abstainAria : t.room.playAria(value)}
              onClick={(event) => onPick(value, event.currentTarget.getBoundingClientRect())}
              className={`block shrink-0 snap-center rounded-[10px] border-0 bg-transparent p-0 transition-transform duration-150 ease-[cubic-bezier(.2,.8,.2,1)] active:scale-[.98] ${liftClass(isSelected, locked)}`}
            >
              <ValueCard value={value} w={cardWidth} selected={isSelected} label={t.room.coffee} quip={t.room.quip} />
            </button>
          );
        })}
        {compact && <span className="w-1 shrink-0" aria-hidden="true" />}
      </div>
    </section>
  );
}

function liftClass(selected: boolean, locked: boolean): string {
  if (selected) return '-translate-y-4 md:-translate-y-5';
  if (locked) return '';
  return 'hover:-translate-y-2.5 hover:-rotate-[1.5deg] focus-visible:-translate-y-2.5 focus-visible:-rotate-[1.5deg]';
}
