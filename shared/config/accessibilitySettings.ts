/**
 * Accessibility settings for the FreeCell game.
 * Uses preset modes for simplicity.
 */

export type GameMode = 'standard' | 'easy-to-see' | 'one-handed-left' | 'one-handed-right';

export interface AccessibilitySettings {
  /** Game mode preset */
  gameMode: GameMode;
}

/**
 * Default accessibility settings
 */
export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  gameMode: 'standard',
};

/**
 * Get derived settings from game mode
 */
export function getSettingsFromMode(mode: GameMode) {
  switch (mode) {
    case 'standard':
      return {
        highContrastMode: false,
        cardSizeMultiplier: 1.0,
        fontSizeMultiplier: 1.0,
        buttonPosition: 'top' as const,
        touchTargetSize: 'normal' as const,
        gamePosition: 'center' as const,
        sidePadding: 0,
      };

    case 'easy-to-see':
      return {
        highContrastMode: true,
        cardSizeMultiplier: 1.5, // 50% larger cards
        fontSizeMultiplier: 1.2, // 20% larger text
        buttonPosition: 'top' as const,
        touchTargetSize: 'large' as const,
        gamePosition: 'center' as const,
        sidePadding: 0,
      };

    case 'one-handed-left':
      return {
        highContrastMode: true,
        cardSizeMultiplier: 1.5, // 50% larger cards
        fontSizeMultiplier: 1.2, // 20% larger text
        buttonPosition: 'bottom' as const,
        touchTargetSize: 'large' as const,
        gamePosition: 'center' as const,
        sidePadding: 0,
      };

    case 'one-handed-right':
      return {
        highContrastMode: true,
        cardSizeMultiplier: 1.5, // 50% larger cards
        fontSizeMultiplier: 1.2, // 20% larger text
        buttonPosition: 'bottom' as const,
        touchTargetSize: 'large' as const,
        gamePosition: 'center' as const,
        sidePadding: 0,
      };
  }
}

/**
 * Get minimum button height for touch target size
 */
export function getMinButtonHeight(touchTargetSize: 'normal' | 'large'): number {
  return touchTargetSize === 'large' ? 44 : 32;
}

const STORAGE_KEY = 'freecell-accessibility-settings';

/**
 * Load accessibility settings from localStorage
 */
export function loadAccessibilitySettings(): AccessibilitySettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate and merge with defaults
      return {
        ...DEFAULT_ACCESSIBILITY_SETTINGS,
        ...parsed,
      };
    }
  } catch (error) {
    console.warn('Failed to load accessibility settings:', error);
  }
  return DEFAULT_ACCESSIBILITY_SETTINGS;
}

/**
 * Save accessibility settings to localStorage
 */
export function saveAccessibilitySettings(settings: AccessibilitySettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save accessibility settings:', error);
  }
}
