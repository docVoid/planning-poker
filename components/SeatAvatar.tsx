import { avatarColor, initialsOf } from '@/lib/avatar';

interface SeatAvatarProps {
  cid: string;
  name: string;
  size: number;
  isSelf: boolean;
}

export function SeatAvatar({ cid, name, size, isSelf }: SeatAvatarProps) {
  return (
    <span
      aria-hidden="true"
      className="grid shrink-0 place-items-center rounded-full border-2 border-card-ink font-display font-extrabold text-card-ink"
      style={{
        width: size,
        height: size,
        background: avatarColor(cid),
        fontSize: Math.round(size * 0.38),
        boxShadow: isSelf ? '0 0 0 3px var(--felt), 0 0 0 5px var(--paper)' : undefined,
      }}
    >
      {initialsOf(name)}
    </span>
  );
}
