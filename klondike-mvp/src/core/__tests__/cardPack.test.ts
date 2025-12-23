import { describe, test, expect } from 'vitest';
import {
  useCardPack,
  DEFAULT_CARD_PACK_MANIFEST,
  DEFAULT_FLIP_ANIMATION,
  type CardPackManifest,
  type AnimationDefinition,
} from '../cardPack';

describe('CardPack Interface', () => {
  describe('DEFAULT_CARD_PACK_MANIFEST', () => {
    test('has correct id and name', () => {
      expect(DEFAULT_CARD_PACK_MANIFEST.id).toBe('default');
      expect(DEFAULT_CARD_PACK_MANIFEST.name).toBe('Classic');
    });

    test('has version number', () => {
      expect(DEFAULT_CARD_PACK_MANIFEST.version).toBe('1.0.0');
    });

    test('has author and license', () => {
      expect(DEFAULT_CARD_PACK_MANIFEST.author).toBe('CardGames Team');
      expect(DEFAULT_CARD_PACK_MANIFEST.license).toBe('MIT');
    });

    test('meets performance requirements', () => {
      const { requirements } = DEFAULT_CARD_PACK_MANIFEST;
      expect(requirements.maxBundleSize).toBe('5kb');
      expect(requirements.minSafariVersion).toBe('9.0');
      expect(requirements.requiresJS).toBe(false);
      expect(requirements.gpuAccelerated).toBe(true);
    });

    test('has asset metadata', () => {
      const { assets } = DEFAULT_CARD_PACK_MANIFEST;
      expect(assets.cardBacks.type).toBe('css-pattern');
      expect(assets.cardBacks.estimatedSize).toBe('2kb');
      expect(assets.cardFronts?.type).toBe('default');
      expect(assets.cardFronts?.estimatedSize).toBe('3kb');
    });
  });

  describe('DEFAULT_FLIP_ANIMATION', () => {
    test('uses CSS animation type', () => {
      expect(DEFAULT_FLIP_ANIMATION.type).toBe('css');
    });

    test('has 300ms duration', () => {
      expect(DEFAULT_FLIP_ANIMATION.duration).toBe(300);
    });

    test('uses ease-in-out easing', () => {
      expect(DEFAULT_FLIP_ANIMATION.easing).toBe('ease-in-out');
    });

    test('has keyframes for 3D flip', () => {
      expect(DEFAULT_FLIP_ANIMATION.keyframes).toBeDefined();
      expect(DEFAULT_FLIP_ANIMATION.keyframes?.['0%']).toEqual({
        transform: 'rotateY(0deg)',
      });
      expect(DEFAULT_FLIP_ANIMATION.keyframes?.['100%']).toEqual({
        transform: 'rotateY(180deg)',
      });
    });
  });

  describe('useCardPack hook', () => {
    test('returns default manifest for "default" packId', () => {
      const manifest = useCardPack('default');
      expect(manifest).toEqual(DEFAULT_CARD_PACK_MANIFEST);
    });

    test('returns default manifest when no packId provided', () => {
      const manifest = useCardPack();
      expect(manifest).toEqual(DEFAULT_CARD_PACK_MANIFEST);
    });

    test('returns default manifest for unknown packId (v1 behavior)', () => {
      const manifest = useCardPack('unknown-pack');
      expect(manifest).toEqual(DEFAULT_CARD_PACK_MANIFEST);
    });
  });

  describe('CardPackManifest type', () => {
    test('accepts valid manifest', () => {
      const validManifest: CardPackManifest = {
        id: 'test-pack',
        name: 'Test Pack',
        version: '1.0.0',
        author: 'Test Author',
        license: 'MIT',
        requirements: {
          maxBundleSize: '10kb',
          minSafariVersion: '9.0',
          requiresJS: false,
          gpuAccelerated: true,
        },
        assets: {
          cardBacks: {
            type: 'css-pattern',
            estimatedSize: '2kb',
          },
        },
      };

      expect(validManifest.id).toBe('test-pack');
    });
  });

  describe('AnimationDefinition type', () => {
    test('accepts CSS animation', () => {
      const cssAnimation: AnimationDefinition = {
        type: 'css',
        duration: 500,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        keyframes: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      };

      expect(cssAnimation.type).toBe('css');
      expect(cssAnimation.duration).toBe(500);
    });

    test('accepts JavaScript animation', () => {
      const jsAnimation: AnimationDefinition = {
        type: 'javascript',
        duration: 400,
        animateFn: async (element: HTMLElement) => {
          element.style.opacity = '1';
        },
      };

      expect(jsAnimation.type).toBe('javascript');
      expect(jsAnimation.animateFn).toBeDefined();
    });
  });
});
