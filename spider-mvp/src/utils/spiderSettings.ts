/**
 * Spider-specific game settings.
 * Stored separately from shared settings (animations, accessibility).
 */

import type { SuitCount } from '../state/gameState';

export interface SpiderSettings {
  /** Number of suits: 1 (easy), 2 (medium), or 4 (hard) */
  suitCount: SuitCount;
}

export const DEFAULT_SPIDER_SETTINGS: SpiderSettings = {
  suitCount: 1, // Default to the easiest mode for newcomers
};

const STORAGE_KEY = 'spider-settings';

/**
 * Load Spider settings from localStorage.
 */
export function loadSpiderSettings(): SpiderSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_SPIDER_SETTINGS, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load Spider settings:', error);
  }
  return DEFAULT_SPIDER_SETTINGS;
}

/**
 * Save Spider settings to localStorage.
 */
export function saveSpiderSettings(settings: SpiderSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save Spider settings:', error);
  }
}

/**
 * Update a single Spider setting and persist it.
 */
export function updateSpiderSetting<K extends keyof SpiderSettings>(
  key: K,
  value: SpiderSettings[K]
): SpiderSettings {
  const current = loadSpiderSettings();
  const updated = { ...current, [key]: value };
  saveSpiderSettings(updated);
  return updated;
}
