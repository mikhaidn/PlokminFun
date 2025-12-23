/**
 * High contrast styling utilities for better visibility
 */

import { type Card } from '../core/types';
import { isRed } from '../rules/klondikeRules';

export interface CardColors {
  text: string;
  background: string;
  border: string;
  borderWidth: string;
}

/**
 * Get card colors based on high contrast mode
 */
export function getCardColors(card: Card, highContrast: boolean, isSelected: boolean, isHighlighted: boolean): CardColors {
  const red = isRed(card);

  if (highContrast) {
    // High contrast mode: pure black/bright red, thicker borders
    return {
      text: red ? '#ff0000' : '#000000',
      background: isHighlighted ? '#ffffe0' : '#ffffff',
      border: isSelected || isHighlighted ? '#00aa00' : '#000000',
      borderWidth: isSelected ? '4px' : isHighlighted ? '3px' : '2px',
    };
  } else {
    // Normal mode: current styling
    return {
      text: red ? '#c41e3a' : '#1a1a2e',
      background: isHighlighted ? '#e8f5e9' : 'white',
      border: isSelected || isHighlighted ? '#4caf50' : '#ccc',
      borderWidth: isSelected || isHighlighted ? '2px' : '1px',
    };
  }
}

/**
 * Get box shadow based on selection state and high contrast mode
 */
export function getCardBoxShadow(isSelected: boolean, isHighlighted: boolean, highContrast: boolean): string {
  if (highContrast) {
    if (isSelected) {
      return '0 0 12px rgba(0, 170, 0, 0.8)';
    } else if (isHighlighted) {
      return '0 0 8px rgba(0, 170, 0, 0.6)';
    }
    return '0 4px 8px rgba(0, 0, 0, 0.4)';
  } else {
    if (isSelected) {
      return '0 0 8px rgba(76, 175, 80, 0.5)';
    } else if (isHighlighted) {
      return '0 0 4px rgba(76, 175, 80, 0.3)';
    }
    return '0 2px 4px rgba(0,0,0,0.1)';
  }
}
