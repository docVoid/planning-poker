'use client';

import Link from 'next/link';
import { useT } from '@/lib/use-translations';
import { Card } from './Card';
import { CardFan } from './CardFan';
import { SiteHeader } from './Header';

export type StateKind = 'removed' | 'notfound' | 'connecting';

export function StateScreen({ kind, onPrimary }: { kind: StateKind; onPrimary?: () => void }) {
  const t = useT();
  const text =
    kind === 'removed'
      ? { title: t.states.removedTitle, body: t.states.removedBody, primary: t.states.rejoin }
      : kind === 'notfound'
        ? { title: t.states.notFoundTitle, body: t.states.notFoundBody, primary: t.states.retry }
        : { title: t.room.connecting, body: t.room.connectingSub, primary: null };

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="grid flex-1 items-center gap-8 px-4 py-8 sm:px-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14 lg:px-12">
        <div
          aria-hidden="true"
          className="felt relative flex min-h-[220px] items-center justify-center overflow-hidden rounded-[32px] border-2 border-line py-10 shadow-[inset_0_0_0_10px_var(--felt-deep)] md:min-h-[min(520px,70dvh)]"
        >
          {kind === 'removed' && (
            <div className="flex items-center gap-10">
              <Card face="empty" w={96} />
              <div style={{ transform: 'rotate(18deg) translate(34px,-40px)' }}>
                <Card face="back" w={96} icon="plane" />
              </div>
            </div>
          )}
          {kind === 'notfound' && (
            <div className="flex items-center gap-6">
              <Card face="empty" w={72} />
              <div style={{ transform: 'rotate(-7deg) translateY(-6px)' }}>
                <Card face="front" w={104} value="?" />
              </div>
              <Card face="empty" w={72} />
            </div>
          )}
          {kind === 'connecting' && <CardFan cardWidth={88} />}
        </div>

        <div className="flex flex-col gap-5" role={kind === 'connecting' ? 'status' : undefined}>
          <h1
            className="font-display font-black uppercase leading-[.9] text-balance"
            style={{ fontSize: 'clamp(40px, 6vw, 72px)', textShadow: '4px 3px 0 var(--yellow)' }}
          >
            {text.title}
          </h1>
          <p className="max-w-[460px] text-lg leading-relaxed text-pretty">{text.body}</p>
          <div className="mt-2 flex flex-wrap gap-3">
            {text.primary && (
              <button
                type="button"
                onClick={onPrimary}
                className="h-[54px] rounded-lg border-2 border-card-ink bg-primary px-6 text-[17px] font-bold text-on-primary shadow-[4px_4px_0_var(--shadow)]"
              >
                {text.primary}
              </button>
            )}
            <Link
              href="/"
              className="flex h-[54px] items-center justify-center rounded-lg border-2 border-line px-5 text-[17px] font-semibold text-ink"
            >
              {t.states.backHome}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
