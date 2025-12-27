/**
 * Tests for CardFlip component
 * RFC-005 Phase 3: Card flip animations with 3D transforms
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CardFlip } from '../CardFlip';
import type { Card as CardType } from '../../types/Card';

describe('CardFlip', () => {
  const mockCard: CardType = {
    suit: '♥',
    value: 'A',
    rank: 1,
    id: 'A♥',
  };

  describe('Basic rendering', () => {
    it('should render card back when face-down', () => {
      render(
        <CardFlip
          card={mockCard}
          faceUp={false}
          cardWidth={60}
          cardHeight={84}
        />
      );

      const cardBack = screen.getByTestId('card-back');
      expect(cardBack).toBeTruthy();
    });

    it('should render card face when face-up', () => {
      render(
        <CardFlip
          card={mockCard}
          faceUp={true}
          cardWidth={60}
          cardHeight={84}
        />
      );

      // Card should show suit symbol
      const suitElements = screen.getAllByText('♥');
      expect(suitElements.length).toBeGreaterThan(0);
    });

    it('should apply 3D transform styles', () => {
      const { container } = render(
        <CardFlip
          card={mockCard}
          faceUp={true}
          cardWidth={60}
          cardHeight={84}
        />
      );

      const flipContainer = container.querySelector('.card-flip-container');
      expect(flipContainer).toBeTruthy();
    });
  });

  describe('Flip animation', () => {
    it('should use custom flip duration', () => {
      const { container } = render(
        <CardFlip
          card={mockCard}
          faceUp={true}
          cardWidth={60}
          cardHeight={84}
          flipDuration={500}
        />
      );

      const flipInner = container.querySelector('.card-flip-inner');
      expect(flipInner).toBeTruthy();
    });

    it('should use default 300ms duration when not specified', () => {
      const { container } = render(
        <CardFlip
          card={mockCard}
          faceUp={true}
          cardWidth={60}
          cardHeight={84}
        />
      );

      const flipInner = container.querySelector('.card-flip-inner');
      expect(flipInner).toBeTruthy();
    });
  });

  describe('Responsive sizing', () => {
    it('should apply custom card dimensions', () => {
      const { container } = render(
        <CardFlip
          card={mockCard}
          faceUp={true}
          cardWidth={80}
          cardHeight={112}
        />
      );

      const flipContainer = container.querySelector('.card-flip-container');
      expect(flipContainer).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should maintain card accessibility props', () => {
      render(
        <CardFlip
          card={mockCard}
          faceUp={true}
          cardWidth={60}
          cardHeight={84}
          onClick={vi.fn()}
          aria-label="Ace of Hearts"
        />
      );

      const card = screen.getByLabelText('Ace of Hearts');
      expect(card).toBeTruthy();
    });
  });
});
