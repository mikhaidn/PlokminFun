/**
 * Spider layout sizing.
 *
 * The shared calculateLayoutSizes() is tuned for 8 tableau columns, but Spider
 * has 10. This wrapper rescales the card dimensions so all 10 columns fit the
 * viewport width, which keeps the board playable on narrow phone screens.
 */

import { calculateLayoutSizes, type LayoutSizes } from '@plokmin/shared';
import { NUM_COLUMNS } from '../state/gameState';

const HORIZONTAL_PADDING_PERCENT = 0.04; // 2% on each side

export function calculateSpiderLayout(
  viewportWidth: number,
  viewportHeight: number,
  cardSizeMultiplier: number = 1.0,
  fontSizeMultiplier: number = 1.0
): LayoutSizes {
  const base = calculateLayoutSizes(
    viewportWidth,
    viewportHeight,
    cardSizeMultiplier,
    fontSizeMultiplier
  );

  const availableWidth = viewportWidth - viewportWidth * HORIZONTAL_PADDING_PERCENT;
  const totalGapWidth = base.cardGap * (NUM_COLUMNS - 1);
  const maxCardWidth = (availableWidth - totalGapWidth) / NUM_COLUMNS;

  // If the 8-column sizing already fits 10 columns, keep it.
  if (base.cardWidth <= maxCardWidth) {
    return base;
  }

  const scale = maxCardWidth / base.cardWidth;

  return {
    cardWidth: base.cardWidth * scale,
    cardHeight: base.cardHeight * scale,
    cardGap: base.cardGap,
    cardOverlap: base.cardOverlap * scale,
    fontSize: {
      large: base.fontSize.large * scale,
      medium: base.fontSize.medium * scale,
      small: base.fontSize.small * scale,
    },
  };
}
