/**
 * Shared components and utilities for CardGames collection
 */

// Components
export { GameControls } from './components/GameControls.tsx';
export { DraggingCardPreview } from './components/DraggingCardPreview';

// Types
export type { GameControlsProps } from './types/GameControls.ts';
export type {
  CardLocation,
  CardInteractionConfig,
  CardInteractionState,
  CardInteractionHandlers,
  UseCardInteractionReturn,
} from './types/CardInteraction';
export type { Card, Suit, Value } from './types/Card';
export { SUITS, VALUES } from './types/Card';

// Hooks
export { useGameHistory } from './hooks/useGameHistory.ts';
export type { UseGameHistoryOptions, UseGameHistoryResult } from './hooks/useGameHistory.ts';
export { useCardInteraction } from './hooks/useCardInteraction';

// Rules
export {
  isRed,
  isBlack,
  hasAlternatingColors,
  hasSameSuit,
  canStackDescending,
  canStackOnFoundation,
  isValidSequence,
  isValidTableauSequence,
} from './rules/solitaireRules';

// Utilities
export { HistoryManager } from './utils/HistoryManager.ts';
