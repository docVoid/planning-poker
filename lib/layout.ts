const CARD_ASPECT = 1.4;
const MIN_CARD_WIDTH = 28;
const MIN_SEAT_WIDTH = 56;
const MAX_ROWS = 6;
const ROW_PREFERENCE_TOLERANCE = 0.9;

export interface SeatLayout {
  cols: number;
  cardW: number;
  seatW: number;
  gapX: number;
  gapY: number;
}

interface TableMetrics {
  gapX: number;
  gapY: number;
  padX: number;
  padY: number;
  maxCardWidth: number;
  seatOverhead: number;
}

const DESKTOP: TableMetrics = { gapX: 20, gapY: 18, padX: 40, padY: 26, maxCardWidth: 104, seatOverhead: 92 };
const COMPACT: TableMetrics = { gapX: 10, gapY: 12, padX: 8, padY: 12, maxCardWidth: 78, seatOverhead: 74 };

export function layoutSeats(width: number, height: number, seatCount: number, compact: boolean): SeatLayout {
  const metrics = compact ? COMPACT : DESKTOP;
  const { gapX, gapY } = metrics;
  if (width <= 0 || height <= 0 || seatCount < 1) {
    return { cols: Math.max(1, seatCount), cardW: 56, seatW: 80, gapX, gapY };
  }

  const availableWidth = width - metrics.padX * 2;
  const availableHeight = height - metrics.padY * 2;
  const candidates: SeatLayout[] = [];

  for (let rows = 1; rows <= Math.min(seatCount, MAX_ROWS); rows++) {
    const cols = Math.ceil(seatCount / rows);
    if (candidates.some((candidate) => candidate.cols === cols)) continue;
    const actualRows = Math.ceil(seatCount / cols);
    const seatWidth = (availableWidth - gapX * (cols - 1)) / cols;
    const rowHeight = (availableHeight - gapY * (actualRows - 1)) / actualRows;
    const cardW = Math.floor(
      Math.min(seatWidth, (rowHeight - metrics.seatOverhead) / CARD_ASPECT, metrics.maxCardWidth),
    );
    candidates.push({ cols, cardW, seatW: Math.floor(Math.min(seatWidth, Math.max(cardW + 40, 84))), gapX, gapY });
  }

  const largestCard = Math.max(...candidates.map((candidate) => candidate.cardW));
  const chosen = [...candidates].reverse().find((c) => c.cardW >= largestCard * ROW_PREFERENCE_TOLERANCE)!;
  return { ...chosen, cardW: Math.max(MIN_CARD_WIDTH, chosen.cardW), seatW: Math.max(MIN_SEAT_WIDTH, chosen.seatW) };
}

export function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let start = 0; start < items.length; start += size) rows.push(items.slice(start, start + size));
  return rows;
}

const MAX_HAND_CARD_WIDTH = 88;
const MIN_HAND_CARD_WIDTH = 36;
const HAND_LABEL_HEIGHT = 24;

export function handCardWidth(width: number, height: number, cardCount: number, gap: number): number {
  if (width <= 0 || height <= 0) return 64;
  const byWidth = (width - gap * (cardCount - 1)) / cardCount;
  const byHeight = (height - HAND_LABEL_HEIGHT) / CARD_ASPECT;
  return Math.max(MIN_HAND_CARD_WIDTH, Math.floor(Math.min(MAX_HAND_CARD_WIDTH, byWidth, byHeight)));
}
