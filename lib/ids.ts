import { tabStorage } from './tab-storage';

export const MAX_NAME_LENGTH = 24;
export const MAX_ROOM_NAME_LENGTH = 48;

const ROOM_CODE_PATTERN = /^[0-9a-f]{8}$/;
const CLIENT_ID_PATTERN = /^[0-9a-f]{16}$/;
const CLIENT_ID_KEY = 'pp:cid';
const CONTROL_CHARACTERS = /\p{Cc}/gu;

export function randomHex(bytes: number): string {
  const buffer = new Uint8Array(bytes);
  crypto.getRandomValues(buffer);
  return Array.from(buffer, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function createRoomCode(): string {
  return randomHex(4);
}

export function isValidRoomCode(code: string): boolean {
  return ROOM_CODE_PATTERN.test(code);
}

export function parseRoomCode(input: string): string | null {
  const lastSegment =
    input
      .trim()
      .split(/[/?#\s]+/)
      .filter(Boolean)
      .pop() ?? '';
  const code = lastSegment.toLowerCase();
  return isValidRoomCode(code) ? code : null;
}

export function formatRoomCode(code: string): string {
  return code.toUpperCase();
}

export function getClientId(): string {
  const stored = tabStorage.get(CLIENT_ID_KEY);
  if (stored && CLIENT_ID_PATTERN.test(stored)) return stored;
  const created = randomHex(8);
  tabStorage.set(CLIENT_ID_KEY, created);
  return created;
}

function cleanText(raw: string, maxLength: number): string {
  return raw.replace(CONTROL_CHARACTERS, '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

export function sanitizeName(raw: string): string {
  return cleanText(raw, MAX_NAME_LENGTH);
}

export function sanitizeRoomName(raw: string): string {
  return cleanText(raw, MAX_ROOM_NAME_LENGTH);
}
