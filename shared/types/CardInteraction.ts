/**
 * Shared types for card interaction system
 * Used by both FreeCell and Klondike (and future games)
 */

import type { GameLocation } from './GameLocation';

/**
 * Base interface for card locations in any card game.
 * Games extend this with their specific location types.
 *
 * @deprecated Use GameLocation instead. This is kept for backward compatibility.
 */
export interface CardLocation {
  type: string; // Game-specific (e.g., 'tableau', 'freeCell', 'foundation', 'waste', 'stock')
  index?: number; // Column/pile index
  cardIndex?: number; // Index of card within the pile
  cardCount?: number; // Number of cards to move (for stacks)
}

/**
 * Type alias for GameLocation (preferred type for new code)
 */
export type { GameLocation };

/**
 * Configuration for the card interaction hook.
 * Games provide these functions to customize behavior.
 */
export interface CardInteractionConfig<TLocation extends CardLocation> {
  /**
   * Validate if a move from source to destination is legal.
   * Game-specific logic (e.g., alternating colors, descending rank).
   */
  validateMove: (from: TLocation, to: TLocation) => boolean;

  /**
   * Execute the move (update game state).
   * Called after validation passes.
   */
  executeMove: (from: TLocation, to: TLocation) => void;

  /**
   * Optional: Get card data at location for visual preview during drag.
   * If not provided, no preview is shown.
   */
  getCardAtLocation?: (location: TLocation) => unknown;

  /**
   * Optional: Get all valid destination locations for a source location.
   * Required for smart tap-to-move feature.
   * If not provided, smart tap-to-move will not work.
   */
  getValidMoves?: (from: TLocation) => TLocation[];
}

/**
 * Invalid move attempt information for UI feedback
 */
export interface InvalidMoveAttempt<TLocation extends CardLocation> {
  /** Location where invalid move was attempted */
  location: TLocation;

  /** Optional reason for the invalid move (for tooltip) */
  reason?: string;

  /** Timestamp when the attempt occurred (for auto-clearing) */
  timestamp: number;
}

/**
 * State managed by the card interaction hook.
 */
export interface CardInteractionState<TLocation extends CardLocation> {
  /** Currently selected card (click-to-select mode) */
  selectedCard: TLocation | null;

  /** Currently dragging card (drag-and-drop mode) */
  draggingCard: TLocation | null;

  /** Whether a touch drag is in progress */
  touchDragging: boolean;

  /** Current touch position for preview rendering */
  touchPosition: { x: number; y: number } | null;

  /** Valid destination cells to highlight (smart tap-to-move feature) */
  highlightedCells: TLocation[];

  /** Invalid move attempt for shake animation and tooltip feedback */
  invalidMoveAttempt: InvalidMoveAttempt<TLocation> | null;
}

/**
 * Event handlers returned by the card interaction hook.
 * Pass these to child components.
 */
export interface CardInteractionHandlers<TLocation extends CardLocation> {
  // Click handlers (click-to-select mode)
  handleCardClick: (location: TLocation) => void;

  // Drag handlers (mouse drag-and-drop)
  handleDragStart: (location: TLocation) => (e: React.DragEvent) => void;
  handleDragEnd: () => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (location: TLocation) => (e: React.DragEvent) => void;

  // Touch handlers (mobile touch drag)
  handleTouchStart: (location: TLocation) => (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: (e: React.TouchEvent) => void;
  handleTouchCancel: () => void;
}

/**
 * Return type of the useCardInteraction hook.
 */
export interface UseCardInteractionReturn<TLocation extends CardLocation> {
  state: CardInteractionState<TLocation>;
  handlers: CardInteractionHandlers<TLocation>;
}
