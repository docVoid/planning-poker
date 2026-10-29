'use client';

import { usePrefs } from '@/lib/prefs';
import { useT } from '@/lib/use-translations';
import { MoonIcon, SunIcon } from './Icons';

export function ThemeSwitch() {
  const theme = usePrefs((state) => state.theme);
  const setTheme = usePrefs((state) => state.setTheme);
  const t = useT();
  const dark = theme === 'dark';
  const Icon = dark ? SunIcon : MoonIcon;

  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      aria-label={dark ? t.theme.toLight : t.theme.toDark}
      className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-line bg-surface text-ink"
    >
      <Icon size={20} />
    </button>
  );
}
