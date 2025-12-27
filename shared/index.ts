/**
 * Shared components and utilities for CardGames collection
 */

// Components
export { GameControls } from './components/GameControls.tsx';
export { DraggingCardPreview } from './components/DraggingCardPreview';
export { Card } from './components/Card';
export { CardBack } from './components/CardBack';
export { CardFlip } from './components/CardFlip';
export type { CardFlipProps } from './components/CardFlip';
export { EmptyCell } from './components/EmptyCell';
export { SettingsModal } from './components/SettingsModal';
export { FoundationArea } from './components/FoundationArea';
export { GenericTableau } from './components/GenericTableau';
export type {
  GenericTableauProps,
  TableauCard,
  TableauColumnData,
} from './components/GenericTableau';
export { WinCelebration } from './components/WinCelebration';

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
// Import Card type separately if needed
export type { Card as CardType, Suit, Value } from './types/Card';
export { SUITS, VALUES } from './types/Card';
export type { GameLocation } from './types/GameLocation';
export { cardIndexToCount, cardCountToIndex } from './types/GameLocation';

// Hooks
export { useGameHistory } from './hooks/useGameHistory.ts';
export type { UseGameHistoryOptions, UseGameHistoryResult } from './hooks/useGameHistory.ts';
export { useCardInteraction } from './hooks/useCardInteraction';
export { useGameAnimations } from './hooks/useGameAnimations';
export type {
  AnimationState,
  AnimationHandlers,
  UseGameAnimationsReturn,
} from './hooks/useGameAnimations';
export { useSmartTap } from './hooks/useSmartTap';
export type { SmartTapAction } from './hooks/useSmartTap';

// Settings (RFC-005 Phase 1 Day 2)
export type { GameSettings } from './types/GameSettings';
export { DEFAULT_GAME_SETTINGS, applyAccessibilityOverrides } from './types/GameSettings';
export {
  loadSettings,
  saveSettings,
  migrateOldSettings,
  resetSettings,
} from './utils/settingsStorage';
export { SettingsProvider, SettingsContext, useSettings } from './contexts/SettingsContext';

// Analytics (React hook-based approach)
export type {
  AnalyticsEvent,
  GameStartEvent,
  GameWonEvent,
  CardMovedEvent,
  SettingChangedEvent,
  AnalyticsProvider,
} from './types/Analytics';
export { NoOpAnalyticsProvider } from './types/Analytics';
export { AnalyticsContextProvider, AnalyticsContext } from './contexts/AnalyticsContext';
export { useAnalytics } from './hooks/useAnalytics';

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
export {
  AnimationQueue,
  createAnimationDelay,
  createMoveAnimation,
  createFlipAnimation,
} from './utils/animationQueue';
export type { QueuedAnimation } from './utils/animationQueue';
export {
  LifecycleHookExecutor,
  createHookExecutor,
  executeMoveWithHooks,
  initializeGameWithHooks,
  undoWithHooks,
  redoWithHooks,
} from './utils/lifecycleHooks';
export {
  trackEvent,
  trackPageView,
  getDeviceType,
  getPlatform,
  enrichEventProperties,
} from './utils/analytics';
export type { GameEventType, GameEventProperties } from './utils/analytics';
export { createBugReportUrl, createBugReportFromGameState, openBugReport } from './utils/bugReport';
export type { BugReportContext, BugReportableGameState } from './utils/bugReport';

// Config
export { FEATURE_FLAGS } from './config/featureFlags';
export type { FeatureFlags, FeatureFlagKey } from './config/featureFlags';
export type { AccessibilitySettings, GameMode } from './config/accessibilitySettings';
export {
  DEFAULT_ACCESSIBILITY_SETTINGS,
  loadAccessibilitySettings,
  saveAccessibilitySettings,
  getSettingsFromMode,
  getMinButtonHeight,
} from './config/accessibilitySettings';

// Core utilities
export { seededRandom } from './core/rng';
export { createDeck, shuffleWithSeed } from './core/deck';
export type {
  CardSize,
  FontSizes,
  AnimationDefinition,
  AnimationOptions,
  CardPackManifest,
  CardPack,
} from './core/cardPack';
export { DEFAULT_CARD_PACK_MANIFEST, DEFAULT_FLIP_ANIMATION, useCardPack } from './core/cardPack';

// Core (RFC-005 Phase 2 Week 3)
export {
  createGame,
  defineGameConfig,
  createGameRegistry,
  supportsFeature,
} from './core/createGame';
export type { GameFactoryProps, GameInstance } from './core/createGame';

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
  GameLifecycleHooks,
  GameStateFromConfig,
} from './types/GameConfig';
