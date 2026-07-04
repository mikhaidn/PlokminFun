import { describe, it, expect } from 'vitest';
import { calculateSpiderLayout } from '../spiderLayout';
import { NUM_COLUMNS } from '../../state/gameState';

/** Must match the GameBoard container padding (12px per side). */
const BOARD_PADDING_PX = 24;

function totalBoardWidth(layout: ReturnType<typeof calculateSpiderLayout>): number {
  return layout.cardWidth * NUM_COLUMNS + layout.cardGap * (NUM_COLUMNS - 1);
}

describe('calculateSpiderLayout', () => {
  describe('horizontal fit (regression: board overflowed on phones)', () => {
    const viewports: [number, number][] = [
      [320, 568], // iPhone SE
      [375, 667], // iPhone 8
      [390, 844], // iPhone 14
      [768, 1024], // iPad portrait
      [1280, 800], // laptop
      [1920, 1080], // desktop
    ];

    it.each(viewports)('all 10 columns fit within a %dx%d viewport', (width, height) => {
      const layout = calculateSpiderLayout(width, height);
      expect(totalBoardWidth(layout)).toBeLessThanOrEqual(width - BOARD_PADDING_PX + 0.001);
    });

    it('cards stay usable on the smallest supported phone', () => {
      const layout = calculateSpiderLayout(320, 568);
      expect(layout.cardWidth).toBeGreaterThan(20);
    });
  });

  describe('vertical stack compression', () => {
    it('keeps a 14-card stack within 60% of the viewport height', () => {
      const viewports: [number, number][] = [
        [375, 667],
        [1920, 1080],
      ];

      for (const [width, height] of viewports) {
        const layout = calculateSpiderLayout(width, height);
        const stackHeight = layout.cardHeight + 13 * layout.cardOverlap;
        expect(stackHeight).toBeLessThanOrEqual(height * 0.6 + 0.001);
      }
    });

    it('keeps enough of each covered card visible to read the corner rank', () => {
      const layout = calculateSpiderLayout(375, 667);
      expect(layout.cardOverlap).toBeGreaterThanOrEqual(layout.cardHeight * 0.18 - 0.001);
    });
  });

  it('preserves the card aspect ratio when scaling down', () => {
    const layout = calculateSpiderLayout(375, 667);
    expect(layout.cardHeight / layout.cardWidth).toBeCloseTo(7 / 5, 5);
  });
});
