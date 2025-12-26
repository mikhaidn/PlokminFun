/**
 * Game Factory
 *
 * Creates a solitaire game from a configuration object.
 * This is the core of the unified game builder system (RFC-005 Phase 2 Week 3).
 *
 * Status: DRAFT - Basic implementation for Phase 2 Week 3
 * Full implementation with GenericGameBoard will come in Phase 2 Weeks 4-5
 */

import type { GameConfig } from '../types/GameConfig';
import type { GameLocation } from '../types/GameLocation';

/**
 * Props for game components created by the factory
 *
 * @template TState - Game state type
 */
export interface GameFactoryProps<TState> {
  /** Initial seed for the game */
  initialSeed?: number;

  /** Callback when game state changes */
  onStateChange?: (state: TState) => void;

  /** Callback when game is won */
  onGameWon?: (state: TState) => void;

  /** Custom class name */
  className?: string;
}

/**
 * Result of createGame factory
 *
 * @template TState - Game state type
 */
export interface GameInstance<TState> {
  /** Game configuration */
  config: GameConfig<TState>;

  /** Game metadata for menus and navigation */
  metadata: GameConfig<TState>['metadata'];

  /** Initialize a new game with a seed */
  initializeGame: (seed: number) => TState;

  /** Validate a move */
  validateMove: (state: TState, from: GameLocation, to: GameLocation) => boolean;

  /** Execute a move and return new state */
  executeMove: (state: TState, from: GameLocation, to: GameLocation) => TState | null;

  /** Check if game is won */
  isGameWon: (state: TState) => boolean;

  /** Get valid moves for smart tap (if supported) */
  getValidMoves?: (state: TState, from: GameLocation) => GameLocation[];

  /** Get hint (if supported) */
  getHint?: (state: TState) => { from: GameLocation; to: GameLocation } | null;

  /** Get auto-moves for auto-complete (if supported) */
  getAutoMoves?: (state: TState) => Array<{ from: GameLocation; to: GameLocation }>;
}

/**
 * Create a game instance from configuration
 *
 * This factory provides a unified interface for all solitaire games.
 * It wraps the game's actions and provides consistent access patterns.
 *
 * @template TState - The game-specific state type
 * @param config - Game configuration object
 * @returns GameInstance with unified interface
 *
 * @example
 * // Create a Klondike game instance
 * const klondike = createGame(KlondikeConfig);
 *
 * // Initialize a new game
 * const state = klondike.initializeGame(Date.now());
 *
 * // Validate and execute a move
 * if (klondike.validateMove(state, from, to)) {
 *   const newState = klondike.executeMove(state, from, to);
 *   if (newState && klondike.isGameWon(newState)) {
 *     console.log('You won!');
 *   }
 * }
 *
 * // Smart tap-to-move
 * if (klondike.getValidMoves) {
 *   const destinations = klondike.getValidMoves(state, from);
 *   if (destinations.length === 1) {
 *     // Auto-execute the only valid move
 *     const newState = klondike.executeMove(state, from, destinations[0]);
 *   }
 * }
 */
export function createGame<TState>(config: GameConfig<TState>): GameInstance<TState> {
  // Validate configuration
  if (!config.metadata) {
    throw new Error('GameConfig must include metadata');
  }
  if (!config.actions) {
    throw new Error('GameConfig must include actions');
  }
  if (!config.layout) {
    throw new Error('GameConfig must include layout');
  }
  if (!config.rules) {
    throw new Error('GameConfig must include rules');
  }

  // Create the game instance with unified interface
  return {
    config,
    metadata: config.metadata,

    // Delegate to config.actions
    initializeGame: (seed: number) => config.actions.initializeGame(seed),
    validateMove: (state: TState, from: GameLocation, to: GameLocation) =>
      config.actions.validateMove(state, from, to),
    executeMove: (state: TState, from: GameLocation, to: GameLocation) =>
      config.actions.executeMove(state, from, to),
    isGameWon: (state: TState) => config.actions.isGameWon(state),

    // Optional features
    getValidMoves: config.actions.getValidMoves
      ? (state: TState, from: GameLocation) => config.actions.getValidMoves!(state, from)
      : undefined,

    getHint: config.actions.getHint
      ? (state: TState) => config.actions.getHint!(state)
      : undefined,

    getAutoMoves: config.actions.getAutoMoves
      ? (state: TState) => config.actions.getAutoMoves!(state)
      : undefined,
  };
}

/**
 * Helper function to validate GameConfig at compile time
 *
 * This is a type-safe way to ensure your config is valid.
 *
 * @example
 * export const KlondikeConfig = defineGameConfig({
 *   metadata: { ... },
 *   layout: { ... },
 *   // TypeScript will error if required fields are missing
 * });
 */
export function defineGameConfig<TState>(config: GameConfig<TState>): GameConfig<TState> {
  return config;
}

/**
 * Helper to create a game registry for multiple games
 *
 * Useful for game selectors and navigation.
 *
 * @example
 * const games = createGameRegistry([
 *   KlondikeConfig,
 *   FreeCellConfig,
 *   SpiderConfig,
 * ]);
 *
 * // Get a game by ID
 * const klondike = games.getById('klondike');
 *
 * // List all games
 * const allGames = games.getAll();
 */
export function createGameRegistry<TState = any>(configs: GameConfig<TState>[]) {
  const registry = new Map<string, GameInstance<TState>>();

  // Initialize all games
  configs.forEach(config => {
    const game = createGame(config);
    registry.set(config.metadata.id, game);
  });

  return {
    /**
     * Get a game by its ID
     */
    getById(id: string): GameInstance<TState> | undefined {
      return registry.get(id);
    },

    /**
     * Get all registered games
     */
    getAll(): GameInstance<TState>[] {
      return Array.from(registry.values());
    },

    /**
     * Get all game metadata (for menus)
     */
    getAllMetadata() {
      return Array.from(registry.values()).map(game => game.metadata);
    },

    /**
     * Check if a game exists
     */
    has(id: string): boolean {
      return registry.has(id);
    },

    /**
     * Number of registered games
     */
    get size(): number {
      return registry.size;
    },
  };
}

/**
 * Type guard to check if a game supports a feature
 *
 * @example
 * if (supportsFeature(game, 'hints')) {
 *   const hint = game.getHint(state);
 * }
 */
export function supportsFeature<TState>(
  game: GameInstance<TState>,
  feature: keyof GameInstance<TState>
): boolean {
  return game[feature] !== undefined;
}
