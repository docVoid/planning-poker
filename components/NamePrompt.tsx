'use client';

import Link from 'next/link';
import { useId, useState } from 'react';
import { MAX_NAME_LENGTH, formatRoomCode, sanitizeName } from '@/lib/ids';
import { useT } from '@/lib/use-translations';
import type { RoomConfig } from '@/lib/protocol';
import { Button } from './Button';
import { CardFan } from './CardFan';
import { SiteHeader } from './SiteHeader';
import { TextField } from './TextField';

interface NamePromptProps {
  code: string;
  peek: { config: RoomConfig; others: number } | null;
  onSubmit: (name: string) => void;
}

export function NamePrompt({ code, peek, onSubmit }: NamePromptProps) {
  const t = useT();
  const [name, setName] = useState('');
  const headingId = useId();
  const cleanName = sanitizeName(name);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (cleanName) onSubmit(cleanName);
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <section
          aria-labelledby={headingId}
          className="w-full max-w-[460px] overflow-hidden rounded-[28px] border-2 border-line bg-surface shadow-[6px_6px_0_var(--shadow)]"
        >
          <div className="felt flex justify-center border-b-2 border-line px-6 pb-3 pt-8">
            <CardFan cardWidth={76} />
          </div>
          <form onSubmit={submit} className="flex flex-col gap-[18px] p-6 sm:p-8">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-[.08em] text-muted">{t.invite.invited}</span>
              <h1
                id={headingId}
                className="font-display text-[44px] font-black uppercase leading-[.92]"
                style={{ textShadow: '3px 2px 0 var(--yellow)' }}
              >
                {peek ? peek.config.name : t.invite.room}
              </h1>
              {peek ? (
                <span className="text-[15px] text-muted">
                  {t.room.players(peek.others)} · {t.deckTitle[peek.config.deck]}
                </span>
              ) : (
                <span className="font-mono text-[15px] font-semibold tracking-[.1em] text-muted">
                  {t.invite.code(formatRoomCode(code))}
                </span>
              )}
            </div>
            <TextField
              label={t.home.name}
              value={name}
              onChange={setName}
              placeholder={t.home.namePh}
              maxLength={MAX_NAME_LENGTH}
              autoComplete="nickname"
              autoFocus
            />
            <Button type="submit" size="lg" disabled={!cleanName}>
              {t.invite.btn}
            </Button>
            <Link href="/" className="self-center text-sm text-ink underline underline-offset-[3px]">
              {t.invite.other}
            </Link>
          </form>
        </section>
      </main>
    </div>
  );
}
