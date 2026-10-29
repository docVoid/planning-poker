'use client';

import Link from 'next/link';
import { useT } from '@/lib/use-translations';
import { LanguageSwitch } from './LanguageSwitch';
import { Logo } from './Logo';
import { ThemeSwitch } from './ThemeSwitch';

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
