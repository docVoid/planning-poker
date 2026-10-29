import { useT } from '@/lib/use-translations';
import type { SeatInfo } from '@/lib/snapshot';

interface SeatNameProps {
  seat: SeatInfo;
  fontSize: number;
  compact: boolean;
}

export function SeatName({ seat, fontSize, compact }: SeatNameProps) {
  const t = useT();
  const showYouTag = seat.isSelf && !(compact && seat.isHost);
  return (
    <span className="flex max-w-full items-center justify-center gap-1.5">
      <span className="min-w-0 truncate font-semibold" style={{ fontSize }}>
        {seat.name}
      </span>
      {showYouTag && <Tag>{t.room.you}</Tag>}
      {seat.isSelf && !showYouTag && <span className="sr-only">{t.room.you}</span>}
      {seat.isHost && <Tag highlighted>{t.room.host}</Tag>}
    </span>
  );
}

function Tag({ children, highlighted }: { children: React.ReactNode; highlighted?: boolean }) {
  return (
    <span
      className={`shrink-0 rounded-[3px] px-[5px] py-0.5 text-[10px] font-bold uppercase tracking-[.08em] text-card-ink ${
        highlighted ? 'bg-yellow' : 'bg-paper'
      }`}
    >
      {children}
    </span>
  );
}
