import { describe, test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { CardBack } from '@cardgames/shared';

describe('CardBack', () => {
  test('renders with correct dimensions', () => {
    const { container } = render(
      <CardBack cardWidth={60} cardHeight={84} />
    );

    const cardBack = container.firstChild as HTMLElement;
    expect(cardBack.style.width).toBe('60px');
    expect(cardBack.style.height).toBe('84px');
  });

  test('has correct accessibility attributes', () => {
    const { container } = render(
      <CardBack cardWidth={60} cardHeight={84} />
    );

    const cardBack = container.firstChild as HTMLElement;
    expect(cardBack.getAttribute('role')).toBe('img');
    expect(cardBack.getAttribute('aria-label')).toBe('Face-down card');
  });

  test('renders with blue theme by default', () => {
    const { container } = render(
      <CardBack cardWidth={60} cardHeight={84} />
    );

    const cardBack = container.firstChild as HTMLElement;
    // Browser converts hex to RGB: #1e3a8a -> rgb(30, 58, 138), #2563eb -> rgb(37, 99, 235)
    expect(cardBack.style.background).toContain('rgb(30, 58, 138)');
    expect(cardBack.style.background).toContain('rgb(37, 99, 235)');
  });

  test('renders with red theme when specified', () => {
    const { container } = render(
      <CardBack cardWidth={60} cardHeight={84} theme="red" />
    );

    const cardBack = container.firstChild as HTMLElement;
    // Browser converts hex to RGB: #7f1d1d -> rgb(127, 29, 29), #dc2626 -> rgb(220, 38, 38)
    expect(cardBack.style.background).toContain('rgb(127, 29, 29)');
    expect(cardBack.style.background).toContain('rgb(220, 38, 38)');
  });

  test('renders with custom image when provided', () => {
    const customImage = 'https://example.com/custom-back.png';
    const { container } = render(
      <CardBack
        cardWidth={60}
        cardHeight={84}
        theme="custom"
        customImage={customImage}
      />
    );

    const cardBack = container.firstChild as HTMLElement;
    expect(cardBack.style.background).toContain(customImage);
  });

  test('applies custom className', () => {
    const { container } = render(
      <CardBack cardWidth={60} cardHeight={84} className="custom-class" />
    );

    const cardBack = container.firstChild as HTMLElement;
    expect(cardBack.className).toContain('custom-class');
  });

  test('is draggable when draggable prop is true', () => {
    const { container } = render(
      <CardBack cardWidth={60} cardHeight={84} draggable={true} />
    );

    const cardBack = container.firstChild as HTMLElement;
    expect(cardBack.draggable).toBe(true);
  });

  test('is not draggable by default', () => {
    const { container } = render(
      <CardBack cardWidth={60} cardHeight={84} />
    );

    const cardBack = container.firstChild as HTMLElement;
    expect(cardBack.draggable).toBe(false);
  });

  test('has correct border radius', () => {
    const { container } = render(
      <CardBack cardWidth={60} cardHeight={84} />
    );

    const cardBack = container.firstChild as HTMLElement;
    expect(cardBack.style.borderRadius).toBe('8px');
  });

  test('has correct border styling', () => {
    const { container } = render(
      <CardBack cardWidth={60} cardHeight={84} />
    );

    const cardBack = container.firstChild as HTMLElement;
    // Browser converts hex to RGB: #333 -> rgb(51, 51, 51)
    expect(cardBack.style.border).toBe('1px solid rgb(51, 51, 51)');
  });
});
