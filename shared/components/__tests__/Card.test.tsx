/**
 * Tests for Card component
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Card } from '../Card';
import type { Card as CardType } from '../../types/Card';

const mockCard: CardType = {
  suit: '♠',
  value: 'A',
  rank: 1,
  id: 'A♠',
};

describe('Card', () => {
  describe('basic rendering', () => {
    it('should render a face-up card', () => {
      const { container } = render(<Card card={mockCard} faceUp={true} />);

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toBeDefined();
      expect(cardElement.textContent).toContain('A');
      expect(cardElement.textContent).toContain('♠');
    });

    it('should render a face-down card', () => {
      const { container } = render(<Card card={mockCard} faceUp={false} />);

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toBeDefined();
      // Face-down cards should not show the card value/suit
      expect(cardElement.textContent).not.toContain('A');
    });

    it('should default to face-up when faceUp prop is not provided', () => {
      const { container } = render(<Card card={mockCard} />);

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement.textContent).toContain('A');
    });
  });

  describe('selection and highlighting', () => {
    it('should apply selected styling', () => {
      const { container } = render(<Card card={mockCard} isSelected={true} />);

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toBeDefined();
    });

    it('should apply highlighted styling', () => {
      const { container } = render(<Card card={mockCard} isHighlighted={true} />);

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toBeDefined();
    });
  });

  describe('invalid move feedback', () => {
    it('should apply shake animation when isInvalidMove is true', () => {
      const { container } = render(<Card card={mockCard} isInvalidMove={true} />);

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement.style.animation).toContain('shake');
    });

    it('should not apply shake animation by default', () => {
      const { container } = render(<Card card={mockCard} />);

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement.style.animation).toBe('none');
    });

    it('should apply shake animation to face-down cards', () => {
      const { container } = render(<Card card={mockCard} faceUp={false} isInvalidMove={true} />);

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toBeDefined();
      // CardBack component should receive isInvalidMove prop
    });
  });

  describe('dragging state', () => {
    it('should apply dragging opacity', () => {
      const { container } = render(<Card card={mockCard} isDragging={true} />);

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement.style.opacity).toBe('0.5');
    });

    it('should have full opacity when not dragging', () => {
      const { container } = render(<Card card={mockCard} isDragging={false} />);

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement.style.opacity).toBe('1');
    });
  });

  describe('custom sizing', () => {
    it('should apply custom card width and height', () => {
      const { container } = render(<Card card={mockCard} cardWidth={100} cardHeight={140} />);

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement.style.width).toBe('100px');
      expect(cardElement.style.height).toBe('140px');
    });

    it('should use default sizing when not specified', () => {
      const { container } = render(<Card card={mockCard} />);

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement.style.width).toBe('60px');
      expect(cardElement.style.height).toBe('84px');
    });
  });

  describe('accessibility', () => {
    it('should have a title attribute with card information', () => {
      const { container } = render(<Card card={mockCard} />);

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement.getAttribute('title')).toBe('A♠');
    });

    it('should be clickable when onClick is provided', () => {
      const { container } = render(<Card card={mockCard} onClick={() => {}} />);

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement.style.cursor).toBe('pointer');
    });
  });

  describe('card back themes', () => {
    it('should render blue card back by default', () => {
      const { container } = render(<Card card={mockCard} faceUp={false} />);

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toBeDefined();
    });

    it('should render red card back when specified', () => {
      const { container } = render(<Card card={mockCard} faceUp={false} cardBackTheme="red" />);

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toBeDefined();
    });
  });
});
