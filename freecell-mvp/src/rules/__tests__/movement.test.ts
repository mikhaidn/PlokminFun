import { describe, test, expect } from 'vitest';
import { getMaxMovable, isValidStack } from '../movement';
import { type CardType as Card } from '@plokmin/shared';

describe('getMaxMovable', () => {
  test('with 0 free cells and 0 empty columns: max = 1', () => {
    expect(getMaxMovable(0, 0)).toBe(1);
  });

  test('with 1 free cell and 0 empty columns: max = 2', () => {
    expect(getMaxMovable(1, 0)).toBe(2);
  });

  test('with 2 free cells and 0 empty columns: max = 3', () => {
    expect(getMaxMovable(2, 0)).toBe(3);
  });

  test('with 3 free cells and 0 empty columns: max = 4', () => {
    expect(getMaxMovable(3, 0)).toBe(4);
  });

  test('with 4 free cells and 0 empty columns: max = 5', () => {
    expect(getMaxMovable(4, 0)).toBe(5);
  });

  test('with 0 free cells and 1 empty column: max = 2', () => {
    expect(getMaxMovable(0, 1)).toBe(2);
  });

  test('with 0 free cells and 2 empty columns: max = 4', () => {
    expect(getMaxMovable(0, 2)).toBe(4);
  });

  test('with 0 free cells and 3 empty columns: max = 8', () => {
    expect(getMaxMovable(0, 3)).toBe(8);
  });

  test('with 1 free cell and 1 empty column: max = 4', () => {
    expect(getMaxMovable(1, 1)).toBe(4);
  });

  test('with 2 free cells and 1 empty column: max = 6', () => {
    expect(getMaxMovable(2, 1)).toBe(6);
  });

  test('with 4 free cells and 4 empty columns: max = 80', () => {
    expect(getMaxMovable(4, 4)).toBe(80);
  });

  test('with 3 free cells and 2 empty columns: max = 16', () => {
    expect(getMaxMovable(3, 2)).toBe(16);
  });

  test('formula: (freeCells + 1) * 2^emptyColumns', () => {
    // Verify the formula holds
    const freeCells = 2;
    const emptyColumns = 3;
    const expected = (freeCells + 1) * Math.pow(2, emptyColumns);
    expect(getMaxMovable(freeCells, emptyColumns)).toBe(expected);
  });
});

describe('isValidStack', () => {
  test('single card is always valid', () => {
    const cards: Card[] = [{ suit: '♥', value: '7', rank: 7, id: '7♥' }];
    expect(isValidStack(cards)).toBe(true);
  });

  test('empty array is valid', () => {
    expect(isValidStack([])).toBe(true);
  });

  test('two cards: alternating colors, descending ranks', () => {
    const cards: Card[] = [
      { suit: '♠', value: '8', rank: 8, id: '8♠' }, // black 8
      { suit: '♥', value: '7', rank: 7, id: '7♥' }, // red 7
    ];
    expect(isValidStack(cards)).toBe(true);
  });

  test('three cards: valid stack', () => {
    const cards: Card[] = [
      { suit: '♠', value: '9', rank: 9, id: '9♠' }, // black 9
      { suit: '♥', value: '8', rank: 8, id: '8♥' }, // red 8
      { suit: '♣', value: '7', rank: 7, id: '7♣' }, // black 7
    ];
    expect(isValidStack(cards)).toBe(true);
  });

  test('long valid stack', () => {
    const cards: Card[] = [
      { suit: '♠', value: 'K', rank: 13, id: 'K♠' },
      { suit: '♥', value: 'Q', rank: 12, id: 'Q♥' },
      { suit: '♣', value: 'J', rank: 11, id: 'J♣' },
      { suit: '♦', value: '10', rank: 10, id: '10♦' },
      { suit: '♠', value: '9', rank: 9, id: '9♠' },
    ];
    expect(isValidStack(cards)).toBe(true);
  });

  test('same color breaks stack (red-red)', () => {
    const cards: Card[] = [
      { suit: '♥', value: '8', rank: 8, id: '8♥' }, // red 8
      { suit: '♦', value: '7', rank: 7, id: '7♦' }, // red 7
    ];
    expect(isValidStack(cards)).toBe(false);
  });

  test('same color breaks stack (black-black)', () => {
    const cards: Card[] = [
      { suit: '♠', value: '8', rank: 8, id: '8♠' }, // black 8
      { suit: '♣', value: '7', rank: 7, id: '7♣' }, // black 7
    ];
    expect(isValidStack(cards)).toBe(false);
  });

  test('non-descending rank breaks stack (ascending)', () => {
    const cards: Card[] = [
      { suit: '♠', value: '7', rank: 7, id: '7♠' }, // black 7
      { suit: '♥', value: '8', rank: 8, id: '8♥' }, // red 8
    ];
    expect(isValidStack(cards)).toBe(false);
  });

  test('rank gap breaks stack', () => {
    const cards: Card[] = [
      { suit: '♠', value: '9', rank: 9, id: '9♠' }, // black 9
      { suit: '♥', value: '7', rank: 7, id: '7♥' }, // red 7 (skipped 8)
    ];
    expect(isValidStack(cards)).toBe(false);
  });

  test('same rank breaks stack', () => {
    const cards: Card[] = [
      { suit: '♠', value: '8', rank: 8, id: '8♠' }, // black 8
      { suit: '♥', value: '8', rank: 8, id: '8♥' }, // red 8
    ];
    expect(isValidStack(cards)).toBe(false);
  });

  test('valid in middle, invalid at end', () => {
    const cards: Card[] = [
      { suit: '♠', value: '9', rank: 9, id: '9♠' }, // black 9
      { suit: '♥', value: '8', rank: 8, id: '8♥' }, // red 8
      { suit: '♦', value: '7', rank: 7, id: '7♦' }, // red 7 (breaks: same color as previous)
    ];
    expect(isValidStack(cards)).toBe(false);
  });

  test('Ace to King descending', () => {
    const cards: Card[] = [
      { suit: '♠', value: '3', rank: 3, id: '3♠' },
      { suit: '♥', value: '2', rank: 2, id: '2♥' },
      { suit: '♣', value: 'A', rank: 1, id: 'A♣' },
    ];
    expect(isValidStack(cards)).toBe(true);
  });
});
