const ASPECT_RATIO = 1.4;
const SMALL_CARD_WIDTH = 50;

export function cardMetrics(width: number) {
  return {
    width,
    height: Math.round(width * ASPECT_RATIO),
    radius: Math.max(4, Math.round(width * 0.093)),
    small: width < SMALL_CARD_WIDTH,
    numeral: width * 0.575,
  };
}
