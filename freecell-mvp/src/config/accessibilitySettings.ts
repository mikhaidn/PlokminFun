/**
 * Accessibility settings for the FreeCell game.
 * These settings help with visibility and one-handed use.
 */

export type CardSize = 'small' | 'medium' | 'large' | 'extra-large';
export type ButtonPosition = 'top' | 'bottom';
export type TouchTargetSize = 'normal' | 'large';

export interface AccessibilitySettings {
  /** Enable high contrast mode for better visibility */
  highContrastMode: boolean;

  /** Card size preference */
  cardSize: CardSize;

  /** Font size multiplier (1.0 = normal, 2.0 = double) */
  fontSizeMultiplier: number;

  /** Position of control buttons */
  buttonPosition: ButtonPosition;

  /** Touch target size for buttons */
  touchTargetSize: TouchTargetSize;
}

/**
 * Default accessibility settings
 */
export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  highContrastMode: false,
  cardSize: 'small',
  fontSizeMultiplier: 1.0,
  buttonPosition: 'top',
  touchTargetSize: 'normal',
};

/**
 * Get maximum card width for each size setting
 */
export function getMaxCardWidth(cardSize: CardSize): number {
  switch (cardSize) {
    case 'small':
      return 60;
    case 'medium':
      return 75;
    case 'large':
      return 90;
    case 'extra-large':
      return 110;
  }
}

/**
 * Get minimum button height for touch target size
 */
export function getMinButtonHeight(touchTargetSize: TouchTargetSize): number {
  switch (touchTargetSize) {
    case 'normal':
      return 32;
    case 'large':
      return 44; // WCAG AAA guideline
  }
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
