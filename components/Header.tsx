'use client';

import Link from 'next/link';
import { LANGS, type Lang } from '@/lib/i18n';
import { usePrefs } from '@/lib/prefs';
import { useT } from '@/lib/use-translations';

export function Logo({ size = 40 }: { size?: number }) {
  return (
    <span className="relative inline-block shrink-0" style={{ width: size, height: size }}>
      <img src="/jnnk-logo-light.png" alt="jnnk" width={size} height={size} className="logo-light absolute inset-0" />
      <img
        src="/jnnk-logo-dark.png"
        alt=""
        aria-hidden
        width={size}
        height={size}
        className="logo-dark absolute inset-0"
      />
    </span>
  );
}

export function LanguageSwitch({ compact = false }: { compact?: boolean }) {
  const lang = usePrefs((s) => s.lang);
  const setLang = usePrefs((s) => s.setLang);
  const t = useT();

  if (compact) {
    const next: Lang = lang === 'en' ? 'de' : 'en';
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
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={lang === l}
          onClick={() => setLang(l)}
          className={`min-w-11 px-3.5 font-mono text-[13px] font-semibold ${
            lang === l ? 'bg-ink text-bg' : 'bg-transparent text-ink'
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export function ThemeSwitch() {
  const theme = usePrefs((s) => s.theme);
  const setTheme = usePrefs((s) => s.setTheme);
  const t = useT();
  const dark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      aria-label={dark ? t.theme.toLight : t.theme.toDark}
      className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-line bg-surface text-ink"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        {dark ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        ) : (
          <path d="M19.5 14.5A8 8 0 1 1 9.5 4.5a6.5 6.5 0 0 0 10 10z" />
        )}
      </svg>
    </button>
  );
}

export function SiteHeader() {
  const t = useT();
  return (
    <header className="flex h-[72px] shrink-0 items-center justify-between gap-6 border-b-2 border-line px-4 sm:px-8 lg:px-12">
      <Link href="/" className="flex items-center gap-4">
        <Logo />
        <span className="font-display text-2xl font-extrabold uppercase tracking-[.02em]">{t.appName}</span>
      </Link>
      <div className="flex items-center gap-3">
        <LanguageSwitch />
        <ThemeSwitch />
      </div>
    </header>
  );
}
