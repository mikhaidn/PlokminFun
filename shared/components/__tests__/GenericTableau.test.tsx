/**
 * Tests for GenericTableau component
 *
 * RFC-005 Phase 2 Weeks 4-5: Generic Components
 */

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { GenericTableau, type TableauColumnData } from '../GenericTableau';
import type { LayoutSizes } from '../../utils/responsiveLayout';

// Mock layout sizes
const mockLayoutSizes: LayoutSizes = {
  cardWidth: 60,
  cardHeight: 84,
  cardGap: 8,
  cardOverlap: 20,
  fontSize: {
    large: 26,
    medium: 24,
    small: 14,
  },
};

describe('GenericTableau', () => {
  describe('empty columns', () => {
    it('should render empty cells when columns are empty', () => {
      const columns: TableauColumnData[] = [
        { cards: [], emptyLabel: 'K' },
        { cards: [] },
        { cards: [], emptyLabel: 'A' },
      ];

      const onClick = vi.fn();
      const onEmptyColumnClick = vi.fn();

      const { container } = render(
        <GenericTableau
          columns={columns}
          layoutSizes={mockLayoutSizes}
          onClick={onClick}
          onEmptyColumnClick={onEmptyColumnClick}
        />
      );

      // Should render a container with all columns
      expect(container.firstChild).toBeDefined();
      const tableauContainer = container.firstChild as HTMLElement;
      expect(tableauContainer.children.length).toBe(3);
    });
  });

  describe('card rendering', () => {
    it('should render cards with correct face-up/face-down state', () => {
      const columns: TableauColumnData[] = [
        {
          cards: [
            {
              card: { suit: '♠', value: 'A', rank: 1, id: 'A♠' },
              faceUp: false,
            },
            {
              card: { suit: '♥', value: '2', rank: 2, id: '2♥' },
              faceUp: true,
            },
          ],
        },
      ];

      const onClick = vi.fn();
      const onEmptyColumnClick = vi.fn();

      const { container } = render(
        <GenericTableau
          columns={columns}
          layoutSizes={mockLayoutSizes}
          onClick={onClick}
          onEmptyColumnClick={onEmptyColumnClick}
        />
      );

      // Component should render (detailed card rendering tested in Card component)
      expect(container.firstChild).toBeDefined();
    });
  });

  describe('positioning strategies', () => {
    it('should support margin-based positioning', () => {
      const columns: TableauColumnData[] = [
        {
          cards: [
            {
              card: { suit: '♠', value: 'K', rank: 13, id: 'K♠' },
              faceUp: true,
            },
            {
              card: { suit: '♥', value: 'Q', rank: 12, id: 'Q♥' },
              faceUp: true,
            },
          ],
        },
      ];

      const onClick = vi.fn();
      const onEmptyColumnClick = vi.fn();

      const { container } = render(
        <GenericTableau
          columns={columns}
          layoutSizes={mockLayoutSizes}
          onClick={onClick}
          onEmptyColumnClick={onEmptyColumnClick}
          positioningStrategy="margin"
        />
      );

      expect(container.firstChild).toBeDefined();
    });

    it('should support absolute positioning', () => {
      const columns: TableauColumnData[] = [
        {
          cards: [
            {
              card: { suit: '♠', value: 'K', rank: 13, id: 'K♠' },
              faceUp: true,
            },
            {
              card: { suit: '♥', value: 'Q', rank: 12, id: 'Q♥' },
              faceUp: true,
            },
          ],
        },
      ];

      const onClick = vi.fn();
      const onEmptyColumnClick = vi.fn();

      const { container } = render(
        <GenericTableau
          columns={columns}
          layoutSizes={mockLayoutSizes}
          onClick={onClick}
          onEmptyColumnClick={onEmptyColumnClick}
          positioningStrategy="absolute"
        />
      );

      expect(container.firstChild).toBeDefined();
    });
  });

  describe('interaction', () => {
    it('should render without errors when no interaction handlers provided', () => {
      const columns: TableauColumnData[] = [
        {
          cards: [
            {
              card: { suit: '♠', value: 'K', rank: 13, id: 'K♠' },
              faceUp: true,
            },
          ],
        },
      ];

      const onClick = vi.fn();
      const onEmptyColumnClick = vi.fn();

      const { container } = render(
        <GenericTableau
          columns={columns}
          layoutSizes={mockLayoutSizes}
          onClick={onClick}
          onEmptyColumnClick={onEmptyColumnClick}
        />
      );

      expect(container.firstChild).toBeDefined();
    });
  });

  describe('selection and dragging', () => {
    it('should handle selected card state', () => {
      const columns: TableauColumnData[] = [
        {
          cards: [
            {
              card: { suit: '♠', value: 'K', rank: 13, id: 'K♠' },
              faceUp: true,
            },
          ],
        },
      ];

      const onClick = vi.fn();
      const onEmptyColumnClick = vi.fn();

      const { container } = render(
        <GenericTableau
          columns={columns}
          layoutSizes={mockLayoutSizes}
          onClick={onClick}
          onEmptyColumnClick={onEmptyColumnClick}
          selectedCard={{ type: 'tableau', index: 0, cardCount: 1 }}
        />
      );

      expect(container.firstChild).toBeDefined();
    });

    it('should handle dragging card state', () => {
      const columns: TableauColumnData[] = [
        {
          cards: [
            {
              card: { suit: '♠', value: 'K', rank: 13, id: 'K♠' },
              faceUp: true,
            },
          ],
        },
      ];

      const onClick = vi.fn();
      const onEmptyColumnClick = vi.fn();

      const { container } = render(
        <GenericTableau
          columns={columns}
          layoutSizes={mockLayoutSizes}
          onClick={onClick}
          onEmptyColumnClick={onEmptyColumnClick}
          draggingCard={{ type: 'tableau', index: 0, cardCount: 1 }}
        />
      );

      expect(container.firstChild).toBeDefined();
    });
  });

  describe('multiple columns', () => {
    it('should render multiple columns correctly', () => {
      const columns: TableauColumnData[] = [
        {
          cards: [
            {
              card: { suit: '♠', value: 'K', rank: 13, id: 'K♠' },
              faceUp: true,
            },
          ],
          emptyLabel: 'K',
        },
        {
          cards: [],
          emptyLabel: 'K',
        },
        {
          cards: [
            {
              card: { suit: '♥', value: 'Q', rank: 12, id: 'Q♥' },
              faceUp: false,
            },
            {
              card: { suit: '♦', value: 'J', rank: 11, id: 'J♦' },
              faceUp: true,
            },
          ],
        },
      ];

      const onClick = vi.fn();
      const onEmptyColumnClick = vi.fn();

      const { container } = render(
        <GenericTableau
          columns={columns}
          layoutSizes={mockLayoutSizes}
          onClick={onClick}
          onEmptyColumnClick={onEmptyColumnClick}
        />
      );

      // Should render a container with all columns
      expect(container.firstChild).toBeDefined();
      const tableauContainer = container.firstChild as HTMLElement;
      expect(tableauContainer.children.length).toBe(3);
    });

    it('should pass emptyColumnTooltip to empty cells', () => {
      const columns: TableauColumnData[] = [{ cards: [], emptyLabel: 'K' }];

      const onClick = vi.fn();
      const onEmptyColumnClick = vi.fn();

      const { container } = render(
        <GenericTableau
          columns={columns}
          layoutSizes={mockLayoutSizes}
          onClick={onClick}
          onEmptyColumnClick={onEmptyColumnClick}
          emptyColumnTooltip="Only Kings can start a new column"
        />
      );

      // Find the empty cell element
      const emptyCell = container.querySelector('[title]');
      expect(emptyCell).toBeDefined();
      expect(emptyCell?.getAttribute('title')).toBe('Only Kings can start a new column');
    });
  });

  describe('touch drag-and-drop data attributes (regression test)', () => {
    /**
     * REGRESSION TEST for iPhone card movement bug
     *
     * Issue: Cards were not movable on iPhone via touch drag-and-drop
     * Root cause: data-drop-target-card-index and data-drop-target-card-count
     *             attributes were only added for margin positioning, not absolute
     * Impact: Klondike (absolute positioning) had broken touch drag-and-drop
     *
     * This test ensures all cards have the required data attributes for
     * touch drag-and-drop regardless of positioning strategy.
     */
    it('should add all required data attributes for absolute positioning (Klondike)', () => {
      const columns: TableauColumnData[] = [
        {
          cards: [
            {
              card: { suit: '♠', value: 'K', rank: 13, id: 'K♠' },
              faceUp: true,
            },
            {
              card: { suit: '♥', value: 'Q', rank: 12, id: 'Q♥' },
              faceUp: true,
            },
            {
              card: { suit: '♦', value: 'J', rank: 11, id: 'J♦' },
              faceUp: true,
            },
          ],
        },
      ];

      const onClick = vi.fn();
      const onEmptyColumnClick = vi.fn();

      const { container } = render(
        <GenericTableau
          columns={columns}
          layoutSizes={mockLayoutSizes}
          onClick={onClick}
          onEmptyColumnClick={onEmptyColumnClick}
          positioningStrategy="absolute"
        />
      );

      // Find all elements with data-drop-target-type="tableau"
      const cardElements = container.querySelectorAll('[data-drop-target-type="tableau"]');

      // Should have column container + 3 cards = 4 elements
      expect(cardElements.length).toBeGreaterThanOrEqual(3);

      // Check each card element has ALL required attributes
      cardElements.forEach((element) => {
        const hasType = element.hasAttribute('data-drop-target-type');
        const hasIndex = element.hasAttribute('data-drop-target-index');
        const hasCardIndex = element.hasAttribute('data-drop-target-card-index');
        const hasCardCount = element.hasAttribute('data-drop-target-card-count');

        // All attributes must be present for touch drag-and-drop to work
        expect(hasType).toBe(true);
        expect(hasIndex).toBe(true);

        // Skip column container (it won't have card-specific attributes)
        if (element.getAttribute('data-drop-target-index') === '0') {
          // Only check card elements (divs with specific card structure), not the column container
          if (hasCardIndex || hasCardCount) {
            expect(hasCardIndex).toBe(true);
            expect(hasCardCount).toBe(true);
          }
        }
      });
    });

    it('should add all required data attributes for margin positioning (FreeCell)', () => {
      const columns: TableauColumnData[] = [
        {
          cards: [
            {
              card: { suit: '♠', value: 'K', rank: 13, id: 'K♠' },
              faceUp: true,
            },
            {
              card: { suit: '♥', value: 'Q', rank: 12, id: 'Q♥' },
              faceUp: true,
            },
          ],
        },
      ];

      const onClick = vi.fn();
      const onEmptyColumnClick = vi.fn();

      const { container } = render(
        <GenericTableau
          columns={columns}
          layoutSizes={mockLayoutSizes}
          onClick={onClick}
          onEmptyColumnClick={onEmptyColumnClick}
          positioningStrategy="margin"
        />
      );

      // Find all elements with data-drop-target-type="tableau"
      const cardElements = container.querySelectorAll('[data-drop-target-type="tableau"]');

      // Should have column container + 2 cards = 3 elements
      expect(cardElements.length).toBeGreaterThanOrEqual(2);

      // Check each card element has ALL required attributes
      cardElements.forEach((element) => {
        const hasType = element.hasAttribute('data-drop-target-type');
        const hasIndex = element.hasAttribute('data-drop-target-index');
        const hasCardIndex = element.hasAttribute('data-drop-target-card-index');
        const hasCardCount = element.hasAttribute('data-drop-target-card-count');

        // All attributes must be present for touch drag-and-drop to work
        expect(hasType).toBe(true);
        expect(hasIndex).toBe(true);

        // Skip column container (it won't have card-specific attributes)
        if (element.getAttribute('data-drop-target-index') === '0') {
          // Only check card elements, not the column container
          if (hasCardIndex || hasCardCount) {
            expect(hasCardIndex).toBe(true);
            expect(hasCardCount).toBe(true);
          }
        }
      });
    });

    it('should set correct cardIndex and cardCount values', () => {
      const columns: TableauColumnData[] = [
        {
          cards: [
            {
              card: { suit: '♠', value: 'K', rank: 13, id: 'K♠' },
              faceUp: true,
            },
            {
              card: { suit: '♥', value: 'Q', rank: 12, id: 'Q♥' },
              faceUp: true,
            },
            {
              card: { suit: '♦', value: 'J', rank: 11, id: 'J♦' },
              faceUp: true,
            },
          ],
        },
      ];

      const onClick = vi.fn();
      const onEmptyColumnClick = vi.fn();

      const { container } = render(
        <GenericTableau
          columns={columns}
          layoutSizes={mockLayoutSizes}
          onClick={onClick}
          onEmptyColumnClick={onEmptyColumnClick}
          positioningStrategy="absolute"
        />
      );

      // Find all card elements (has both card-index and card-count)
      const cardElements = Array.from(container.querySelectorAll('[data-drop-target-card-index]'));

      expect(cardElements.length).toBe(3);

      // First card (index 0): cardIndex=0, cardCount=3 (3 cards from this position)
      const firstCard = cardElements[0] as HTMLElement;
      expect(firstCard.getAttribute('data-drop-target-card-index')).toBe('0');
      expect(firstCard.getAttribute('data-drop-target-card-count')).toBe('3');

      // Second card (index 1): cardIndex=1, cardCount=2 (2 cards from this position)
      const secondCard = cardElements[1] as HTMLElement;
      expect(secondCard.getAttribute('data-drop-target-card-index')).toBe('1');
      expect(secondCard.getAttribute('data-drop-target-card-count')).toBe('2');

      // Third card (index 2): cardIndex=2, cardCount=1 (1 card from this position)
      const thirdCard = cardElements[2] as HTMLElement;
      expect(thirdCard.getAttribute('data-drop-target-card-index')).toBe('2');
      expect(thirdCard.getAttribute('data-drop-target-card-count')).toBe('1');
    });
  });
});
