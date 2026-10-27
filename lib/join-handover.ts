import { isDeckId } from './decks';
import { sanitizeName, sanitizeRoomName } from './ids';
import type { RoomConfig } from './protocol';
import { tabStorage } from './tab-storage';

const DEFAULT_ROOM_NAME = 'Planning Poker';
const configKey = (code: string) => `pp:create:${code}`;
const nameKey = (code: string) => `pp:name:${code}`;
const consumedConfigs = new Map<string, RoomConfig>();

export function rememberName(code: string, name: string): void {
  tabStorage.set(nameKey(code), name);
}

export function recallName(code: string): string {
  return sanitizeName(tabStorage.get(nameKey(code)) ?? '');
}

export function storeCreateConfig(code: string, config: RoomConfig): void {
  tabStorage.set(configKey(code), JSON.stringify(config));
}

// Read once per page load: a reload must not silently re-create an empty room.
export function consumeCreateConfig(code: string): RoomConfig | undefined {
  const cached = consumedConfigs.get(code);
  if (cached) return cached;
  const raw = tabStorage.get(configKey(code));
  if (!raw) return undefined;
  tabStorage.remove(configKey(code));
  const config = parseConfig(raw);
  if (config) consumedConfigs.set(code, config);
  return config;
}

function parseConfig(raw: string): RoomConfig | undefined {
  try {
    const parsed = JSON.parse(raw) as Partial<RoomConfig>;
    if (typeof parsed.name !== 'string' || !isDeckId(parsed.deck)) return undefined;
    return { name: sanitizeRoomName(parsed.name) || DEFAULT_ROOM_NAME, deck: parsed.deck };
  } catch {
    return undefined;
  }
}
