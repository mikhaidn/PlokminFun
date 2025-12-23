/**
 * CardPack Interface
 *
 * Defines the visual appearance of cards (fronts and backs).
 * All card rendering uses this interface, making it marketplace-ready from day 1.
 *
 * Design principles:
 * - Lightweight: CSS-first, <10KB bundle
 * - Progressive enhancement: Works without JavaScript
 * - Performance: iPad 2+ support (2011+), 60fps
 */

import type { Card } from './types';

/**
 * Card size dimensions
 */
export interface CardSize {
  width: number;
  height: number;
}

/**
 * Font sizes for card rendering
 */
export interface FontSizes {
  large: number;   // Suit symbol
  medium: number;  // Card value
  small: number;   // Corner text
}

/**
 * Animation definition (CSS or JavaScript-based)
 */
export interface AnimationDefinition {
  type: 'css' | 'javascript';
  duration: number;  // milliseconds
  easing?: string;   // CSS timing function (e.g., 'ease-in-out')

  // CSS-based animations
  keyframes?: Record<string, React.CSSProperties>;

  // JS-based animations (future: framer-motion, etc.)
  animateFn?: (element: HTMLElement, options: AnimationOptions) => Promise<void>;
}

export interface AnimationOptions {
  duration?: number;
  easing?: string;
  [key: string]: unknown;
}

/**
 * CardPack manifest metadata
 * Provides compatibility and performance information
 */
export interface CardPackManifest {
  id: string;
  name: string;
  version: string;
  author?: string;
  license?: string;

  // Performance & compatibility metadata
  requirements: {
    maxBundleSize: string;      // e.g., "10kb"
    minSafariVersion?: string;  // e.g., "9.0"
    requiresJS: boolean;        // Card backs work without JS?
    gpuAccelerated?: boolean;   // Uses CSS transforms?
  };

  // Asset information
  assets: {
    cardBacks: {
      type: 'css-pattern' | 'svg' | 'png' | 'custom';
      estimatedSize: string;  // e.g., "2kb"
    };
    cardFronts?: {
      type: 'default' | 'svg-inline' | 'image-atlas';
      estimatedSize: string;
    };
  };
}

/**
 * CardPack interface
 * Defines how cards (fronts and backs) are rendered
 */
export interface CardPack {
  manifest: CardPackManifest;

  // Front face rendering
  renderFront: (card: Card, size: CardSize, fontSize: FontSizes) => React.ReactNode;

  // Back face rendering
  renderBack: (size: CardSize, theme?: string) => React.ReactNode;

  // Optional animation definitions
  animations?: {
    flip?: AnimationDefinition;
    deal?: AnimationDefinition;
    collect?: AnimationDefinition;
  };
}

/**
 * Default card pack manifest
 * Uses CSS patterns for card backs (blue diamond checkerboard)
 */
export const DEFAULT_CARD_PACK_MANIFEST: CardPackManifest = {
  id: 'default',
  name: 'Classic',
  version: '1.0.0',
  author: 'CardGames Team',
  license: 'MIT',
  requirements: {
    maxBundleSize: '5kb',
    minSafariVersion: '9.0',
    requiresJS: false,
    gpuAccelerated: true,
  },
  assets: {
    cardBacks: {
      type: 'css-pattern',
      estimatedSize: '2kb',
    },
    cardFronts: {
      type: 'default',
      estimatedSize: '3kb',
    },
  },
};

/**
 * Default flip animation definition
 * CSS-based 3D transform (GPU-accelerated)
 */
export const DEFAULT_FLIP_ANIMATION: AnimationDefinition = {
  type: 'css',
  duration: 300,
  easing: 'ease-in-out',
  keyframes: {
    '0%': { transform: 'rotateY(0deg)' },
    '100%': { transform: 'rotateY(180deg)' },
  },
};

/**
 * Hook for using card packs
 * v1: Returns default pack manifest only
 * v2: Will load from registry based on packId
 *
 * Note: Full CardPack implementation with render functions is handled
 * directly by Card and CardBack components to avoid circular dependencies.
 *
 * @param packId - Card pack identifier (reserved for future use)
 */
export function useCardPack(packId: string = 'default'): CardPackManifest {
  // v1: Always return default manifest (packId parameter reserved for v2 registry implementation)
  void packId; // Explicitly mark parameter as intentionally unused
  return DEFAULT_CARD_PACK_MANIFEST;
}
