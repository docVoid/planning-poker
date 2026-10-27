export type DeckId = 'fibonacci' | 'modified' | 'tshirt' | 'powers' | 'linear';

export const ABSTAIN = 'coffee';

export interface Deck {
  id: DeckId;
  kind: 'numeric' | 'sizes';
  values: string[];
  preview: [string, string, string];
}

export const DECKS: Deck[] = [
  {
    id: 'fibonacci',
    kind: 'numeric',
    values: ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89'],
    preview: ['3', '8', '13'],
  },
  {
    id: 'modified',
    kind: 'numeric',
    values: ['0', '½', '1', '2', '3', '5', '8', '13', '20', '40', '100'],
    preview: ['½', '20', '100'],
  },
  {
    id: 'tshirt',
    kind: 'sizes',
    values: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    preview: ['S', 'M', 'XL'],
  },
  {
    id: 'powers',
    kind: 'numeric',
    values: ['1', '2', '4', '8', '16', '32', '64'],
    preview: ['4', '16', '64'],
  },
  {
    id: 'linear',
    kind: 'numeric',
    values: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    preview: ['3', '6', '10'],
  },
];

export const DEFAULT_DECK: DeckId = 'fibonacci';

const DECKS_BY_ID = Object.fromEntries(DECKS.map((deck) => [deck.id, deck])) as Record<DeckId, Deck>;

export function getDeck(id: DeckId): Deck {
  return DECKS_BY_ID[id];
}

export function isDeckId(id: unknown): id is DeckId {
  return typeof id === 'string' && DECKS.some((d) => d.id === id);
}

export function isAllowedValue(deck: Deck, value: string): boolean {
  return value === ABSTAIN || deck.values.includes(value);
}

export function numericValue(value: string): number | null {
  if (value === '½') return 0.5;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function sortIndex(deck: Deck, value: string): number {
  if (value === ABSTAIN) return Number.MAX_SAFE_INTEGER;
  const i = deck.values.indexOf(value);
  return i < 0 ? Number.MAX_SAFE_INTEGER - 1 : i;
}
