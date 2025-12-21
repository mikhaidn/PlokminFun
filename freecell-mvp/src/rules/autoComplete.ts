import { type GameState, type Card } from '../core/types';
import { canPlaceOnFoundation } from './validation';

interface AutoMoveCandidate {
  card: Card;
  source: { type: 'tableau'; column: number } | { type: 'freeCell'; index: number };
  foundationIndex: number;
}

/**
 * Finds a safe card that can be auto-moved to a foundation.
 * A card is "safe" to auto-move if its rank is at most 2 higher than the minimum foundation rank.
 * This prevents auto-moving cards that might still be needed for tableau building.
 */
export function findSafeAutoMove(gameState: GameState): AutoMoveCandidate | null {
  const candidates: AutoMoveCandidate[] = [];

  // Find the minimum rank across all foundations
  const foundationRanks = gameState.foundations.map((foundation) => {
    if (foundation.length === 0) return 0;
    return getRankValue(foundation[foundation.length - 1].value);
  });
  const minRank = Math.min(...foundationRanks);

  // Check each free cell
  gameState.freeCells.forEach((card, index) => {
    if (card) {
      const foundationIndex = getFoundationIndexForSuit(card.suit);
      if (canPlaceOnFoundation(card, gameState.foundations[foundationIndex])) {
        const rank = getRankValue(card.value);
        // Only auto-move if rank <= minRank + 2 (safety check)
        if (rank <= minRank + 2) {
          candidates.push({
            card,
            source: { type: 'freeCell', index },
            foundationIndex,
          });
        }
      }
    }
  });

  // Check top card of each tableau column
  gameState.tableau.forEach((column, columnIndex) => {
    if (column.length > 0) {
      const card = column[column.length - 1];
      const foundationIndex = getFoundationIndexForSuit(card.suit);
      if (canPlaceOnFoundation(card, gameState.foundations[foundationIndex])) {
        const rank = getRankValue(card.value);
        // Only auto-move if rank <= minRank + 2 (safety check)
        if (rank <= minRank + 2) {
          candidates.push({
            card,
            source: { type: 'tableau', column: columnIndex },
            foundationIndex,
          });
        }
      }
    }
  });

  // Return the first candidate (if any)
  return candidates.length > 0 ? candidates[0] : null;
}

function getRankValue(value: string): number {
  const rankMap: { [key: string]: number } = {
    A: 1,
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    '10': 10,
    J: 11,
    Q: 12,
    K: 13,
  };
  return rankMap[value] || 0;
}

function getFoundationIndexForSuit(suit: string): number {
  const suitOrder = ['♠', '♥', '♦', '♣'];
  return suitOrder.indexOf(suit);
}
