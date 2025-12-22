/**
 * Responsive layout utilities for FreeCell game
 * Calculates optimal card and spacing sizes based on viewport dimensions
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

const BASE_CARD_WIDTH = 60;
const BASE_CARD_HEIGHT = 84;
const BASE_GAP = 8;
const BASE_OVERLAP = 64;
const BASE_FONT_LARGE = 26;
const BASE_FONT_MEDIUM = 24;
const BASE_FONT_SMALL = 14;

/**
 * Calculate optimal card size based on available viewport dimensions
 * Ensures the game fits within the viewport while maintaining card aspect ratio
 */
export function calculateLayoutSizes(
  viewportWidth: number,
  viewportHeight: number
): LayoutSizes {
  // Reserve space for padding and UI elements
  const HORIZONTAL_PADDING = 48; // 24px on each side
  const VERTICAL_PADDING = 200; // Header, gaps, footer
  const NUM_TABLEAU_COLUMNS = 8;
  const NUM_GAPS = NUM_TABLEAU_COLUMNS - 1;

  // Calculate maximum card width based on viewport width
  const availableWidth = viewportWidth - HORIZONTAL_PADDING;
  const maxCardWidthFromViewport = (availableWidth - (NUM_GAPS * BASE_GAP)) / NUM_TABLEAU_COLUMNS;

  // Calculate maximum card height based on viewport height
  const availableHeight = viewportHeight - VERTICAL_PADDING;
  // Account for card stacking: need space for at least 6-7 overlapped cards
  const estimatedStackHeight = BASE_CARD_HEIGHT + (6 * (BASE_CARD_HEIGHT - BASE_OVERLAP));
  const maxCardHeightFromViewport = (availableHeight / estimatedStackHeight) * BASE_CARD_HEIGHT;

  // Use the smaller constraint and maintain aspect ratio
  const cardWidthFromHeight = maxCardHeightFromViewport * (BASE_CARD_WIDTH / BASE_CARD_HEIGHT);
  const constrainedCardWidth = Math.min(maxCardWidthFromViewport, cardWidthFromHeight, BASE_CARD_WIDTH);

  // Calculate scale factor
  const scale = constrainedCardWidth / BASE_CARD_WIDTH;

  return {
    cardWidth: constrainedCardWidth,
    cardHeight: BASE_CARD_HEIGHT * scale,
    cardGap: BASE_GAP * scale,
    cardOverlap: BASE_OVERLAP * scale,
    fontSize: {
      large: BASE_FONT_LARGE * scale,
      medium: BASE_FONT_MEDIUM * scale,
      small: BASE_FONT_SMALL * scale,
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
