/**
 * Spider Solitaire Game Configuration
 *
 * RFC-005 unified game builder config. Describes the game declaratively and
 * wraps the existing Spider logic behind the shared GameActions interface.
 */

import type { GameConfig, GameActions } from '@plokmin/shared';
import type { GameLocation } from '@plokmin/shared';
import type { CardType as Card } from '@plokmin/shared';
import type { SpiderGameState } from './state/gameState';
import { createInitialState, isGameWon } from './state/gameState';
import { getValidMoves as getValidMovesHelper } from './state/gameActions';
import { isCardFaceUp as isCardFaceUpHelper } from './state/cardDisplay';
import { validateMove } from './rules/moveValidation';
import { executeMove } from './state/moveExecution';

/**
 * Spider Game Actions Implementation.
 * Wraps the existing game logic to match the unified interface.
 */
class SpiderGameActions implements GameActions<SpiderGameState> {
  validateMove(state: SpiderGameState, from: GameLocation, to: GameLocation): boolean {
    return validateMove(state, from, to);
  }

  executeMove(
    state: SpiderGameState,
    from: GameLocation,
    to: GameLocation
  ): SpiderGameState | null {
    return executeMove(state, from, to);
  }

  getCardAt(state: SpiderGameState, location: GameLocation): Card | Card[] | null {
    if (location.type === 'tableau') {
      const column = state.tableau[location.index];
      return column && column.cards.length > 0 ? column.cards : null;
    }
    if (location.type === 'stock') {
      return state.stock.length > 0 ? state.stock : null;
    }
    if (location.type === 'foundation') {
      const foundation = state.foundations[location.index];
      return foundation && foundation.length > 0 ? foundation : null;
    }
    return null;
  }

  isCardFaceUp(state: SpiderGameState, location: GameLocation, index: number = 0): boolean {
    return isCardFaceUpHelper(state, location, index);
  }

  initializeGame(seed: number): SpiderGameState {
    return createInitialState(seed);
  }

  isGameWon(state: SpiderGameState): boolean {
    return isGameWon(state);
  }

  getValidMoves(state: SpiderGameState, from: GameLocation): GameLocation[] {
    const validMoves = getValidMovesHelper(
      state,
      { type: 'tableau', index: from.index },
      from.cardCount ?? 1
    );
    return validMoves.map((loc) => ({ type: loc.type, index: loc.index ?? 0 }));
  }
}

export const SpiderConfig: GameConfig<SpiderGameState> = {
  metadata: {
    id: 'spider',
    name: 'Spider Solitaire',
    description: 'Build same-suit King-to-Ace runs across ten columns using two decks',
    difficulty: 'hard',
    version: '1.0.0',
  },

  layout: {
    numTableauColumns: 10,
    numFoundations: 8,
    specialAreas: ['stock'],
  },

  rules: {
    tableauStackRule: 'descending',
    emptyTableauRule: 'anyCard',
    foundationRule: 'completeSuit',
    tableauDirection: 'descending',
    foundationDirection: 'descending',
  },

  cardDisplay: {
    cardBackTheme: 'blue',
    enableFlipAnimation: true,
    flipAnimationDuration: 300,
  },

  actions: new SpiderGameActions(),

  features: {
    smartTap: true,
    hints: false,
    autoComplete: false, // completed runs are collected automatically
    undoRedo: true,
    persistence: false,
    winCelebration: true,
  },

  settings: [
    {
      id: 'suitCount',
      label: 'Suits',
      type: 'select',
      options: [
        { value: 1, label: '1 Suit (Easy)' },
        { value: 2, label: '2 Suits (Medium)' },
        { value: 4, label: '4 Suits (Hard)' },
      ],
      default: 1,
      description: 'Number of suits in play. Fewer suits is easier.',
    },
  ],

  animations: {
    moveDuration: 300,
    flipDuration: 300,
    dragSpring: {
      stiffness: 300,
      damping: 25,
    },
    winCelebration: {
      enabled: true,
      confetti: true,
      cascade: true,
      sound: false,
    },
  },
};

export default SpiderConfig;
