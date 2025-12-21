import { type GameState } from '../core/types';

/**
 * Returns the IDs of cards that are the lowest unplayed cards for each suit
 * (i.e., the next cards that need to be moved to foundations).
 */
export function getLowestPlayableCards(gameState: GameState): string[] {
  const cardIds: string[] = [];

  // For each foundation, find the next card that needs to be placed
  gameState.foundations.forEach((foundation, foundationIndex) => {
    const nextRank = foundation.length + 1; // Next rank needed (1-13)
    if (nextRank > 13) return; // Foundation is complete

    const suitOrder = ['♠', '♥', '♦', '♣'];
    const targetSuit = suitOrder[foundationIndex];
    const targetValue = rankToValue(nextRank);

    // Search in free cells
    gameState.freeCells.forEach((card) => {
      if (card && card.suit === targetSuit && card.value === targetValue) {
        cardIds.push(card.id);
      }
    });

    // Search in tableau columns
    gameState.tableau.forEach((column) => {
      column.forEach((card) => {
        if (card.suit === targetSuit && card.value === targetValue) {
          cardIds.push(card.id);
        }
      });
    });
  });

  return cardIds;
}

function rankToValue(rank: number): string {
  const rankMap: { [key: number]: string } = {
    1: 'A',
    2: '2',
    3: '3',
    4: '4',
    5: '5',
    6: '6',
    7: '7',
    8: '8',
    9: '9',
    10: '10',
    11: 'J',
    12: 'Q',
    13: 'K',
  };
  return rankMap[rank] || '';
}
