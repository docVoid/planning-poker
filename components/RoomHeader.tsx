'use client';

import { useT } from '@/lib/use-translations';
import { PeopleIcon } from './Icons';
import { LanguageSwitch } from './LanguageSwitch';
import { Logo } from './Logo';
import { ThemeSwitch } from './ThemeSwitch';
import { ShareButton } from './ShareButton';

interface RoomHeaderProps {
  name: string;
  count: number;
  compact: boolean;
}

export function RoomHeader({ name, count, compact }: RoomHeaderProps) {
  const t = useT();
  return (
    <header
      className="flex shrink-0 items-center justify-between gap-3 border-b-2 border-line px-3 md:gap-6 md:px-8"
      style={{ height: compact ? 60 : 72 }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-[18px]">
        <Logo size={compact ? 34 : 40} />
        <div className="hidden h-8 w-0.5 shrink-0 bg-line md:block" />
        <h1 className="min-w-0 truncate font-display text-[22px] font-extrabold uppercase leading-none md:text-[30px]">
          {name}
        </h1>
        {!compact && (
          <span className="inline-flex h-[30px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded border-[1.5px] border-line px-2.5 text-sm font-semibold">
            <PeopleIcon size={15} strokeWidth={2.2} />
            {t.room.players(count)}
          </span>
        )}
        <ShareButton compact={compact} />
      </div>
      <div className="flex shrink-0 items-center gap-2 md:gap-3">
        <LanguageSwitch compact={compact} />
        <ThemeSwitch />
      </div>
    </header>
  );
}
