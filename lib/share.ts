import { useSyncExternalStore } from 'react';

export interface SharePayload {
  title: string;
  text: string;
  url: string;
}

const noSubscription = () => () => {};

const supportsSystemShareSheet = () =>
  typeof navigator.share === 'function' && window.matchMedia('(pointer: coarse)').matches;

export function useHasSystemShareSheet(): boolean {
  return useSyncExternalStore(noSubscription, supportsSystemShareSheet, () => false);
}

export async function showShareSheet(payload: SharePayload): Promise<boolean> {
  try {
    await navigator.share(payload);
    return true;
  } catch (error) {
    return isUserDismissal(error);
  }
}

const isUserDismissal = (error: unknown) => error instanceof DOMException && error.name === 'AbortError';

export function roomUrl(): string {
  return `${window.location.origin}${window.location.pathname}`;
}
