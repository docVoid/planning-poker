'use client';

import { useId } from 'react';
import { DECKS, type Deck, type DeckId } from '@/lib/decks';
import { useT } from '@/lib/use-translations';
import { Card } from './Card';
import { CheckIcon } from './Icons';

const PREVIEW_CARD_WIDTH = 30;
const PREVIEW_POSES = [
  { transform: 'rotate(-12deg) translate(14px,6px)', className: '' },
  { transform: 'translateY(-4px)', className: 'z-10' },
  { transform: 'rotate(12deg) translate(-14px,6px)', className: 'z-20' },
];

interface DeckPickerProps {
  value: DeckId;
  onChange: (deck: DeckId) => void;
}

export function DeckPicker({ value, onChange }: DeckPickerProps) {
  const t = useT();
  const groupName = useId();
  return (
    <fieldset className="m-0 flex min-h-0 flex-1 flex-col gap-3 border-0 p-0">
      <legend className="mb-3 p-0 text-xs font-bold uppercase tracking-[.08em]">{t.home.deck}</legend>
      <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {DECKS.map((deck) => (
          <DeckTile
            key={deck.id}
            deck={deck}
            title={t.deckTitle[deck.id]}
            groupName={groupName}
            selected={deck.id === value}
            onSelect={() => onChange(deck.id)}
          />
        ))}
      </div>
    </fieldset>
  );
}

interface DeckTileProps {
  deck: Deck;
  title: string;
  groupName: string;
  selected: boolean;
  onSelect: () => void;
}

function DeckTile({ deck, title, groupName, selected, onSelect }: DeckTileProps) {
  const stateClass = selected
    ? '-translate-y-1 border-[3px] border-primary shadow-[4px_4px_0_var(--card-ink)]'
    : 'border-2 border-card-ink shadow-[0_2px_0_rgba(0,0,0,.3)] hover:-translate-y-0.5';
  return (
    <label
      className={`relative flex cursor-pointer flex-col items-stretch gap-2.5 rounded-[14px] bg-paper p-4 text-card-ink transition-transform duration-150 has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-yellow ${stateClass}`}
    >
      <input type="radio" name={groupName} value={deck.id} checked={selected} onChange={onSelect} className="sr-only" />
      {selected && (
        <span className="absolute -right-3 -top-3 grid size-[30px] place-items-center rounded-full border-2 border-card-ink bg-primary">
          <CheckIcon size={16} strokeWidth={3.2} color="var(--on-primary)" />
        </span>
      )}
      <div className="relative flex h-[78px] items-center justify-center" aria-hidden="true">
        {PREVIEW_POSES.map((pose, index) => (
          <div key={pose.transform} className={pose.className} style={{ transform: pose.transform }}>
            <Card face="front" w={PREVIEW_CARD_WIDTH} value={deck.preview[index]} />
          </div>
        ))}
      </div>
      <span className="text-[17px] font-bold leading-tight">{title}</span>
      <span className="font-mono text-xs font-medium leading-relaxed text-stone [word-spacing:.15em]">
        {deck.values.join(' ')}
      </span>
    </label>
  );
}
