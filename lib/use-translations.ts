'use client';

import { dictionaries } from './i18n';
import { usePrefs } from './prefs';

export function useLang() {
  return usePrefs((state) => state.lang);
}

export function useT() {
  return dictionaries[useLang()];
}
