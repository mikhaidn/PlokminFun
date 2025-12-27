/**
 * Tests for EmptyCell component
 * Tests for iPhone drag-to-empty-cell and tap-tap highlighting fixes
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyCell } from '../EmptyCell';

describe('EmptyCell', () => {
  describe('Basic rendering', () => {
    it('should render empty cell with default styling', () => {
      const { container } = render(<EmptyCell />);
      const cell = container.firstChild as HTMLElement;

      expect(cell).toBeTruthy();
      expect(cell.style.width).toBe('60px'); // default cardWidth
      expect(cell.style.height).toBe('84px'); // default cardHeight
    });

    it('should render label when provided', () => {
      render(<EmptyCell label="♠" />);
      expect(screen.getByText('♠')).toBeTruthy();
    });

    it('should apply custom dimensions', () => {
      const { container } = render(<EmptyCell cardWidth={80} cardHeight={112} />);
      const cell = container.firstChild as HTMLElement;

      expect(cell.style.width).toBe('80px');
      expect(cell.style.height).toBe('112px');
    });
  });

  describe('Click handling', () => {
    it('should call onClick when clicked', () => {
      const onClick = vi.fn();
      const { container } = render(<EmptyCell onClick={onClick} />);
      const cell = container.firstChild as HTMLElement;

      fireEvent.click(cell);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should show pointer cursor when onClick is provided', () => {
      const { container } = render(<EmptyCell onClick={() => {}} />);
      const cell = container.firstChild as HTMLElement;

      expect(cell.style.cursor).toBe('pointer');
    });

    it('should show default cursor when onClick is not provided', () => {
      const { container } = render(<EmptyCell />);
      const cell = container.firstChild as HTMLElement;

      expect(cell.style.cursor).toBe('default');
    });
  });

  describe('Highlighting for smart tap-to-move', () => {
    it('should not highlight by default', () => {
      const { container } = render(<EmptyCell />);
      const cell = container.firstChild as HTMLElement;

      expect(cell.style.backgroundColor).toBe('rgb(245, 245, 245)'); // #f5f5f5
      expect(cell.style.border).toBe('2px dashed rgb(204, 204, 204)'); // #ccc
      expect(cell.style.boxShadow).toBe('none');
    });

    it('should highlight when isHighlighted is true', () => {
      const { container } = render(<EmptyCell isHighlighted={true} />);
      const cell = container.firstChild as HTMLElement;

      // Yellow background for highlighted cells
      expect(cell.style.backgroundColor).toBe('rgb(255, 235, 59)'); // #ffeb3b
      expect(cell.style.border).toBe('3px solid rgb(251, 192, 45)'); // #fbc02d
      expect(cell.style.boxShadow).toContain('rgba(251, 192, 45, 0.8)');
    });

    it('should not highlight when isHighlighted is false', () => {
      const { container } = render(<EmptyCell isHighlighted={false} />);
      const cell = container.firstChild as HTMLElement;

      expect(cell.style.backgroundColor).toBe('rgb(245, 245, 245)');
      expect(cell.style.boxShadow).toBe('none');
    });
  });

  describe('Drop target attributes for iPhone touch drag', () => {
    it('should accept and render data-drop-target-type attribute', () => {
      const { container } = render(<EmptyCell data-drop-target-type="freeCell" />);
      const cell = container.firstChild as HTMLElement;

      expect(cell.getAttribute('data-drop-target-type')).toBe('freeCell');
    });

    it('should accept and render data-drop-target-index attribute', () => {
      const { container } = render(
        <EmptyCell data-drop-target-type="freeCell" data-drop-target-index={2} />
      );
      const cell = container.firstChild as HTMLElement;

      expect(cell.getAttribute('data-drop-target-index')).toBe('2');
    });

    it('should accept foundation drop target attributes', () => {
      const { container } = render(
        <EmptyCell data-drop-target-type="foundation" data-drop-target-index={3} />
      );
      const cell = container.firstChild as HTMLElement;

      expect(cell.getAttribute('data-drop-target-type')).toBe('foundation');
      expect(cell.getAttribute('data-drop-target-index')).toBe('3');
    });

    it('should accept tableau drop target attributes', () => {
      const { container } = render(
        <EmptyCell
          data-drop-target-type="tableau"
          data-drop-target-index={5}
          data-drop-target-card-index={0}
          data-drop-target-card-count={0}
        />
      );
      const cell = container.firstChild as HTMLElement;

      expect(cell.getAttribute('data-drop-target-type')).toBe('tableau');
      expect(cell.getAttribute('data-drop-target-index')).toBe('5');
      expect(cell.getAttribute('data-drop-target-card-index')).toBe('0');
      expect(cell.getAttribute('data-drop-target-card-count')).toBe('0');
    });
  });

  describe('Combined behavior: highlighted empty cell with drop attributes', () => {
    it('should render highlighted empty cell with drop attributes for smart tap destination', () => {
      const onClick = vi.fn();
      const { container } = render(
        <EmptyCell
          onClick={onClick}
          label="♥"
          isHighlighted={true}
          data-drop-target-type="foundation"
          data-drop-target-index={1}
        />
      );
      const cell = container.firstChild as HTMLElement;

      // Should be highlighted
      expect(cell.style.backgroundColor).toBe('rgb(255, 235, 59)');
      expect(cell.style.boxShadow).toContain('rgba(251, 192, 45, 0.8)');

      // Should have drop target attributes
      expect(cell.getAttribute('data-drop-target-type')).toBe('foundation');
      expect(cell.getAttribute('data-drop-target-index')).toBe('1');

      // Should have label
      expect(screen.getByText('♥')).toBeTruthy();

      // Should be clickable
      fireEvent.click(cell);
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Custom styles', () => {
    it('should merge custom styles with default styles', () => {
      const { container } = render(<EmptyCell style={{ opacity: 0.5 }} />);
      const cell = container.firstChild as HTMLElement;

      expect(cell.style.opacity).toBe('0.5');
      // Default styles should still apply
      expect(cell.style.width).toBe('60px');
    });
  });
});
