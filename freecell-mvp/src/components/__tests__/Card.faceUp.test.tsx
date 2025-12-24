import { describe, test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Card } from '@cardgames/shared';
import type { Card as CardType } from '../../core/types';

const testCard: CardType = {
  suit: '♥',
  value: '7',
  rank: 7,
  id: '7♥',
};

describe('Card with faceUp prop', () => {
  test('renders face-up by default (backwards compatibility)', () => {
    const { container } = render(
      <Card card={testCard} cardWidth={60} cardHeight={84} />
    );

    const card = container.firstChild as HTMLElement;
    // Face-up cards show the card content
    expect(card.textContent).toContain('7');
    expect(card.textContent).toContain('♥');
    // Should not have card-back class
    expect(card.className).not.toContain('card-back');
  });

  test('renders face-up when faceUp={true}', () => {
    const { container } = render(
      <Card
        card={testCard}
        cardWidth={60}
        cardHeight={84}
        faceUp={true}
      />
    );

    const card = container.firstChild as HTMLElement;
    expect(card.textContent).toContain('7');
    expect(card.textContent).toContain('♥');
  });

  test('renders face-down when faceUp={false}', () => {
    const { container } = render(
      <Card
        card={testCard}
        cardWidth={60}
        cardHeight={84}
        faceUp={false}
      />
    );

    const card = container.firstChild as HTMLElement;
    // Face-down cards show card back pattern
    expect(card.className).toContain('card-back');
    expect(card.getAttribute('aria-label')).toBe('Face-down card');
    // Should not show card value/suit
    expect(card.textContent).not.toContain('7');
    expect(card.textContent).not.toContain('♥');
  });

  test('face-down card uses blue theme by default', () => {
    const { container } = render(
      <Card
        card={testCard}
        cardWidth={60}
        cardHeight={84}
        faceUp={false}
      />
    );

    const card = container.firstChild as HTMLElement;
    // Browser converts hex to RGB: #1e3a8a -> rgb(30, 58, 138)
    expect(card.style.background).toContain('rgb(30, 58, 138)');
  });

  test('face-down card uses red theme when specified', () => {
    const { container } = render(
      <Card
        card={testCard}
        cardWidth={60}
        cardHeight={84}
        faceUp={false}
        cardBackTheme="red"
      />
    );

    const card = container.firstChild as HTMLElement;
    // Browser converts hex to RGB: #7f1d1d -> rgb(127, 29, 29)
    expect(card.style.background).toContain('rgb(127, 29, 29)');
  });

  test('face-down card has correct dimensions', () => {
    const { container } = render(
      <Card
        card={testCard}
        cardWidth={80}
        cardHeight={112}
        faceUp={false}
      />
    );

    const card = container.firstChild as HTMLElement;
    expect(card.style.width).toBe('80px');
    expect(card.style.height).toBe('112px');
  });
});
