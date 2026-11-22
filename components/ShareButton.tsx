'use client';

import { type ReactNode, useState } from 'react';
import { roomUrl, showShareSheet, useHasSystemShareSheet } from '@/lib/share';
import { useT } from '@/lib/use-translations';
import { QrIcon, ShareIcon } from './Icons';
import { InviteDialog } from './InviteDialog';

interface ShareButtonProps {
  roomName: string;
  compact: boolean;
}

export function ShareButton({ roomName, compact }: ShareButtonProps) {
  const t = useT();
  const hasSystemShareSheet = useHasSystemShareSheet();
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);

  const openInviteDialog = () => setInviteUrl(roomUrl());

  async function openShareSheet() {
    const url = roomUrl();
    const shown = await showShareSheet({ title: roomName, text: t.share.message(roomName), url });
    if (!shown) setInviteUrl(url);
  }

  return (
    <>
      <ActionButton
        label={t.share.invite}
        icon={<ShareIcon size={18} strokeWidth={2.2} />}
        iconOnly={compact || hasSystemShareSheet}
        onClick={hasSystemShareSheet ? openShareSheet : openInviteDialog}
      />
      {hasSystemShareSheet && (
        <ActionButton
          label={t.share.showQr}
          icon={<QrIcon size={18} strokeWidth={2.2} />}
          iconOnly
          onClick={openInviteDialog}
        />
      )}
      <InviteDialog url={inviteUrl} roomName={roomName} onClose={() => setInviteUrl(null)} />
    </>
  );
}

interface ActionButtonProps {
  label: string;
  icon: ReactNode;
  iconOnly: boolean;
  onClick: () => void;
}

function ActionButton({ label, icon, iconOnly, onClick }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex shrink-0 items-center justify-center gap-2 rounded-lg border-2 border-line bg-surface text-[15px] font-semibold text-ink ${
        iconOnly ? 'size-11' : 'h-10 px-3.5'
      }`}
    >
      {icon}
      {!iconOnly && <span className="whitespace-nowrap">{label}</span>}
    </button>
  );
}
