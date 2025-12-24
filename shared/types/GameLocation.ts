import type { Card } from './Card';

/**
 * Represents a location in a solitaire game where cards can be placed.
 * Unified type supporting FreeCell, Klondike, and future games.
 *
 * @example
 * // Klondike waste pile
 * { type: 'waste', index: 0, cardCount: 1 }
 *
 * // FreeCell tableau column (using cardCount)
 * { type: 'tableau', index: 3, cardCount: 2 }
 *
 * // FreeCell tableau column (using cardIndex - legacy)
 * { type: 'tableau', index: 3, cardIndex: 5 }
 *
 * // Foundation pile
 * { type: 'foundation', index: 0 }
 *
 * // Free cell
 * { type: 'freeCell', index: 2 }
 */
export interface GameLocation {
  /** Type of location (tableau column, foundation pile, etc.) */
  type: 'tableau' | 'foundation' | 'waste' | 'stock' | 'freeCell';

  /** Index of the column/pile (0-based) */
  index: number;

  /**
   * Number of cards selected/affected (preferred for new code).
   * Used by Klondike for multi-card selection.
   * Example: cardCount=3 means "select 3 cards from the bottom of the column"
   */
  cardCount?: number;

  /**
   * Index of the card within the location (legacy FreeCell style).
   * 0 = top card, length-1 = bottom card
   * Example: cardIndex=2 in a 5-card column means "select card at index 2 through end"
   *
   * @deprecated Prefer cardCount for new code
   */
  cardIndex?: number;
}

/**
 * Convert FreeCell-style cardIndex to Klondike-style cardCount.
 *
 * @param column - The column of cards
 * @param cardIndex - Index from top (0 = top card)
 * @returns Number of cards from that index to bottom
 *
 * @example
 * const column = [card1, card2, card3, card4, card5]; // 5 cards
 * cardIndexToCount(column, 2); // Returns 3 (cards at index 2, 3, 4)
 * cardIndexToCount(column, 0); // Returns 5 (all cards)
 * cardIndexToCount(column, 4); // Returns 1 (bottom card only)
 */
export function cardIndexToCount(column: Card[], cardIndex: number): number {
  if (cardIndex < 0 || cardIndex >= column.length) {
    throw new Error(`Invalid cardIndex ${cardIndex} for column of length ${column.length}`);
  }
  return column.length - cardIndex;
}

/**
 * Convert Klondike-style cardCount to FreeCell-style cardIndex.
 *
 * @param column - The column of cards
 * @param cardCount - Number of cards from bottom
 * @returns Index from top (0 = top card)
 *
 * @example
 * const column = [card1, card2, card3, card4, card5]; // 5 cards
 * cardCountToIndex(column, 3); // Returns 2 (start at index 2 to get 3 cards)
 * cardCountToIndex(column, 1); // Returns 4 (bottom card at index 4)
 * cardCountToIndex(column, 5); // Returns 0 (all cards start at index 0)
 */
export function cardCountToIndex(column: Card[], cardCount: number): number {
  if (cardCount < 1 || cardCount > column.length) {
    throw new Error(`Invalid cardCount ${cardCount} for column of length ${column.length}`);
  }
  return column.length - cardCount;
}
