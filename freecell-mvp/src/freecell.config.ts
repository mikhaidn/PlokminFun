/**
 * FreeCell Solitaire Game Configuration
 *
 * RFC-005 Phase 2 Week 3: Game Config System
 *
 * This config file demonstrates the unified game builder approach.
 * It defines the game's metadata, layout, rules, and integrates with
 * the existing FreeCell game logic.
 */

import type { GameConfig, GameActions } from '@plokmin/shared';
import type { GameLocation } from '@plokmin/shared';
import type { CardType as Card } from '@plokmin/shared';
import type { GameState } from './state/gameState';
import type { SourceLocation, DestinationLocation } from './state/gameActions';
import { initializeGame, checkWinCondition } from './state/gameState';
import {
  moveCardToFreeCell,
  moveCardFromFreeCell,
  moveCardToFoundation,
  moveCardFromFoundationToTableau,
  moveCardFromFoundationToFreeCell,
  moveCardsToTableau,
  getValidMoves as getValidMovesHelper,
} from './state/gameActions';

/**
 * Convert shared GameLocation to FreeCell SourceLocation
 */
function toFreeCellLocation(location: GameLocation): SourceLocation {
  return {
    type: location.type as 'tableau' | 'freeCell' | 'foundation',
    index: location.index ?? 0,
  };
}

/**
 * Convert FreeCell DestinationLocation to shared GameLocation
 */
function toGameLocation(location: DestinationLocation): GameLocation {
  return {
    type: location.type,
    index: location.index,
  };
}

/**
 * FreeCell Game Actions Implementation
 *
 * Implements the GameActions interface for FreeCell Solitaire.
 * This wraps the existing game logic to match the unified interface.
 */
class FreeCellGameActions implements GameActions<GameState> {
  validateMove(state: GameState, from: GameLocation, to: GameLocation): boolean {
    // Check if move is valid by attempting to execute it
    const result = this.executeMove(state, from, to);
    return result !== null;
  }

  executeMove(state: GameState, from: GameLocation, to: GameLocation): GameState | null {
    // Route to the appropriate specific move function based on source and destination
    if (from.index === undefined || to.index === undefined) {
      return null;
    }

    if (from.type === 'tableau' && to.type === 'freeCell') {
      return moveCardToFreeCell(state, from.index, to.index);
    }
    if (from.type === 'tableau' && to.type === 'foundation') {
      return moveCardToFoundation(state, 'tableau', from.index, to.index);
    }
    if (from.type === 'tableau' && to.type === 'tableau') {
      return moveCardsToTableau(state, from.index, 1, to.index);
    }
    if (from.type === 'freeCell' && to.type === 'tableau') {
      return moveCardFromFreeCell(state, from.index, to.index);
    }
    if (from.type === 'freeCell' && to.type === 'foundation') {
      return moveCardToFoundation(state, 'freeCell', from.index, to.index);
    }
    if (from.type === 'foundation' && to.type === 'tableau') {
      return moveCardFromFoundationToTableau(state, from.index, to.index);
    }
    if (from.type === 'foundation' && to.type === 'freeCell') {
      return moveCardFromFoundationToFreeCell(state, from.index, to.index);
    }

    return null;
  }

  getCardAt(state: GameState, location: GameLocation): Card | Card[] | null {
    if (location.type === 'tableau' && location.index !== undefined) {
      const column = state.tableau[location.index];
      return column.length > 0 ? column : null;
    }

    if (location.type === 'freeCell' && location.index !== undefined) {
      const cell = state.freeCells[location.index];
      return cell || null;
    }

    if (location.type === 'foundation' && location.index !== undefined) {
      const foundation = state.foundations[location.index];
      return foundation.length > 0 ? foundation : null;
    }

    return null;
  }

  isCardFaceUp(): boolean {
    // In FreeCell, all cards are always face-up
    return true;
  }

  initializeGame(seed: number): GameState {
    return initializeGame(seed);
  }

  isGameWon(state: GameState): boolean {
    return checkWinCondition(state);
  }

  getValidMoves(state: GameState, from: GameLocation): GameLocation[] {
    const fromLoc = toFreeCellLocation(from);
    const validMoves = getValidMovesHelper(state, fromLoc);
    return validMoves.map(toGameLocation);
  }

  // TODO: Implement getHint when hints feature is added
  // getHint: Already implemented in gameActions.ts, need to wire it up

  // TODO: Implement getAutoMoves when auto-complete is refactored
  // getAutoMoves: Already implemented in gameActions.ts, need to wire it up
}

/**
 * FreeCell Game Configuration
 *
 * Defines all aspects of the FreeCell Solitaire game in a declarative way.
 * This config can be used with createGame() to instantiate the game.
 *
 * @example
 * import { createGame } from '@plokmin/shared';
 * import { FreeCellConfig } from './freecell.config';
 *
 * const freecell = createGame(FreeCellConfig);
 * const initialState = freecell.initializeGame(Date.now());
 */
export const FreeCellConfig: GameConfig<GameState> = {
  metadata: {
    id: 'freecell',
    name: 'FreeCell Solitaire',
    description: 'Strategic solitaire with free cells for temporary card storage',
    difficulty: 'hard',
    version: '1.0.0',
  },

  layout: {
    numTableauColumns: 8,
    numFoundations: 4,
    specialAreas: ['freeCells'],
    numFreeCells: 4,
  },

  rules: {
    tableauStackRule: 'alternatingColors',
    emptyTableauRule: 'anyCard',
    foundationRule: 'sameSuit',
    tableauDirection: 'descending',
    foundationDirection: 'ascending',
  },

  cardDisplay: {
    cardBackTheme: 'blue',
    enableFlipAnimation: false, // All cards always face-up in FreeCell
    flipAnimationDuration: 0,
  },

  actions: new FreeCellGameActions(),

  features: {
    smartTap: true,
    hints: true,
    autoComplete: true,
    undoRedo: true,
    persistence: false, // Not yet implemented
    winCelebration: true,
  },

  // No game-specific settings for FreeCell (unlike Klondike's draw count)
  settings: [],

  animations: {
    moveDuration: 300,
    flipDuration: 0, // No flips in FreeCell
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

export default FreeCellConfig;
