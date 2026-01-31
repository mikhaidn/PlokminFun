import { describe, test, expect } from 'vitest';
import { canStackOnTableau, canStackOnFoundation, isRed, isBlack } from '../validation';
import { type CardType as Card } from '@plokmin/shared';

describe('isRed', () => {
  test('identifies hearts as red', () => {
    const card: Card = { suit: '♥', value: '7', rank: 7, id: '7♥' };
    expect(isRed(card)).toBe(true);
  });

  test('identifies diamonds as red', () => {
    const card: Card = { suit: '♦', value: 'K', rank: 13, id: 'K♦' };
    expect(isRed(card)).toBe(true);
  });

  test('identifies spades as not red', () => {
    const card: Card = { suit: '♠', value: 'A', rank: 1, id: 'A♠' };
    expect(isRed(card)).toBe(false);
  });

  test('identifies clubs as not red', () => {
    const card: Card = { suit: '♣', value: '10', rank: 10, id: '10♣' };
    expect(isRed(card)).toBe(false);
  });
});

describe('isBlack', () => {
  test('identifies spades as black', () => {
    const card: Card = { suit: '♠', value: 'Q', rank: 12, id: 'Q♠' };
    expect(isBlack(card)).toBe(true);
  });

  test('identifies clubs as black', () => {
    const card: Card = { suit: '♣', value: '3', rank: 3, id: '3♣' };
    expect(isBlack(card)).toBe(true);
  });

  test('identifies hearts as not black', () => {
    const card: Card = { suit: '♥', value: 'J', rank: 11, id: 'J♥' };
    expect(isBlack(card)).toBe(false);
  });

  test('identifies diamonds as not black', () => {
    const card: Card = { suit: '♦', value: '2', rank: 2, id: '2♦' };
    expect(isBlack(card)).toBe(false);
  });
});

describe('canStackOnTableau', () => {
  test('allows red on black with rank descending by 1', () => {
    const blackCard: Card = { suit: '♠', value: '8', rank: 8, id: '8♠' };
    const redCard: Card = { suit: '♥', value: '7', rank: 7, id: '7♥' };
    expect(canStackOnTableau(redCard, blackCard)).toBe(true);
  });

  test('allows black on red with rank descending by 1', () => {
    const redCard: Card = { suit: '♦', value: '10', rank: 10, id: '10♦' };
    const blackCard: Card = { suit: '♣', value: '9', rank: 9, id: '9♣' };
    expect(canStackOnTableau(blackCard, redCard)).toBe(true);
  });

  test('rejects same color (red on red)', () => {
    const red1: Card = { suit: '♥', value: '8', rank: 8, id: '8♥' };
    const red2: Card = { suit: '♦', value: '7', rank: 7, id: '7♦' };
    expect(canStackOnTableau(red2, red1)).toBe(false);
  });

  test('rejects same color (black on black)', () => {
    const black1: Card = { suit: '♠', value: '6', rank: 6, id: '6♠' };
    const black2: Card = { suit: '♣', value: '5', rank: 5, id: '5♣' };
    expect(canStackOnTableau(black2, black1)).toBe(false);
  });

  test('rejects wrong rank (too high)', () => {
    const black: Card = { suit: '♠', value: '8', rank: 8, id: '8♠' };
    const red: Card = { suit: '♥', value: '9', rank: 9, id: '9♥' };
    expect(canStackOnTableau(red, black)).toBe(false);
  });

  test('rejects wrong rank (too low)', () => {
    const black: Card = { suit: '♠', value: '8', rank: 8, id: '8♠' };
    const red: Card = { suit: '♥', value: '6', rank: 6, id: '6♥' };
    expect(canStackOnTableau(red, black)).toBe(false);
  });

  test('rejects rank difference of 2', () => {
    const black: Card = { suit: '♠', value: '9', rank: 9, id: '9♠' };
    const red: Card = { suit: '♥', value: '7', rank: 7, id: '7♥' };
    expect(canStackOnTableau(red, black)).toBe(false);
  });

  test('allows any card on empty tableau (null target)', () => {
    const card: Card = { suit: '♥', value: '7', rank: 7, id: '7♥' };
    expect(canStackOnTableau(card, null)).toBe(true);
  });

  test('allows king on empty tableau', () => {
    const king: Card = { suit: '♠', value: 'K', rank: 13, id: 'K♠' };
    expect(canStackOnTableau(king, null)).toBe(true);
  });

  test('allows ace on empty tableau', () => {
    const ace: Card = { suit: '♥', value: 'A', rank: 1, id: 'A♥' };
    expect(canStackOnTableau(ace, null)).toBe(true);
  });
});

describe('canStackOnFoundation', () => {
  test('allows ace on empty foundation', () => {
    const ace: Card = { suit: '♥', value: 'A', rank: 1, id: 'A♥' };
    expect(canStackOnFoundation(ace, [])).toBe(true);
  });

  test('rejects non-ace on empty foundation', () => {
    const two: Card = { suit: '♥', value: '2', rank: 2, id: '2♥' };
    expect(canStackOnFoundation(two, [])).toBe(false);
  });

  test('rejects king on empty foundation', () => {
    const king: Card = { suit: '♥', value: 'K', rank: 13, id: 'K♥' };
    expect(canStackOnFoundation(king, [])).toBe(false);
  });

  test('allows same suit ascending rank', () => {
    const foundation: Card[] = [{ suit: '♥', value: 'A', rank: 1, id: 'A♥' }];
    const two: Card = { suit: '♥', value: '2', rank: 2, id: '2♥' };
    expect(canStackOnFoundation(two, foundation)).toBe(true);
  });

  test('allows building to king', () => {
    const foundation: Card[] = [
      { suit: '♠', value: 'A', rank: 1, id: 'A♠' },
      { suit: '♠', value: '2', rank: 2, id: '2♠' },
      // ... imagine all cards up to Queen
      { suit: '♠', value: 'Q', rank: 12, id: 'Q♠' },
    ];
    const king: Card = { suit: '♠', value: 'K', rank: 13, id: 'K♠' };
    expect(canStackOnFoundation(king, foundation)).toBe(true);
  });

  test('rejects different suit', () => {
    const foundation: Card[] = [{ suit: '♥', value: 'A', rank: 1, id: 'A♥' }];
    const two: Card = { suit: '♠', value: '2', rank: 2, id: '2♠' };
    expect(canStackOnFoundation(two, foundation)).toBe(false);
  });

  test('rejects wrong rank (skipping)', () => {
    const foundation: Card[] = [{ suit: '♥', value: 'A', rank: 1, id: 'A♥' }];
    const three: Card = { suit: '♥', value: '3', rank: 3, id: '3♥' };
    expect(canStackOnFoundation(three, foundation)).toBe(false);
  });

  test('rejects descending rank', () => {
    const foundation: Card[] = [
      { suit: '♦', value: 'A', rank: 1, id: 'A♦' },
      { suit: '♦', value: '2', rank: 2, id: '2♦' },
    ];
    const ace: Card = { suit: '♦', value: 'A', rank: 1, id: 'A♦' };
    expect(canStackOnFoundation(ace, foundation)).toBe(false);
  });

  test('rejects same rank', () => {
    const foundation: Card[] = [{ suit: '♣', value: '5', rank: 5, id: '5♣' }];
    const five: Card = { suit: '♣', value: '5', rank: 5, id: '5♣' };
    expect(canStackOnFoundation(five, foundation)).toBe(false);
  });
});
