'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_LANG, type Lang, isLang } from './i18n';

export type ThemePref = 'light' | 'dark';

interface PrefsState {
  lang: Lang;
  theme: ThemePref;
  hydrated: boolean;
  setLang: (lang: Lang) => void;
  setTheme: (theme: ThemePref) => void;
}

export const usePrefs = create<PrefsState>()(
  persist(
    (set) => ({
      lang: DEFAULT_LANG,
      theme: 'light',
      hydrated: false,
      setLang: (lang) => set({ lang }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'pp:prefs',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({ lang: s.lang, theme: s.theme }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<PrefsState>;
        return {
          ...current,
          lang: isLang(p.lang) ? p.lang : current.lang,
          theme: p.theme === 'dark' ? 'dark' : 'light',
        };
      },
    },
  ),
);
