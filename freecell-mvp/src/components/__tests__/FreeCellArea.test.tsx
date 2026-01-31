/**
 * Tests for FreeCellArea component
 * Tests for iPhone tap-tap highlighting and drag-to-empty-cell fixes
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FreeCellArea } from '../FreeCellArea';
import type { CardType, GameLocation } from '@plokmin/shared';

describe('FreeCellArea', () => {
  const mockCard1: CardType = {
    suit: '♥',
    value: 'A',
    rank: 1,
    id: 'A♥',
  };

  const mockCard2: CardType = {
    suit: '♠',
    value: 'K',
    rank: 13,
    id: 'K♠',
  };

  describe('Basic rendering', () => {
    it('should render 4 free cells', () => {
      const freeCells: (CardType | null)[] = [null, null, null, null];
      const { container } = render(
        <FreeCellArea
          freeCells={freeCells}
          selectedCard={null}
          draggingCard={null}
          onFreeCellClick={vi.fn()}
        />
      );

      // Each cell has a wrapper div, so we get the direct children of the flex container
      const flexContainer = container.querySelector('[style*="display: flex"]');
      const cells = flexContainer?.children;
      expect(cells?.length).toBe(4);
    });

    it('should render cards in occupied cells', () => {
      const freeCells: (CardType | null)[] = [mockCard1, null, mockCard2, null];
      render(
        <FreeCellArea
          freeCells={freeCells}
          selectedCard={null}
          draggingCard={null}
          onFreeCellClick={vi.fn()}
        />
      );

      // Cards render their values in the title attribute
      expect(screen.getByTitle('A♥')).toBeTruthy();
      expect(screen.getByTitle('K♠')).toBeTruthy();
    });
  });

  describe('Drop target attributes for iPhone touch drag', () => {
    it('should add drop target attributes to empty cells', () => {
      const freeCells: (CardType | null)[] = [null, null, null, null];
      const { container } = render(
        <FreeCellArea
          freeCells={freeCells}
          selectedCard={null}
          draggingCard={null}
          onFreeCellClick={vi.fn()}
        />
      );

      // Get the wrapper divs (one per free cell)
      const flexContainer = container.querySelector('[style*="display: flex"]');
      const wrapperDivs = flexContainer?.querySelectorAll('[data-drop-target-type="freeCell"]');

      // Should have 4 wrapper divs with drop target attributes
      expect(wrapperDivs?.length).toBeGreaterThanOrEqual(4);

      // Check each wrapper has the correct attributes
      const uniqueIndices = new Set<string>();
      wrapperDivs?.forEach((cell) => {
        expect(cell.getAttribute('data-drop-target-type')).toBe('freeCell');
        const index = cell.getAttribute('data-drop-target-index');
        if (index !== null) {
          uniqueIndices.add(index);
        }
      });

      // Should have indices 0, 1, 2, 3
      expect(uniqueIndices.size).toBe(4);
    });

    it('should add drop target attributes to occupied cells', () => {
      const freeCells: (CardType | null)[] = [mockCard1, mockCard2, null, null];
      const { container } = render(
        <FreeCellArea
          freeCells={freeCells}
          selectedCard={null}
          draggingCard={null}
          onFreeCellClick={vi.fn()}
        />
      );

      // Both cards and their containers should have drop target attributes
      const dropTargets = container.querySelectorAll('[data-drop-target-type="freeCell"]');
      expect(dropTargets.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Highlighted cells for smart tap-to-move', () => {
    it('should not highlight cells by default', () => {
      const freeCells: (CardType | null)[] = [null, null, null, null];
      const { container } = render(
        <FreeCellArea
          freeCells={freeCells}
          selectedCard={null}
          draggingCard={null}
          onFreeCellClick={vi.fn()}
        />
      );

      // Check that empty cells don't have highlighted background
      const cells = container.querySelectorAll('[data-drop-target-type="freeCell"]');
      cells.forEach((cell) => {
        const style = (cell as HTMLElement).style;
        expect(style.backgroundColor).not.toBe('rgb(255, 235, 59)'); // Not highlighted yellow
      });
    });

    it('should highlight empty cells when in highlightedCells array', () => {
      const freeCells: (CardType | null)[] = [null, null, null, null];
      const highlightedCells: GameLocation[] = [
        { type: 'freeCell', index: 0, cardCount: 1 },
        { type: 'freeCell', index: 2, cardCount: 1 },
      ];

      const { container } = render(
        <FreeCellArea
          freeCells={freeCells}
          selectedCard={null}
          draggingCard={null}
          highlightedCells={highlightedCells}
          onFreeCellClick={vi.fn()}
        />
      );

      // Get the wrapper divs
      const flexContainer = container.querySelector('[style*="display: flex"]');
      const wrappers = Array.from(
        flexContainer?.querySelectorAll('[data-drop-target-type="freeCell"]') || []
      );

      // Find the EmptyCell divs (child of each wrapper, second occurrence of data-drop-target-index)
      const emptyCells: HTMLElement[] = [];
      wrappers.forEach((wrapper) => {
        const index = wrapper.getAttribute('data-drop-target-index');
        // The EmptyCell is the first child of the wrapper
        const emptyCell = wrapper.firstChild as HTMLElement;
        if (emptyCell && index !== null) {
          emptyCells[parseInt(index)] = emptyCell;
        }
      });

      // Cells 0 and 2 should be highlighted (yellow background)
      expect(emptyCells[0]?.style.backgroundColor).toContain('255, 235, 59'); // rgb(255, 235, 59)
      expect(emptyCells[2]?.style.backgroundColor).toContain('255, 235, 59');

      // Cells 1 and 3 should not be highlighted
      expect(emptyCells[1]?.style.backgroundColor).toContain('245, 245, 245'); // rgb(245, 245, 245)
      expect(emptyCells[3]?.style.backgroundColor).toContain('245, 245, 245');
    });

    it('should highlight occupied cells when in highlightedCardIds array', () => {
      const freeCells: (CardType | null)[] = [mockCard1, mockCard2, null, null];
      const highlightedCardIds = ['A♥'];

      const { container } = render(
        <FreeCellArea
          freeCells={freeCells}
          selectedCard={null}
          draggingCard={null}
          highlightedCardIds={highlightedCardIds}
          onFreeCellClick={vi.fn()}
        />
      );

      // The A♥ card should be highlighted (this is for hints feature)
      // Check that at least one card has highlighted styling
      const cards = container.querySelectorAll('[data-drop-target-type="freeCell"]');
      let hasHighlightedCard = false;

      cards.forEach((card) => {
        if (card.textContent?.includes('A')) {
          const style = window.getComputedStyle(card);
          // Highlighted cards have different border or background
          if (style.border.includes('solid') || style.boxShadow !== 'none') {
            hasHighlightedCard = true;
          }
        }
      });

      expect(hasHighlightedCard).toBe(true);
    });

    it('should support both highlightedCells and highlightedCardIds simultaneously', () => {
      const freeCells: (CardType | null)[] = [mockCard1, null, mockCard2, null];
      const highlightedCardIds = ['A♥']; // Highlight card in cell 0
      const highlightedCells: GameLocation[] = [
        { type: 'freeCell', index: 1, cardCount: 1 }, // Highlight empty cell 1
      ];

      const { container } = render(
        <FreeCellArea
          freeCells={freeCells}
          selectedCard={null}
          draggingCard={null}
          highlightedCardIds={highlightedCardIds}
          highlightedCells={highlightedCells}
          onFreeCellClick={vi.fn()}
        />
      );

      // Get the wrapper divs
      const flexContainer = container.querySelector('[style*="display: flex"]');
      const wrappers = Array.from(
        flexContainer?.querySelectorAll('[data-drop-target-type="freeCell"]') || []
      );

      // Find cell 1 (empty, should be highlighted)
      const wrapper1 = wrappers.find((el) => el.getAttribute('data-drop-target-index') === '1');
      const emptyCell1 = wrapper1?.firstChild as HTMLElement;

      // Cell 1 (empty) should be highlighted via highlightedCells
      expect(emptyCell1?.style.backgroundColor).toContain('255, 235, 59');
    });
  });

  describe('Integration: Drag and tap-tap highlighting together', () => {
    it('should support drag-to-empty-cell and highlight valid destinations', () => {
      const freeCells: (CardType | null)[] = [mockCard1, null, null, null];
      const highlightedCells: GameLocation[] = [
        { type: 'freeCell', index: 1, cardCount: 1 },
        { type: 'freeCell', index: 2, cardCount: 1 },
      ];

      const { container } = render(
        <FreeCellArea
          freeCells={freeCells}
          selectedCard={null}
          draggingCard={null}
          highlightedCells={highlightedCells}
          onFreeCellClick={vi.fn()}
          onDrop={vi.fn()}
        />
      );

      // All cells should have drop target attributes (for drag)
      const dropTargets = container.querySelectorAll('[data-drop-target-type="freeCell"]');
      expect(dropTargets.length).toBeGreaterThanOrEqual(4);

      // Get the wrapper divs
      const flexContainer = container.querySelector('[style*="display: flex"]');
      const wrappers = Array.from(
        flexContainer?.querySelectorAll('[data-drop-target-type="freeCell"]') || []
      );

      // Find cells 1 and 2 (should be highlighted)
      const wrapper1 = wrappers.find((el) => el.getAttribute('data-drop-target-index') === '1');
      const wrapper2 = wrappers.find((el) => el.getAttribute('data-drop-target-index') === '2');

      const emptyCell1 = wrapper1?.firstChild as HTMLElement;
      const emptyCell2 = wrapper2?.firstChild as HTMLElement;

      // Cells 1 and 2 should be highlighted (for tap-tap)
      expect(emptyCell1?.style.backgroundColor).toContain('255, 235, 59');
      expect(emptyCell2?.style.backgroundColor).toContain('255, 235, 59');
    });
  });
});
