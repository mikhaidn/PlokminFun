/**
 * RFC-005 Draft Interfaces
 *
 * These interfaces define the future unified game builder system.
 * They are currently drafts to ensure RFC-003 (card backs) is compatible
 * with the planned RFC-005 unification.
 *
 * Status: DRAFT - Not yet implemented
 * Related: RFC-005 Unified Game Builder
 */

import type { Card } from './Card';
import type { GameLocation } from './GameLocation';

/**
 * GameActions Interface
 *
 * Standardizes how games handle state queries and mutations.
 * This will be the core interface that all games (FreeCell, Klondike, Spider, etc.)
 * must implement.
 *
 * @template TState - The game-specific state type (e.g., KlondikeGameState)
 */
export interface GameActions<TState> {
  // ===== Core Game Logic =====

  /**
   * Validate if a move from one location to another is legal.
   * Must be a pure function (no side effects).
   */
  validateMove(state: TState, from: GameLocation, to: GameLocation): boolean;

  /**
   * Execute a move and return new state, or null if invalid.
   * Must be a pure function (returns new state, doesn't mutate).
   */
  executeMove(state: TState, from: GameLocation, to: GameLocation): TState | null;

  /**
   * Get the card(s) at a specific location.
   * Returns: single Card, array of Cards, or null if empty.
   */
  getCardAt(state: TState, location: GameLocation): Card | Card[] | null;

  // ===== Card Display (RFC-003 Integration) =====

  /**
   * Determine if a card at a location should be rendered face-up.
   * This is the key method for RFC-003 Phase 2 compatibility.
   *
   * @param state - Current game state
   * @param location - Where the card is located
   * @param index - Optional index for cards in a stack (0 = top card)
   * @returns true if card should show its face, false for card back
   *
   * @example
   * // Klondike stock pile - all face-down
   * isCardFaceUp(state, { type: 'stock', index: 0 }, 0) // false
   *
   * // Klondike waste pile - all face-up
   * isCardFaceUp(state, { type: 'waste', index: 0 }, 0) // true
   *
   * // Klondike tableau - depends on position
   * isCardFaceUp(state, { type: 'tableau', index: 2 }, 0) // Check state.tableau[2].faceUpCount
   */
  isCardFaceUp(state: TState, location: GameLocation, index?: number): boolean;

  // ===== Game Lifecycle =====

  /**
   * Initialize a new game with a random seed.
   * Must be deterministic - same seed = same game.
   */
  initializeGame(seed: number): TState;

  /**
   * Check if the game has been won.
   */
  isGameWon(state: TState): boolean;

  // ===== Optional Features =====

  /**
   * Get all automatically executable moves (e.g., aces to foundation).
   * Used for auto-complete feature.
   */
  getAutoMoves?(state: TState): Array<{ from: GameLocation; to: GameLocation }>;

  /**
   * Get all valid destination locations for a card/stack.
   * Used for smart tap-to-move on mobile.
   *
   * @example
   * // User taps a card in Klondike tableau
   * const destinations = getValidMoves(state, { type: 'tableau', index: 3 });
   * // Returns: [{ type: 'foundation', index: 0 }, { type: 'tableau', index: 5 }]
   * // UI can then highlight these locations or auto-move if only one option
   */
  getValidMoves?(state: TState, from: GameLocation): GameLocation[];

  /**
   * Get a hint for the next move.
   * Returns null if no moves available.
   */
  getHint?(state: TState): { from: GameLocation; to: GameLocation } | null;
}

/**
 * CardDisplay Configuration
 *
 * Controls how cards are rendered in the game.
 * Integrates with RFC-003 card backs system.
 */
export interface CardDisplayConfig {
  /**
   * Theme for card backs ('blue' | 'red' | 'custom')
   * From RFC-003 CardBack component
   */
  cardBackTheme: 'blue' | 'red' | 'custom';

  /**
   * Optional custom image URL for card backs
   */
  customCardBackImage?: string;

  /**
   * Whether to animate card flips when revealing/hiding
   */
  enableFlipAnimation?: boolean;

  /**
   * Duration of flip animation in milliseconds
   */
  flipAnimationDuration?: number;
}

/**
 * GameMetadata
 *
 * Descriptive information about the game.
 */
export interface GameMetadata {
  /** Unique identifier (e.g., 'klondike', 'freecell', 'spider') */
  id: string;

  /** Display name (e.g., 'Klondike Solitaire') */
  name: string;

  /** Short description for game selector */
  description: string;

  /** Difficulty level (optional) */
  difficulty?: 'easy' | 'medium' | 'hard';

  /** Thumbnail URL for game selector (optional) */
  thumbnail?: string;

  /** Version number */
  version: string;
}

/**
 * GameLayout
 *
 * Defines the physical layout of the game board.
 */
export interface GameLayout {
  /** Number of tableau columns (e.g., 7 for Klondike, 8 for FreeCell) */
  numTableauColumns: number;

  /** Number of foundation piles (typically 4) */
  numFoundations: number;

  /** Special areas this game uses */
  specialAreas: Array<'stock' | 'waste' | 'freeCells'>;

  /** Number of free cells (FreeCell only) */
  numFreeCells?: number;
}

/**
 * GameRules
 *
 * Declarative rules for common solitaire mechanics.
 * Allows the unified system to render hints and validation feedback.
 */
export interface GameRules {
  /** How cards can stack on tableau (Klondike = alternatingColors, Spider = sameSuit) */
  tableauStackRule: 'alternatingColors' | 'sameSuit' | 'descending' | 'any';

  /** What can be placed in an empty tableau column */
  emptyTableauRule: 'kingOnly' | 'anyCard' | 'none';

  /** Foundation building rule */
  foundationRule: 'sameSuit' | 'completeSuit';

  /** Whether tableau stacks build down or up */
  tableauDirection: 'descending' | 'ascending';

  /** Foundation stacks build direction */
  foundationDirection: 'ascending' | 'descending';
}

/**
 * FeatureFlags
 *
 * Enable/disable optional features per game.
 */
export interface GameFeatureFlags {
  /** Enable smart tap-to-move (auto-execute if only one valid destination) */
  smartTap?: boolean;

  /** Enable hints system */
  hints?: boolean;

  /** Enable auto-complete feature */
  autoComplete?: boolean;

  /** Enable undo/redo */
  undoRedo?: boolean;

  /** Enable game persistence to localStorage */
  persistence?: boolean;

  /** Enable win celebration animation */
  winCelebration?: boolean;
}

/**
 * GameSetting
 *
 * Defines a user-configurable setting (e.g., draw-1 vs draw-3 in Klondike).
 */
export interface GameSetting {
  /** Unique ID for this setting */
  id: string;

  /** Label shown in settings UI */
  label: string;

  /** Type of control to render */
  type: 'select' | 'toggle' | 'slider';

  /** Options for select/toggle (value and display label) */
  options?: Array<{ value: any; label: string }>;

  /** Default value */
  default: any;

  /** Help text shown in settings (optional) */
  description?: string;
}

/**
 * AnimationConfig
 *
 * Configuration for game animations.
 * Will be expanded in Phase 3 of RFC-005.
 */
export interface AnimationConfig {
  /** Duration of move animations in ms */
  moveDuration?: number;

  /** Spring physics parameters for drag */
  dragSpring?: {
    stiffness: number;
    damping: number;
  };

  /** Win celebration configuration */
  winCelebration?: {
    enabled: boolean;
    confetti?: boolean;
    cascade?: boolean;
    sound?: boolean;
  };

  /** Card flip animation duration in ms */
  flipDuration?: number;

  /** Auto-move animation duration in ms */
  autoMoveDuration?: number;
}

/**
 * GameLifecycleHooks
 *
 * Hooks for responding to game lifecycle events.
 * Used to coordinate animations, sound effects, and other side effects.
 *
 * @template TState - The game-specific state type
 */
export interface GameLifecycleHooks<TState> {
  /**
   * Called before a move is executed.
   * Useful for starting animations or preventing interaction.
   */
  onBeforeMove?(state: TState, from: GameLocation, to: GameLocation): void;

  /**
   * Called after a move is executed successfully.
   * Useful for playing animations or sound effects.
   */
  onAfterMove?(oldState: TState, newState: TState, from: GameLocation, to: GameLocation): void;

  /**
   * Called when a move is invalid.
   * Useful for showing error feedback or playing error sounds.
   */
  onInvalidMove?(state: TState, from: GameLocation, to: GameLocation): void;

  /**
   * Called when a card is flipped (face-up/face-down state changes).
   * Useful for playing flip animations.
   */
  onCardFlip?(state: TState, location: GameLocation, index: number, faceUp: boolean): void;

  /**
   * Called when the game is won.
   * Useful for triggering celebration animations.
   */
  onGameWon?(state: TState): void;

  /**
   * Called when a new game is initialized.
   * Useful for resetting animations and UI state.
   */
  onGameStart?(state: TState): void;

  /**
   * Called when undo is triggered.
   * Useful for playing reverse animations.
   */
  onUndo?(oldState: TState, newState: TState): void;

  /**
   * Called when redo is triggered.
   * Useful for replaying animations.
   */
  onRedo?(oldState: TState, newState: TState): void;
}

/**
 * GameConfig
 *
 * Complete configuration for a solitaire game.
 * This is the main interface that defines a game in the unified system.
 *
 * @template TState - The game-specific state type
 *
 * @example
 * // Klondike game config
 * const KlondikeConfig: GameConfig<KlondikeGameState> = {
 *   metadata: {
 *     id: 'klondike',
 *     name: 'Klondike Solitaire',
 *     description: 'Classic solitaire game',
 *     difficulty: 'medium',
 *     version: '1.0.0',
 *   },
 *   layout: {
 *     numTableauColumns: 7,
 *     numFoundations: 4,
 *     specialAreas: ['stock', 'waste'],
 *   },
 *   rules: {
 *     tableauStackRule: 'alternatingColors',
 *     emptyTableauRule: 'kingOnly',
 *     foundationRule: 'sameSuit',
 *     tableauDirection: 'descending',
 *     foundationDirection: 'ascending',
 *   },
 *   cardDisplay: {
 *     cardBackTheme: 'blue',
 *     enableFlipAnimation: true,
 *     flipAnimationDuration: 300,
 *   },
 *   actions: new KlondikeGameActions(),
 *   features: {
 *     smartTap: true,
 *     hints: true,
 *     autoComplete: true,
 *     undoRedo: true,
 *     persistence: true,
 *     winCelebration: true,
 *   },
 *   settings: [
 *     {
 *       id: 'drawCount',
 *       label: 'Draw Count',
 *       type: 'select',
 *       options: [
 *         { value: 1, label: 'Draw 1' },
 *         { value: 3, label: 'Draw 3' },
 *       ],
 *       default: 3,
 *       description: 'Number of cards to draw from stock',
 *     },
 *   ],
 * };
 */
export interface GameConfig<TState> {
  /** Game metadata (name, description, etc.) */
  metadata: GameMetadata;

  /** Board layout definition */
  layout: GameLayout;

  /** Game rules (declarative) */
  rules: GameRules;

  /** Card display configuration (RFC-003 integration) */
  cardDisplay: CardDisplayConfig;

  /** Game logic implementation */
  actions: GameActions<TState>;

  /** Optional feature flags */
  features?: GameFeatureFlags;

  /** User-configurable settings */
  settings?: GameSetting[];

  /** Animation configuration (Phase 3) */
  animations?: AnimationConfig;

  /** Lifecycle hooks for animations and side effects (Phase 2 Week 3) */
  hooks?: GameLifecycleHooks<TState>;
}

/**
 * Type helper to infer state type from a GameConfig
 */
export type GameStateFromConfig<T> = T extends GameConfig<infer TState> ? TState : never;
