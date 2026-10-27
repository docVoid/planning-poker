import type { DeckId } from './decks';

export type Lang = 'en' | 'de';
export const LANGS: Lang[] = ['en', 'de'];
export const DEFAULT_LANG: Lang = 'en';

const en = {
  appName: 'Planning Poker',
  tagline: 'Estimate together, in real time. No sign-up: open a room, share the link, deal the cards.',
  theme: { toLight: 'Switch to light theme', toDark: 'Switch to dark theme' },
  language: 'Language',
  deckTitle: {
    fibonacci: 'Fibonacci',
    modified: 'Modified Fibonacci',
    tshirt: 'T-Shirt sizes',
    powers: 'Powers of two',
    linear: 'Linear',
  } satisfies Record<DeckId, string>,
  home: {
    joinTitle: 'Join room',
    joinBtn: 'Join room',
    code: 'Room code',
    codePh: 'e.g. 3F9A1C07',
    name: 'Your name',
    namePh: 'What should we call you?',
    createTitle: 'Create room',
    createSub: 'You’ll be the host of this room.',
    roomName: 'Room name',
    roomPh: 'e.g. Sprint 42 · Refinement',
    defaultRoomName: 'Planning Poker',
    deck: 'Choose a deck',
    createBtn: 'Create room',
    errCode: 'That doesn’t look like a room code (8 characters, 0–9 and A–F).',
    errName: 'Please enter your name.',
  },
  invite: {
    invited: 'You’re invited to',
    room: 'a planning poker room',
    code: (c: string) => `Room ${c}`,
    btn: 'Take a seat',
    other: 'Not for you? Start your own room',
  },
  room: {
    players: (n: number) => (n === 1 ? '1 player' : `${n} players`),
    copy: 'Copy link',
    copied: 'Link copied',
    waiting: 'Waiting for others',
    votedOf: (n: number, total: number) => `${n} of ${total} voted`,
    revealing: 'Everyone has voted — revealing',
    revealIn: 'Revealing in',
    newRound: 'New round',
    low: 'Lowest',
    high: 'Highest',
    avg: 'Average',
    consensus: 'Consensus',
    consensusSub: (v: string) => `Everyone said ${v}`,
    votes: 'Votes',
    hand: 'Your hand',
    you: 'You',
    host: 'Host',
    removeBtn: 'Remove',
    removeAria: (n: string) => `Remove ${n} from the room`,
    removeAsk: (n: string) => `Remove ${n} from the room?`,
    cancel: 'Cancel',
    locked: 'Locked until the next round',
    played: (v: string) => `You played ${v} · change it until the reveal`,
    sittingOut: 'You’re sitting this one out',
    pickCard: 'Pick a card',
    playAria: (v: string) => `Play ${v}`,
    abstainAria: 'Coffee break, abstain',
    coffee: 'Coffee',
    quip: 'Need coffee first.',
    waitHost: 'The host starts the next round.',
    connecting: 'Connecting to the room…',
    connectingSub: 'Looking for the other players. This can take a few seconds.',
  },
  states: {
    removedTitle: 'You were removed from the room',
    removedBody: 'The host took your seat away. You can sit down again right away if you like.',
    rejoin: 'Rejoin room',
    notFoundTitle: 'Room not found or already ended',
    notFoundBody:
      'Nobody is at this table. Rooms only exist while at least one person is in them. Check the code, or start a new room.',
    retry: 'Try again',
    backHome: 'Back to start',
  },
};

export type Translations = typeof en;

const de: Translations = {
  appName: 'Planning Poker',
  tagline: 'Gemeinsam schätzen, in Echtzeit. Ohne Anmeldung: Raum öffnen, Link teilen, Karten austeilen.',
  theme: { toLight: 'Zum hellen Design wechseln', toDark: 'Zum dunklen Design wechseln' },
  language: 'Sprache',
  deckTitle: {
    fibonacci: 'Fibonacci',
    modified: 'Modifizierte Fibonacci',
    tshirt: 'T-Shirt-Größen',
    powers: 'Zweierpotenzen',
    linear: 'Linear',
  },
  home: {
    joinTitle: 'Raum beitreten',
    joinBtn: 'Beitreten',
    code: 'Raumcode',
    codePh: 'z. B. 3F9A1C07',
    name: 'Dein Name',
    namePh: 'Wie sollen wir dich nennen?',
    createTitle: 'Raum erstellen',
    createSub: 'Du leitest diesen Raum.',
    roomName: 'Raumname',
    roomPh: 'z. B. Sprint 42 · Refinement',
    defaultRoomName: 'Planning Poker',
    deck: 'Deck wählen',
    createBtn: 'Raum erstellen',
    errCode: 'Das sieht nicht nach einem Raumcode aus (8 Zeichen, 0–9 und A–F).',
    errName: 'Bitte gib deinen Namen ein.',
  },
  invite: {
    invited: 'Du bist eingeladen zu',
    room: 'einem Planning-Poker-Raum',
    code: (c: string) => `Raum ${c}`,
    btn: 'Platz nehmen',
    other: 'Nicht für dich? Eigenen Raum starten',
  },
  room: {
    players: (n: number) => (n === 1 ? '1 Person' : `${n} Personen`),
    copy: 'Link kopieren',
    copied: 'Link kopiert',
    waiting: 'Warten auf die anderen',
    votedOf: (n: number, total: number) => `${n} von ${total} haben gewählt`,
    revealing: 'Alle haben gewählt — wird aufgedeckt',
    revealIn: 'Aufdecken in',
    newRound: 'Neue Runde',
    low: 'Niedrigster',
    high: 'Höchster',
    avg: 'Durchschnitt',
    consensus: 'Konsens',
    consensusSub: (v: string) => `Alle sagen ${v}`,
    votes: 'Stimmen',
    hand: 'Deine Hand',
    you: 'Du',
    host: 'Host',
    removeBtn: 'Entfernen',
    removeAria: (n: string) => `${n} aus dem Raum entfernen`,
    removeAsk: (n: string) => `${n} aus dem Raum entfernen?`,
    cancel: 'Abbrechen',
    locked: 'Gesperrt bis zur nächsten Runde',
    played: (v: string) => `Gespielt: ${v} · ändern bis zum Aufdecken`,
    sittingOut: 'Du setzt aus — Kaffeepause',
    pickCard: 'Wähle eine Karte',
    playAria: (v: string) => `Karte ${v} spielen`,
    abstainAria: 'Kaffeepause, Enthaltung',
    coffee: 'Kaffee',
    quip: 'Erst mal Kaffee.',
    waitHost: 'Der Host startet die nächste Runde.',
    connecting: 'Verbinde mit dem Raum …',
    connectingSub: 'Wir suchen die anderen Spielenden. Das kann ein paar Sekunden dauern.',
  },
  states: {
    removedTitle: 'Du wurdest aus dem Raum entfernt',
    removedBody: 'Der Host hat deinen Platz freigegeben. Du kannst dich sofort wieder dazusetzen.',
    rejoin: 'Erneut beitreten',
    notFoundTitle: 'Raum nicht gefunden oder bereits beendet',
    notFoundBody:
      'An diesem Tisch sitzt niemand. Räume gibt es nur, solange mindestens eine Person drin ist. Prüfe den Code oder starte einen neuen Raum.',
    retry: 'Nochmal versuchen',
    backHome: 'Zur Startseite',
  },
};

export const dictionaries: Record<Lang, Translations> = { en, de };
export function isLang(v: unknown): v is Lang {
  return v === 'en' || v === 'de';
}

export function formatNumber(n: number, lang: Lang): string {
  const r = Math.round(n * 10) / 10;
  return new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  }).format(r);
}
