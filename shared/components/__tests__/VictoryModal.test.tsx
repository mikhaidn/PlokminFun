/**
 * Tests for VictoryModal component
 * Tests rendering, interaction, accessibility, and responsive behavior
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VictoryModal } from '../VictoryModal';

describe('VictoryModal', () => {
  describe('Basic rendering', () => {
    it('should not render when isOpen is false', () => {
      const { container } = render(<VictoryModal isOpen={false} moves={42} onNewGame={() => {}} />);
      expect(container.firstChild).toBeNull();
    });

    it('should render when isOpen is true', () => {
      render(<VictoryModal isOpen={true} moves={42} onNewGame={() => {}} />);
      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    it('should display move count', () => {
      render(<VictoryModal isOpen={true} moves={42} onNewGame={() => {}} />);
      expect(screen.getByText(/42 moves/i)).toBeTruthy();
    });

    it('should display singular "move" when moves is 1', () => {
      render(<VictoryModal isOpen={true} moves={1} onNewGame={() => {}} />);
      expect(screen.getByText(/1 move/i)).toBeTruthy();
      expect(screen.queryByText(/1 moves/i)).toBeNull();
    });

    it('should display default title', () => {
      render(<VictoryModal isOpen={true} moves={42} onNewGame={() => {}} />);
      expect(screen.getByText(/congratulations/i)).toBeTruthy();
    });

    it('should display custom title', () => {
      render(<VictoryModal isOpen={true} moves={42} onNewGame={() => {}} title="🎉 You Won!" />);
      const heading = screen.getByRole('heading');
      expect(heading.textContent).toContain('You Won!');
    });

    it('should add emoji prefix if title does not have one', () => {
      render(<VictoryModal isOpen={true} moves={42} onNewGame={() => {}} title="Great Job!" />);
      const heading = screen.getByRole('heading');
      expect(heading.textContent).toContain('🎉');
      expect(heading.textContent).toContain('Great Job!');
    });

    it('should not add emoji prefix if title already has one', () => {
      render(<VictoryModal isOpen={true} moves={42} onNewGame={() => {}} title="🎉 You Won!" />);
      const heading = screen.getByRole('heading');
      // Should not have double emoji
      expect(heading.textContent).toBe('🎉 You Won!');
    });

    it('should display seed when provided', () => {
      render(<VictoryModal isOpen={true} moves={42} seed={12345} onNewGame={() => {}} />);
      expect(screen.getByText(/seed:\s*12345/i)).toBeTruthy();
    });

    it('should not display seed when not provided', () => {
      render(<VictoryModal isOpen={true} moves={42} onNewGame={() => {}} />);
      expect(screen.queryByText(/seed/i)).toBeNull();
    });

    it('should display game name in message when provided', () => {
      render(<VictoryModal isOpen={true} moves={42} onNewGame={() => {}} gameName="FreeCell" />);
      expect(screen.getByText(/you won freecell/i)).toBeTruthy();
    });

    it('should render New Game button', () => {
      render(<VictoryModal isOpen={true} moves={42} onNewGame={() => {}} />);
      expect(screen.getByRole('button', { name: /new game/i })).toBeTruthy();
    });
  });

  describe('Interaction', () => {
    it('should call onNewGame when button is clicked', () => {
      const onNewGame = vi.fn();
      render(<VictoryModal isOpen={true} moves={42} onNewGame={onNewGame} />);

      const button = screen.getByRole('button', { name: /new game/i });
      fireEvent.click(button);

      expect(onNewGame).toHaveBeenCalledTimes(1);
    });

    it('should call onNewGame when ESC key is pressed', () => {
      const onNewGame = vi.fn();
      render(<VictoryModal isOpen={true} moves={42} onNewGame={onNewGame} />);

      fireEvent.keyDown(window, { key: 'Escape' });

      expect(onNewGame).toHaveBeenCalledTimes(1);
    });

    it('should not call onNewGame for other keys', () => {
      const onNewGame = vi.fn();
      render(<VictoryModal isOpen={true} moves={42} onNewGame={onNewGame} />);

      fireEvent.keyDown(window, { key: 'Enter' });
      fireEvent.keyDown(window, { key: 'Space' });

      expect(onNewGame).not.toHaveBeenCalled();
    });

    it('should not register ESC handler when modal is closed', () => {
      const onNewGame = vi.fn();
      const { rerender } = render(<VictoryModal isOpen={false} moves={42} onNewGame={onNewGame} />);

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onNewGame).not.toHaveBeenCalled();

      // Open the modal
      rerender(<VictoryModal isOpen={true} moves={42} onNewGame={onNewGame} />);

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onNewGame).toHaveBeenCalledTimes(1);
    });

    it('should cleanup ESC handler when modal closes', () => {
      const onNewGame = vi.fn();
      const { rerender } = render(<VictoryModal isOpen={true} moves={42} onNewGame={onNewGame} />);

      // Close the modal
      rerender(<VictoryModal isOpen={false} moves={42} onNewGame={onNewGame} />);

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onNewGame).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<VictoryModal isOpen={true} moves={42} onNewGame={() => {}} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog.getAttribute('aria-modal')).toBe('true');
      expect(dialog.getAttribute('aria-labelledby')).toBe('victory-modal-title');
    });

    it('should have accessible button label', () => {
      render(<VictoryModal isOpen={true} moves={42} onNewGame={() => {}} />);

      const button = screen.getByRole('button', { name: /start new game/i });
      expect(button.getAttribute('aria-label')).toBe('Start new game');
    });

    it('should have proper heading structure', () => {
      render(<VictoryModal isOpen={true} moves={42} onNewGame={() => {}} />);

      const heading = screen.getByRole('heading');
      expect(heading.getAttribute('id')).toBe('victory-modal-title');
    });

    it('should have minimum touch target size', () => {
      render(<VictoryModal isOpen={true} moves={42} onNewGame={() => {}} />);

      const button = screen.getByRole('button', { name: /new game/i }) as HTMLElement;
      const minHeight = parseInt(button.style.minHeight);

      expect(minHeight).toBeGreaterThanOrEqual(44); // WCAG AAA minimum
    });
  });

  describe('Responsive behavior', () => {
    let originalInnerWidth: number;

    beforeEach(() => {
      originalInnerWidth = window.innerWidth;
    });

    afterEach(() => {
      // Restore original width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: originalInnerWidth,
      });
    });

    it('should use mobile styles on small screens', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 400,
      });

      const { container } = render(<VictoryModal isOpen={true} moves={42} onNewGame={() => {}} />);

      // Check that modal content has mobile-appropriate max-width
      const contentDiv = container.querySelector(
        'div[style*="background-color: white"]'
      ) as HTMLElement;
      expect(contentDiv.style.maxWidth).toBe('90%');
    });

    it('should use desktop styles on large screens', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });

      const { container } = render(<VictoryModal isOpen={true} moves={42} onNewGame={() => {}} />);

      // Check that modal content has desktop-appropriate max-width
      const contentDiv = container.querySelector(
        'div[style*="background-color: white"]'
      ) as HTMLElement;
      expect(contentDiv.style.maxWidth).toBe('400px');
    });
  });

  describe('Styling and layout', () => {
    it('should have high z-index to appear above confetti', () => {
      const { container } = render(<VictoryModal isOpen={true} moves={42} onNewGame={() => {}} />);

      const overlay = container.firstChild as HTMLElement;
      expect(parseInt(overlay.style.zIndex)).toBe(10000);
    });

    it('should have semi-transparent backdrop', () => {
      const { container } = render(<VictoryModal isOpen={true} moves={42} onNewGame={() => {}} />);

      const overlay = container.firstChild as HTMLElement;
      expect(overlay.style.backgroundColor).toBe('rgba(0, 0, 0, 0.7)');
    });

    it('should center content', () => {
      const { container } = render(<VictoryModal isOpen={true} moves={42} onNewGame={() => {}} />);

      const overlay = container.firstChild as HTMLElement;
      expect(overlay.style.display).toBe('flex');
      expect(overlay.style.alignItems).toBe('center');
      expect(overlay.style.justifyContent).toBe('center');
    });
  });

  describe('Edge cases', () => {
    it('should handle 0 moves', () => {
      render(<VictoryModal isOpen={true} moves={0} onNewGame={() => {}} />);
      expect(screen.getByText(/0 moves/i)).toBeTruthy();
    });

    it('should handle very large move counts', () => {
      render(<VictoryModal isOpen={true} moves={99999} onNewGame={() => {}} />);
      expect(screen.getByText(/99999 moves/i)).toBeTruthy();
    });

    it('should handle seed value of 0', () => {
      render(<VictoryModal isOpen={true} moves={42} seed={0} onNewGame={() => {}} />);
      expect(screen.getByText(/seed:\s*0/i)).toBeTruthy();
    });

    it('should stop propagation on content click', () => {
      const onNewGame = vi.fn();
      const { container } = render(<VictoryModal isOpen={true} moves={42} onNewGame={onNewGame} />);

      const contentDiv = container.querySelector(
        'div[style*="background-color: white"]'
      ) as HTMLElement;
      fireEvent.click(contentDiv);

      // Should not trigger backdrop click behavior
      expect(onNewGame).not.toHaveBeenCalled();
    });
  });
});
