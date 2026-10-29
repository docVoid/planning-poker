'use client';

import { useT } from '@/lib/use-translations';
import { CrossIcon } from './Icons';

interface RemoveConfirmationProps {
  name: string;
  top: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function RemoveConfirmation({ name, top, onConfirm, onCancel }: RemoveConfirmationProps) {
  const t = useT();
  return (
    <div
      role="dialog"
      aria-label={t.room.removeAsk(name)}
      className="absolute left-1/2 z-30 flex min-w-[168px] -translate-x-1/2 flex-col gap-1 rounded-[10px] border-2 border-card-ink bg-ivory p-1 text-card-ink shadow-[3px_3px_0_var(--card-ink)]"
      style={{ top }}
    >
      <span className="px-2.5 pb-0.5 pt-1.5 text-xs text-stone">{t.room.removeAsk(name)}</span>
      <div className="flex gap-1">
        <button
          type="button"
          autoFocus
          onClick={onConfirm}
          className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-md px-2 text-[15px] font-bold text-brick hover:bg-bone"
        >
          <CrossIcon size={15} color="var(--brick)" strokeWidth={2.4} />
          {t.room.removeBtn}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="h-11 rounded-md px-3 text-[15px] font-semibold hover:bg-bone"
        >
          {t.room.cancel}
        </button>
      </div>
    </div>
  );
}
