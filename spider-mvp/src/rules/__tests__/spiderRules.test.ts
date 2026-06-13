import { describe, test, expect } from 'vitest';
import { type CardType as Card, VALUES } from '@plokmin/shared';
import {
  canPlaceOnTableau,
  canPlaceOnEmptyTableau,
  isValidSpiderRun,
  isCompleteRun,
} from '../spiderRules';

function card(rank: number, suit: Card['suit'], copy = 0): Card {
  return { rank, suit, value: VALUES[rank - 1], id: `${VALUES[rank - 1]}${suit}#${copy}` };
}

/** A descending same-suit run [K, Q, ..., A] of the given suit. */
function fullRun(suit: Card['suit']): Card[] {
  return Array.from({ length: 13 }, (_, i) => card(13 - i, suit));
}

describe('canPlaceOnTableau', () => {
  test('allows descending rank regardless of suit', () => {
    expect(canPlaceOnTableau(card(9, '♥'), card(10, '♠'))).toBe(true);
    expect(canPlaceOnTableau(card(9, '♠'), card(10, '♠'))).toBe(true);
    expect(canPlaceOnTableau(card(9, '♦'), card(10, '♣'))).toBe(true);
  });

  test('rejects equal rank', () => {
    expect(canPlaceOnTableau(card(9, '♥'), card(9, '♠'))).toBe(false);
  });

  test('rejects non-consecutive rank', () => {
    expect(canPlaceOnTableau(card(8, '♥'), card(10, '♠'))).toBe(false);
  });

  test('rejects ascending placement', () => {
    expect(canPlaceOnTableau(card(11, '♥'), card(10, '♠'))).toBe(false);
  });
});

describe('canPlaceOnEmptyTableau', () => {
  test('always allows placing on an empty column', () => {
    expect(canPlaceOnEmptyTableau()).toBe(true);
  });
});

describe('isValidSpiderRun', () => {
  test('accepts a same-suit descending run', () => {
    expect(isValidSpiderRun([card(10, '♠'), card(9, '♠'), card(8, '♠')])).toBe(true);
  });

  test('accepts a single card', () => {
    expect(isValidSpiderRun([card(5, '♥')])).toBe(true);
  });

  test('accepts an empty selection', () => {
    expect(isValidSpiderRun([])).toBe(true);
  });

  test('rejects a suit break', () => {
    expect(isValidSpiderRun([card(10, '♠'), card(9, '♥'), card(8, '♠')])).toBe(false);
  });

  test('rejects a rank gap', () => {
    expect(isValidSpiderRun([card(10, '♠'), card(8, '♠')])).toBe(false);
  });
});

describe('isCompleteRun', () => {
  test('accepts a full King→Ace single-suit run', () => {
    expect(isCompleteRun(fullRun('♠'))).toBe(true);
    expect(isCompleteRun(fullRun('♥'))).toBe(true);
  });

  test('rejects a run of the wrong length', () => {
    expect(isCompleteRun(fullRun('♠').slice(0, 12))).toBe(false);
  });

  test('rejects a run with a suit break', () => {
    const run = fullRun('♠');
    run[5] = card(run[5].rank, '♥');
    expect(isCompleteRun(run)).toBe(false);
  });

  test('rejects a run that does not start at the King', () => {
    expect(isCompleteRun([...fullRun('♠')].reverse())).toBe(false);
  });
});
