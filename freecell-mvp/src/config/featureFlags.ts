/**
 * Feature flags for the FreeCell MVP.
 * These flags control which features are enabled in the application.
 */
export interface FeatureFlags {
  /** Enable undo/redo functionality */
  enableUndo: boolean;

  /** Enable hint system (show playable cards) */
  enableHints: boolean;

  /** Enable auto-complete (automatically move cards to foundations) */
  enableAutoComplete: boolean;

  /** Enable drag-and-drop interactions (in addition to click) */
  enableDragAndDrop: boolean;

  /** Enable animations for card movements */
  enableAnimations: boolean;

  /** Enable dark mode */
  enableDarkMode: boolean;
}

/**
 * Default feature flags for MVP.
 * All advanced features are disabled by default.
 */
export const DEFAULT_FLAGS: FeatureFlags = {
  enableUndo: false,
  enableHints: false,
  enableAutoComplete: false,
  enableDragAndDrop: false,
  enableAnimations: false,
  enableDarkMode: false,
};

/**
 * Gets the current feature flags.
 * Can be extended to load from environment variables or remote config.
 *
 * @returns Current feature flags
 */
export function getFeatureFlags(): FeatureFlags {
  // For MVP, return default flags
  // Future: Load from localStorage or environment
  return DEFAULT_FLAGS;
}

/**
 * Checks if a specific feature is enabled.
 *
 * @param feature - The feature key to check
 * @returns true if the feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  return flags[feature];
}
