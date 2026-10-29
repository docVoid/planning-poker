'use client';

import { useT } from '@/lib/use-translations';
import { CreateForm } from './CreateForm';
import { SiteHeader } from './SiteHeader';
import { JoinForm } from './JoinForm';
import { Hydrated } from './Providers';

export function Home() {
  const t = useT();
  return (
    <Hydrated>
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="grid flex-1 gap-8 px-4 py-8 sm:px-8 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:gap-10 lg:px-12 lg:py-10">
          <div className="flex min-h-0 flex-col justify-between gap-7">
            <div className="flex flex-col gap-5">
              <h1
                className="font-display font-black uppercase leading-[.84] tracking-[-.01em]"
                style={{ fontSize: 'clamp(72px, 9vw, 116px)', textShadow: '5px 4px 0 var(--yellow)' }}
              >
                Planning
                <br />
                Poker.
              </h1>
              <p className="max-w-[400px] text-lg leading-snug text-pretty">{t.tagline}</p>
            </div>
            <JoinForm />
          </div>
          <CreateForm />
        </main>
      </div>
    </Hydrated>
  );
}
