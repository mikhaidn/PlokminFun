/**
 * Klondike-specific game settings
 * Stored separately from shared settings (animations, accessibility)
 */

import type { DrawMode } from '../state/gameState';

export interface KlondikeSettings {
  /** Draw mode: Draw-1 (easier) or Draw-3 (traditional) */
  drawMode: DrawMode;
}

export const DEFAULT_KLONDIKE_SETTINGS: KlondikeSettings = {
  drawMode: 'draw1', // Default to easier mode for beginners
};

const STORAGE_KEY = 'klondike-settings';

/**
 * Load Klondike settings from localStorage
 */
export function loadKlondikeSettings(): KlondikeSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_KLONDIKE_SETTINGS, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load Klondike settings:', error);
  }
  return DEFAULT_KLONDIKE_SETTINGS;
}

/**
 * Save Klondike settings to localStorage
 */
export function saveKlondikeSettings(settings: KlondikeSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save Klondike settings:', error);
  }
}

/**
 * Update a specific Klondike setting
 */
export function updateKlondikeSetting<K extends keyof KlondikeSettings>(
  key: K,
  value: KlondikeSettings[K]
): KlondikeSettings {
  const current = loadKlondikeSettings();
  const updated = { ...current, [key]: value };
  saveKlondikeSettings(updated);
  return updated;
}
