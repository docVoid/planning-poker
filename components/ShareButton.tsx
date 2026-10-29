'use client';

import { useEffect, useRef, useState } from 'react';
import { copyToClipboard } from '@/lib/clipboard';
import { useT } from '@/lib/use-translations';
import { CheckIcon, LinkIcon } from './Icons';

const CONFIRMATION_MS = 1800;

export function ShareButton({ compact }: { compact: boolean }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => void (resetTimer.current && clearTimeout(resetTimer.current)), []);

  async function copyRoomLink() {
    const link = `${window.location.origin}${window.location.pathname}`;
    if (!(await copyToClipboard(link))) return;
    setCopied(true);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied(false), CONFIRMATION_MS);
  }

  return (
    <>
      <button
        type="button"
        onClick={copyRoomLink}
        aria-label={t.room.copy}
        className={`flex shrink-0 items-center justify-center gap-2 rounded-lg border-2 border-line bg-surface text-[15px] font-semibold text-ink ${
          compact ? 'size-11' : 'h-10 px-3.5'
        }`}
      >
        {copied ? <CheckIcon size={17} strokeWidth={2.2} /> : <LinkIcon size={17} strokeWidth={2.2} />}
        {!compact && <span className="whitespace-nowrap">{copied ? t.room.copied : t.room.copy}</span>}
      </button>
      <span role="status" className="sr-only">
        {copied ? t.room.copied : ''}
      </span>
    </>
  );
}
