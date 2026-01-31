/**
 * Klondike Solitaire Game Configuration
 *
 * RFC-005 Phase 2 Week 3: Game Config System
 *
 * This config file demonstrates the unified game builder approach.
 * It defines the game's metadata, layout, rules, and integrates with
 * the existing Klondike game logic.
 */

import type { GameConfig, GameActions } from '@plokmin/shared';
import type { GameLocation } from '@plokmin/shared';
import type { CardType as Card } from '@plokmin/shared';
import type { KlondikeGameState, Location } from './state/gameState';
import {
  createInitialState,
  isGameWon,
  isCardFaceUp as isCardFaceUpHelper,
} from './state/gameState';
import { moveCards, getValidMoves as getValidMovesHelper } from './state/gameActions';

/**
 * Convert shared GameLocation to Klondike Location
 */
function toKlondikeLocation(location: GameLocation): Location {
  return {
    type: location.type as 'tableau' | 'stock' | 'waste' | 'foundation',
    index: location.index,
  };
}

/**
 * Convert Klondike Location to shared GameLocation
 */
function toGameLocation(location: Location): GameLocation {
  return {
    type: location.type,
    index: location.index ?? 0,
  };
}

/**
 * Klondike Game Actions Implementation
 *
 * Implements the GameActions interface for Klondike Solitaire.
 * This wraps the existing game logic to match the unified interface.
 */
class KlondikeGameActions implements GameActions<KlondikeGameState> {
  validateMove(state: KlondikeGameState, from: GameLocation, to: GameLocation): boolean {
    const fromLoc = toKlondikeLocation(from);
    const toLoc = toKlondikeLocation(to);

    // Try the move and see if it returns a valid state
    const result = moveCards(state, fromLoc, toLoc);
    return result !== null;
  }

  executeMove(
    state: KlondikeGameState,
    from: GameLocation,
    to: GameLocation
  ): KlondikeGameState | null {
    const fromLoc = toKlondikeLocation(from);
    const toLoc = toKlondikeLocation(to);

    return moveCards(state, fromLoc, toLoc);
  }

  getCardAt(state: KlondikeGameState, location: GameLocation): Card | Card[] | null {
    const loc = toKlondikeLocation(location);

    if (loc.type === 'tableau' && loc.index !== undefined) {
      const column = state.tableau[loc.index];
      return column.cards.length > 0 ? column.cards : null;
    }

    if (loc.type === 'stock') {
      return state.stock.length > 0 ? state.stock : null;
    }

    if (loc.type === 'waste') {
      return state.waste.length > 0 ? state.waste : null;
    }

    if (loc.type === 'foundation' && loc.index !== undefined) {
      const foundation = state.foundations[loc.index];
      return foundation.length > 0 ? foundation : null;
    }

    return null;
  }

  isCardFaceUp(state: KlondikeGameState, location: GameLocation, index: number = 0): boolean {
    const loc = toKlondikeLocation(location);
    return isCardFaceUpHelper(state, loc, index);
  }

  initializeGame(seed: number): KlondikeGameState {
    return createInitialState(seed);
  }

  isGameWon(state: KlondikeGameState): boolean {
    return isGameWon(state);
  }

  getValidMoves(state: KlondikeGameState, from: GameLocation): GameLocation[] {
    const fromLoc = toKlondikeLocation(from);
    const validMoves = getValidMovesHelper(state, fromLoc);
    return validMoves.map(toGameLocation);
  }

  // TODO: Implement getHint when hints feature is added
  // TODO: Implement getAutoMoves when auto-complete is refactored
}

/**
 * Klondike Game Configuration
 *
 * Defines all aspects of the Klondike Solitaire game in a declarative way.
 * This config can be used with createGame() to instantiate the game.
 *
 * @example
 * import { createGame } from '@plokmin/shared';
 * import { KlondikeConfig } from './klondike.config';
 *
 * const klondike = createGame(KlondikeConfig);
 * const initialState = klondike.initializeGame(Date.now());
 */
export const KlondikeConfig: GameConfig<KlondikeGameState> = {
  metadata: {
    id: 'klondike',
    name: 'Klondike Solitaire',
    description: 'Classic solitaire game with tableau, stock, and foundations',
    difficulty: 'medium',
    version: '1.0.0',
  },

  layout: {
    numTableauColumns: 7,
    numFoundations: 4,
    specialAreas: ['stock', 'waste'],
  },

  rules: {
    tableauStackRule: 'alternatingColors',
    emptyTableauRule: 'kingOnly',
    foundationRule: 'sameSuit',
    tableauDirection: 'descending',
    foundationDirection: 'ascending',
  },

  cardDisplay: {
    cardBackTheme: 'blue',
    enableFlipAnimation: true,
    flipAnimationDuration: 300,
  },

  actions: new KlondikeGameActions(),

  features: {
    smartTap: true,
    hints: false, // Not yet implemented
    autoComplete: true,
    undoRedo: true,
    persistence: false, // Not yet implemented
    winCelebration: true,
  },

  settings: [
    {
      id: 'drawCount',
      label: 'Draw Count',
      type: 'select',
      options: [
        { value: 1, label: 'Draw 1' },
        { value: 3, label: 'Draw 3' },
      ],
      default: 3,
      description: 'Number of cards to draw from stock pile',
    },
  ],

  animations: {
    moveDuration: 300,
    flipDuration: 300,
    autoMoveDuration: 200,
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

  // Lifecycle hooks can be added here for animations and side effects
  // hooks: {
  //   onAfterMove: (oldState, newState, from, to) => {
  //     // Play move animation
  //   },
  //   onGameWon: (state) => {
  //     // Play celebration animation
  //   },
  // },
};

export default KlondikeConfig;
