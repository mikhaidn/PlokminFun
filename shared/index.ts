/**
 * Shared components and utilities for CardGames collection
 */

// Components
export { GameControls } from './components/GameControls.tsx';
export { DraggingCardPreview } from './components/DraggingCardPreview';
export { Card } from './components/Card';
export { CardBack } from './components/CardBack';
export { EmptyCell } from './components/EmptyCell';

// Types
export type { GameControlsProps } from './types/GameControls.ts';
export type {
  CardLocation,
  CardInteractionConfig,
  CardInteractionState,
  CardInteractionHandlers,
  UseCardInteractionReturn,
} from './types/CardInteraction';
// Note: Card type not exported to avoid conflict with Card component
// Games should import Card type from their local core/types
export type { Suit, Value } from './types/Card';
export { SUITS, VALUES } from './types/Card';
export type { GameLocation } from './types/GameLocation';
export { cardIndexToCount, cardCountToIndex } from './types/GameLocation';

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
export { getCardColors, getCardBoxShadow } from './utils/highContrastStyles';
export type { CardColors } from './utils/highContrastStyles';
export { calculateLayoutSizes, getResponsiveFontSizes } from './utils/responsiveLayout';
export type { LayoutSizes } from './utils/responsiveLayout';

// Config
export { FEATURE_FLAGS } from './config/featureFlags';
export type { FeatureFlags, FeatureFlagKey } from './config/featureFlags';

// RFC-005 Draft Types (future unified game builder)
// NOTE: These are DRAFT interfaces to guide current development
// Not yet implemented - use for planning and ensuring compatibility
export type {
  GameActions,
  GameConfig,
  GameMetadata,
  GameLayout,
  GameRules,
  CardDisplayConfig,
  GameFeatureFlags,
  GameSetting,
  AnimationConfig,
  GameStateFromConfig,
} from './types/GameConfig';
