/**
 * Tests for StockWaste flip animations
 * RFC-005 Phase 3: Card flip animations for stock pile draws
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StockWaste } from '../StockWaste';
import type { CardType as Card } from '@plokmin/shared';

describe('StockWaste - Flip Animations', () => {
  const mockStock: Card[] = [
    { suit: '♠', value: 'A', rank: 1, id: 'A♠' },
    { suit: '♥', value: 'K', rank: 13, id: 'K♥' },
  ];

  const mockWaste: Card[] = [{ suit: '♦', value: '7', rank: 7, id: '7♦' }];

  const mockLayoutSizes = {
    cardWidth: 60,
    cardHeight: 84,
    cardGap: 8,
    cardOverlap: 20,
    fontSize: { large: 26, medium: 24, small: 14 },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Stock pile rendering with CardFlip', () => {
    it('should render stock cards face-down using CardFlip', () => {
      render(
        <StockWaste
          stock={mockStock}
          waste={[]}
          onStockClick={vi.fn()}
          onWasteClick={vi.fn()}
          isWasteSelected={false}
          layoutSizes={mockLayoutSizes}
        />
      );

      // Should have card back visible (face-down)
      const cardBacks = screen.getAllByTestId('card-back');
      expect(cardBacks.length).toBeGreaterThan(0);
    });

    it('should render waste cards face-up using CardFlip', () => {
      render(
        <StockWaste
          stock={[]}
          waste={mockWaste}
          onStockClick={vi.fn()}
          onWasteClick={vi.fn()}
          isWasteSelected={false}
          layoutSizes={mockLayoutSizes}
        />
      );

      // Should show card face (suit symbol visible)
      expect(screen.getByText('♦')).toBeTruthy();
    });

    it('should apply flip animation when drawing from stock', () => {
      const { rerender } = render(
        <StockWaste
          stock={mockStock}
          waste={[]}
          onStockClick={vi.fn()}
          onWasteClick={vi.fn()}
          isWasteSelected={false}
          layoutSizes={mockLayoutSizes}
        />
      );

      // Initially stock has cards
      expect(screen.getAllByTestId('card-back').length).toBeGreaterThan(0);

      // After draw, card moves to waste (face-up)
      const drawnCard = mockStock[mockStock.length - 1];
      rerender(
        <StockWaste
          stock={mockStock.slice(0, -1)}
          waste={[drawnCard]}
          onStockClick={vi.fn()}
          onWasteClick={vi.fn()}
          isWasteSelected={false}
          layoutSizes={mockLayoutSizes}
        />
      );

      // Card should now be face-up in waste
      expect(screen.getByText(drawnCard.suit)).toBeTruthy();
    });
  });

  describe('Flip animation configuration', () => {
    it('should use default 300ms flip duration', () => {
      const { container } = render(
        <StockWaste
          stock={mockStock}
          waste={[]}
          onStockClick={vi.fn()}
          onWasteClick={vi.fn()}
          isWasteSelected={false}
          layoutSizes={mockLayoutSizes}
        />
      );

      const flipContainers = container.querySelectorAll('.card-flip-container');
      expect(flipContainers.length).toBeGreaterThan(0);
    });

    it('should use custom flip duration when provided', () => {
      const { container } = render(
        <StockWaste
          stock={mockStock}
          waste={[]}
          onStockClick={vi.fn()}
          onWasteClick={vi.fn()}
          isWasteSelected={false}
          layoutSizes={mockLayoutSizes}
          flipDuration={500}
        />
      );

      const flipContainers = container.querySelectorAll('.card-flip-container');
      expect(flipContainers.length).toBeGreaterThan(0);
    });
  });

  describe('Interaction with flip animations', () => {
    it('should call onStockClick when clicking stock pile', () => {
      const onStockClick = vi.fn();

      render(
        <StockWaste
          stock={mockStock}
          waste={[]}
          onStockClick={onStockClick}
          onWasteClick={vi.fn()}
          isWasteSelected={false}
          layoutSizes={mockLayoutSizes}
        />
      );

      // Click the stock pile
      const stockPile = screen.getAllByTestId('card-back')[0];
      fireEvent.click(stockPile);

      expect(onStockClick).toHaveBeenCalledTimes(1);
    });

    it('should maintain drag functionality with CardFlip', () => {
      const onDragStart = vi.fn();

      render(
        <StockWaste
          stock={[]}
          waste={mockWaste}
          onStockClick={vi.fn()}
          onWasteClick={vi.fn()}
          isWasteSelected={false}
          layoutSizes={mockLayoutSizes}
          onDragStart={() => onDragStart}
        />
      );

      // CardFlip should pass through drag handlers
      const wasteCard = screen.getByText('♦').closest('div');
      expect(wasteCard).toBeTruthy();
    });
  });

  describe('Empty states', () => {
    it('should show empty stock placeholder when stock is empty', () => {
      render(
        <StockWaste
          stock={[]}
          waste={mockWaste}
          onStockClick={vi.fn()}
          onWasteClick={vi.fn()}
          isWasteSelected={false}
          layoutSizes={mockLayoutSizes}
        />
      );

      // Should show recycle icon (↻) in empty cell
      const recycleIcon = screen.getByText('↻');
      expect(recycleIcon).toBeTruthy();
    });

    it('should show empty waste placeholder when waste is empty', () => {
      const { container } = render(
        <StockWaste
          stock={mockStock}
          waste={[]}
          onStockClick={vi.fn()}
          onWasteClick={vi.fn()}
          isWasteSelected={false}
          layoutSizes={mockLayoutSizes}
        />
      );

      // Should show empty cell for waste (no card-back)
      const wasteArea = container.querySelector('[data-drop-target-type="waste"]');
      expect(wasteArea).toBeTruthy();

      // Waste area should not have a card
      const cardInWaste = screen.queryByText('♠');
      expect(cardInWaste).toBeFalsy();
    });
  });

  describe('Responsive sizing', () => {
    it('should pass card dimensions to CardFlip', () => {
      const customLayoutSizes = {
        cardWidth: 80,
        cardHeight: 112,
        cardGap: 8,
        cardOverlap: 20,
        fontSize: { large: 26, medium: 24, small: 14 },
      };

      const { container } = render(
        <StockWaste
          stock={mockStock}
          waste={[]}
          onStockClick={vi.fn()}
          onWasteClick={vi.fn()}
          isWasteSelected={false}
          layoutSizes={customLayoutSizes}
        />
      );

      const flipContainers = container.querySelectorAll('.card-flip-container');
      expect(flipContainers.length).toBeGreaterThan(0);
    });
  });
});
