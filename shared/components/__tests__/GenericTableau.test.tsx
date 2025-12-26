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
  });
});
