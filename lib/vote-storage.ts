import type { CardIcon } from './protocol';
import { tabStorage } from './tab-storage';

export interface SavedVote {
  cid: string;
  round: number;
  value: string;
  salt: string;
  icon: CardIcon;
}

export interface VoteStorage {
  load(): SavedVote | null;
  save(vote: SavedVote | null): void;
}

export function createSessionVoteStorage(code: string): VoteStorage {
  const key = `pp:vote:${code}`;
  return {
    load() {
      const raw = tabStorage.get(key);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as SavedVote;
      } catch {
        return null;
      }
    },
    save(vote) {
      if (vote) tabStorage.set(key, JSON.stringify(vote));
      else tabStorage.remove(key);
    },
  };
}
