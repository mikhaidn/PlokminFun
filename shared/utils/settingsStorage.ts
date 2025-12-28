/**
 * Settings storage utilities
 * RFC-005 Phase 1 Day 2: Persistent settings with localStorage
 *
 * Handles:
 * - Loading settings from localStorage
 * - Saving settings to localStorage
 * - Migrating old settings format to new unified format
 * - Applying accessibility overrides (prefers-reduced-motion)
 */

import { DEFAULT_GAME_SETTINGS, applyAccessibilityOverrides } from '../types/GameSettings';
import type { GameSettings } from '../types/GameSettings';

const STORAGE_KEY = 'cardgames-settings-v2'; // v2 to distinguish from old format

/**
 * Detect if the user is on a mobile device
 * Used to enable smart tap-to-move by default on mobile
 *
 * @returns true if on mobile device, false otherwise
 */
function isMobileDevice(): boolean {
  // Check viewport width (most reliable for web)
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    return true;
  }

  // Check user agent as fallback (for tablets in desktop mode)
  if (typeof navigator !== 'undefined') {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  return false;
}

/**
 * Load settings from localStorage
 * Returns default settings if none exist or if loading fails
 * Automatically applies accessibility overrides
 * Enables smart tap-to-move by default on mobile devices
 *
 * @returns GameSettings with user preferences and accessibility overrides
 */
export function loadSettings(): GameSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure new settings are present
      const merged = { ...DEFAULT_GAME_SETTINGS, ...parsed };
      return applyAccessibilityOverrides(merged);
    }
  } catch (error) {
    console.warn('Failed to load settings:', error);
  }

  // First-time user: Apply mobile-friendly defaults
  const defaults = { ...DEFAULT_GAME_SETTINGS };

  // Enable smart tap-to-move by default on mobile devices
  // Usability improvement: Mobile players expect tap-to-move behavior
  if (isMobileDevice()) {
    defaults.smartTapToMove = true;
  }

  return applyAccessibilityOverrides(defaults);
}

/**
 * Save settings to localStorage
 *
 * @param settings - Settings to save
 */
export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

/**
 * Migrate old accessibility settings to new unified format
 * Looks for old FreeCell/Klondike settings and migrates them
 * Only runs once - won't overwrite existing new settings
 */
export function migrateOldSettings(): void {
  const oldKeys = ['freecell-accessibility-settings', 'klondike-accessibility-settings'];

  // Don't migrate if new settings already exist
  if (localStorage.getItem(STORAGE_KEY)) {
    return;
  }

  for (const oldKey of oldKeys) {
    const old = localStorage.getItem(oldKey);

    if (old) {
      try {
        const parsed = JSON.parse(old);
        const migrated: GameSettings = {
          ...DEFAULT_GAME_SETTINGS,
          gameMode: parsed.gameMode || 'standard',
        };
        saveSettings(migrated);
        console.log(`Migrated old settings from ${oldKey} to new format`);
        return; // Only migrate the first one found
      } catch (error) {
        console.warn(`Failed to migrate old settings from ${oldKey}:`, error);
      }
    }
  }
}

/**
 * Reset settings to defaults
 * Useful for "Reset to Defaults" button in settings UI
 *
 * @returns Default settings with accessibility overrides
 */
export function resetSettings(): GameSettings {
  const defaults = applyAccessibilityOverrides(DEFAULT_GAME_SETTINGS);
  saveSettings(defaults);
  return defaults;
}
