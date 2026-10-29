'use client';

import { LANGS, type Lang } from '@/lib/i18n';
import { usePrefs } from '@/lib/prefs';
import { useT } from '@/lib/use-translations';

const nextLang = (lang: Lang): Lang => LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length];

export function LanguageSwitch({ compact = false }: { compact?: boolean }) {
  const lang = usePrefs((state) => state.lang);
  const setLang = usePrefs((state) => state.setLang);
  const t = useT();

  if (compact) {
    const next = nextLang(lang);
    return (
      <button
        type="button"
        onClick={() => setLang(next)}
        aria-label={`${t.language}: ${next.toUpperCase()}`}
        className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-line bg-surface font-mono text-[13px] font-semibold text-ink"
      >
        {lang.toUpperCase()}
      </button>
    );
  }

  return (
    <div role="group" aria-label={t.language} className="flex h-10 overflow-hidden rounded-full border-2 border-line">
      {LANGS.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={lang === option}
          onClick={() => setLang(option)}
          className={`min-w-11 px-3.5 font-mono text-[13px] font-semibold ${
            lang === option ? 'bg-ink text-bg' : 'bg-transparent text-ink'
          }`}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
