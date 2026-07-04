/**
 * Spider layout sizing.
 *
 * The shared calculateLayoutSizes() is tuned for 8 tableau columns, but Spider
 * has 10. This wrapper rescales the card dimensions so all 10 columns fit the
 * viewport width, which keeps the board playable on narrow phone screens.
 *
 * It also caps the stack overlap so a deep run (Spider columns easily reach
 * 14+ cards) stays visible without scrolling.
 */

import { calculateLayoutSizes, type LayoutSizes } from '@plokmin/shared';
import { NUM_COLUMNS } from '../state/gameState';

/** Must match the GameBoard container padding (12px per side). */
const BOARD_PADDING_PX = 24;

/** Share of the viewport height available to the tableau (rest is header/top bar). */
const TABLEAU_HEIGHT_PERCENT = 0.6;

/** Deepest stack that should stay fully visible before the page scrolls. */
const MAX_VISIBLE_STACK = 14;

/** Keep at least this fraction of each covered card visible (corner rank/suit). */
const MIN_OVERLAP_RATIO = 0.18;

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

  // Tighter gaps than the 8-column default so 10 columns keep readable cards
  const cardGap = Math.max(2, Math.min(base.cardGap, Math.floor(viewportWidth * 0.008)));

  const availableWidth = viewportWidth - BOARD_PADDING_PX;
  const maxCardWidth = (availableWidth - cardGap * (NUM_COLUMNS - 1)) / NUM_COLUMNS;
  const scale = Math.min(1, maxCardWidth / base.cardWidth);

  const cardWidth = base.cardWidth * scale;
  const cardHeight = base.cardHeight * scale;

  // Compress the stack offset so MAX_VISIBLE_STACK cards fit the tableau area
  const tableauHeight = viewportHeight * TABLEAU_HEIGHT_PERCENT;
  const maxOverlap = (tableauHeight - cardHeight) / (MAX_VISIBLE_STACK - 1);
  const minOverlap = cardHeight * MIN_OVERLAP_RATIO;
  const cardOverlap = Math.max(minOverlap, Math.min(base.cardOverlap * scale, maxOverlap));

  return {
    cardWidth,
    cardHeight,
    cardGap,
    cardOverlap,
    fontSize: {
      large: base.fontSize.large * scale,
      medium: base.fontSize.medium * scale,
      small: base.fontSize.small * scale,
    },
  };
}
