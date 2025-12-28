/**
 * Tests for InvalidMoveTooltip component
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { InvalidMoveTooltip } from '../InvalidMoveTooltip';

describe('InvalidMoveTooltip', () => {
  it('should render with provided reason and position', () => {
    const { container } = render(
      <InvalidMoveTooltip reason="Invalid move: Wrong color" position={{ x: 100, y: 200 }} />
    );

    const tooltip = container.firstChild as HTMLElement;
    expect(tooltip).toBeDefined();
    expect(tooltip.textContent).toBe('Invalid move: Wrong color');
  });

  it('should apply correct position styles', () => {
    const { container } = render(
      <InvalidMoveTooltip reason="Cannot move card here" position={{ x: 150, y: 250 }} />
    );

    const tooltip = container.firstChild as HTMLElement;
    expect(tooltip.style.left).toBe('150px');
    expect(tooltip.style.top).toBe('250px');
    expect(tooltip.style.position).toBe('fixed');
  });

  it('should have alert role for accessibility', () => {
    const { container } = render(
      <InvalidMoveTooltip reason="Invalid move" position={{ x: 0, y: 0 }} />
    );

    const tooltip = container.firstChild as HTMLElement;
    expect(tooltip.getAttribute('role')).toBe('alert');
  });

  it('should render different reasons correctly', () => {
    const reasons = [
      'No valid moves for this card',
      'Only Kings can start a new column',
      'Wrong color',
      'Not descending order',
    ];

    reasons.forEach((reason) => {
      const { container } = render(
        <InvalidMoveTooltip reason={reason} position={{ x: 100, y: 100 }} />
      );

      const tooltip = container.firstChild as HTMLElement;
      expect(tooltip.textContent).toBe(reason);
    });
  });

  it('should have pointer-events: none to not interfere with interactions', () => {
    const { container } = render(<InvalidMoveTooltip reason="Invalid" position={{ x: 0, y: 0 }} />);

    const tooltip = container.firstChild as HTMLElement;
    expect(tooltip.style.pointerEvents).toBe('none');
  });

  it('should have high z-index to appear above other elements', () => {
    const { container } = render(<InvalidMoveTooltip reason="Invalid" position={{ x: 0, y: 0 }} />);

    const tooltip = container.firstChild as HTMLElement;
    expect(tooltip.style.zIndex).toBe('10000');
  });
});
