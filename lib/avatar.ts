const AVATAR_COLORS = ['#E8644A', '#F2BE2C', '#F29BB2', '#8CCBAE', '#F0973F', '#D9CBAA'];

function hashOf(text: string): number {
  let hash = 0;
  for (const char of text) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return Math.abs(hash);
}

export function avatarColor(cid: string): string {
  return AVATAR_COLORS[hashOf(cid) % AVATAR_COLORS.length];
}

export function initialsOf(name: string): string {
  const words = name.split(/[\s\-·]+/).filter(Boolean);
  const letters = words.length > 1 ? words[0][0] + words[1][0] : [...name].slice(0, 2).join('');
  return letters.toUpperCase();
}
