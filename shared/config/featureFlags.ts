/**
 * Shared feature flags for all card games.
 * These flags control experimental features and migrations.
 */

export const FEATURE_FLAGS = {
  /**
   * RFC-004: Use shared useCardInteraction hook
   *
   * When true: Games use the shared interaction hook from @cardgames/shared
   * When false: Games use their original interaction code (fallback)
   *
   * This flag enables easy rollback during the Phase 2 migration.
   * Will be removed in Phase 3 after validation period.
   */
  USE_SHARED_INTERACTION_HOOK: false,
} as const;

export type FeatureFlags = typeof FEATURE_FLAGS;
export type FeatureFlagKey = keyof FeatureFlags;
