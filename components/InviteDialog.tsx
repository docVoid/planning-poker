'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { copyToClipboard } from '@/lib/clipboard';
import { useT } from '@/lib/use-translations';
import { CheckIcon, CrossIcon, LinkIcon } from './Icons';
import { QrCode } from './QrCode';

const CONFIRMATION_MS = 1800;

interface InviteDialogProps {
  url: string | null;
  roomName: string;
  onClose: () => void;
}

export function InviteDialog({ url, roomName, onClose }: InviteDialogProps) {
  const t = useT();
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const open = url !== null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || open === dialog.open) return;
    if (open) dialog.showModal();
    else dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => event.target === event.currentTarget && onClose()}
      className="m-0 mt-auto w-full max-w-none overflow-y-auto rounded-t-[28px] border-2 border-b-0 border-line bg-surface p-0 text-ink backdrop:bg-black/55 sm:m-auto sm:max-w-[420px] sm:rounded-[28px] sm:border-b-2 sm:shadow-[6px_6px_0_var(--shadow)]"
    >
      {url !== null && (
        <div className="flex flex-col gap-4 p-5 pb-6 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 id={titleId} className="font-display text-[32px] font-black uppercase leading-none">
                {t.share.title}
              </h2>
              <p className="mt-1.5 truncate text-[15px] text-muted">{roomName}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.share.close}
              className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-line"
            >
              <CrossIcon size={18} strokeWidth={2.4} />
            </button>
          </div>
          <div className="felt flex justify-center rounded-2xl border-2 border-line px-4 py-7">
            <div className="anim-deal aspect-square w-full max-w-[232px] -rotate-2 rounded-xl border-2 border-card-ink bg-paper p-1.5 shadow-[4px_4px_0_var(--yellow)]">
              <QrCode value={url} />
            </div>
          </div>
          <p className="text-center text-sm text-muted">{t.share.scan}</p>
          <CopyLinkRow url={url} />
        </div>
      )}
    </dialog>
  );
}

function CopyLinkRow({ url }: { url: string }) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), CONFIRMATION_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    if (await copyToClipboard(url)) setCopied(true);
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border-2 border-line bg-input-bg p-1 pl-3.5">
      <span className="line-clamp-2 min-w-0 flex-1 break-all font-mono text-[13px] leading-tight">
        {url.replace(/^https?:\/\//, '')}
      </span>
      <button
        type="button"
        onClick={copy}
        className="flex h-11 shrink-0 items-center gap-2 rounded-lg bg-sec-bg px-3.5 text-[15px] font-bold text-sec-ink"
      >
        {copied ? <CheckIcon size={17} strokeWidth={2.4} /> : <LinkIcon size={17} strokeWidth={2.2} />}
        {copied ? t.share.copied : t.share.copy}
      </button>
      <span role="status" className="sr-only">
        {copied ? t.share.copied : ''}
      </span>
    </div>
  );
}
