import { de } from './de';
import { type Translations, en } from './en';

export type { Translations };
export type Lang = 'en' | 'de';
export const LANGS: Lang[] = ['en', 'de'];
export const DEFAULT_LANG: Lang = 'en';

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
