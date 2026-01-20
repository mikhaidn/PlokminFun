/**
 * Responsive layout utilities for card games
 * Calculates optimal card and spacing sizes based on viewport dimensions
 * Uses viewport percentages for better scaling across devices
 */

export interface LayoutSizes {
  cardWidth: number;
  cardHeight: number;
  cardGap: number;
  cardOverlap: number;
  fontSize: {
    large: number;
    medium: number;
    small: number;
  };
}

// Viewport-relative sizing (percentages)
const CARD_WIDTH_VIEWPORT_PERCENT = 0.09; // 9% of viewport width per card
const HORIZONTAL_PADDING_PERCENT = 0.05; // 5% padding on each side (10% total)
const VERTICAL_PADDING_PERCENT = 0.25; // 25% for header/footer/gaps
const GAP_PERCENT = 0.01; // 1% gap between cards
const OVERLAP_PERCENT = 0.76; // 76% of card height remains visible when stacked

// Card aspect ratio (width:height = 5:7, standard playing card)
const CARD_ASPECT_RATIO = 5 / 7;

// Absolute min/max constraints (prevents extreme sizes)
const MIN_CARD_WIDTH = 40; // Minimum readable card size
const MAX_CARD_WIDTH = 120; // Maximum card size before looking too large

// Font sizing relative to card size
const FONT_LARGE_RATIO = 0.43; // Large font = 43% of card width
const FONT_MEDIUM_RATIO = 0.4; // Medium font = 40% of card width
const FONT_SMALL_RATIO = 0.23; // Small font = 23% of card width

/**
 * Calculate optimal card size based on available viewport dimensions
 * Uses viewport percentages for responsive scaling across devices
 *
 * @param viewportWidth - Width of viewport in pixels
 * @param viewportHeight - Height of viewport in pixels
 * @param cardSizeMultiplier - Multiplier for card size (e.g., 1.5 for "Easy to See" mode)
 * @param fontSizeMultiplier - Additional font size multiplier (for accessibility)
 */
export function calculateLayoutSizes(
  viewportWidth: number,
  viewportHeight: number,
  cardSizeMultiplier: number = 1.0,
  fontSizeMultiplier: number = 1.0
): LayoutSizes {
  const NUM_TABLEAU_COLUMNS = 8;
  const NUM_GAPS = NUM_TABLEAU_COLUMNS - 1;

  // Calculate available space (viewport minus padding)
  const horizontalPadding = viewportWidth * HORIZONTAL_PADDING_PERCENT;
  const verticalPadding = viewportHeight * VERTICAL_PADDING_PERCENT;
  const availableWidth = viewportWidth - horizontalPadding;
  const availableHeight = viewportHeight - verticalPadding;

  // Calculate card width from viewport percentage
  const cardWidthFromViewport = viewportWidth * CARD_WIDTH_VIEWPORT_PERCENT * cardSizeMultiplier;

  // Calculate gap size (proportional to viewport)
  const gap = viewportWidth * GAP_PERCENT;
  const totalGapWidth = gap * NUM_GAPS;

  // Calculate max card width that fits horizontally
  const maxCardWidthFromLayout = (availableWidth - totalGapWidth) / NUM_TABLEAU_COLUMNS;

  // Calculate card height (maintain aspect ratio)
  const cardHeightFromWidth = cardWidthFromViewport / CARD_ASPECT_RATIO;

  // Calculate overlap (76% of card remains visible)
  const cardOverlap = cardHeightFromWidth * OVERLAP_PERCENT;

  // Estimate stack height (assume ~7 cards stacked)
  const estimatedStackHeight = cardHeightFromWidth + 6 * (cardHeightFromWidth - cardOverlap);

  // Calculate max card height that fits vertically
  const maxCardHeightFromLayout = availableHeight / (estimatedStackHeight / cardHeightFromWidth);

  // Use the smaller constraint (width or height)
  const cardWidthFromHeight = maxCardHeightFromLayout * CARD_ASPECT_RATIO;
  let finalCardWidth = Math.min(cardWidthFromViewport, maxCardWidthFromLayout, cardWidthFromHeight);

  // Apply absolute min/max constraints
  finalCardWidth = Math.max(MIN_CARD_WIDTH, Math.min(MAX_CARD_WIDTH, finalCardWidth));

  // Calculate final dimensions
  const finalCardHeight = finalCardWidth / CARD_ASPECT_RATIO;
  const finalGap = Math.max(4, gap); // Minimum 4px gap
  const finalOverlap = finalCardHeight * OVERLAP_PERCENT;

  return {
    cardWidth: finalCardWidth,
    cardHeight: finalCardHeight,
    cardGap: finalGap,
    cardOverlap: finalOverlap,
    fontSize: {
      large: finalCardWidth * FONT_LARGE_RATIO * fontSizeMultiplier,
      medium: finalCardWidth * FONT_MEDIUM_RATIO * fontSizeMultiplier,
      small: finalCardWidth * FONT_SMALL_RATIO * fontSizeMultiplier,
    },
  };
}

/**
 * Get responsive font sizes for UI elements (header, buttons)
 */
export function getResponsiveFontSizes(viewportWidth: number) {
  if (viewportWidth < 600) {
    return {
      title: '2em',
      button: '0.8em',
      info: '0.9em',
    };
  } else if (viewportWidth < 900) {
    return {
      title: '2.5em',
      button: '0.9em',
      info: '1em',
    };
  } else {
    return {
      title: '3.2em',
      button: '1em',
      info: '1em',
    };
  }
}
