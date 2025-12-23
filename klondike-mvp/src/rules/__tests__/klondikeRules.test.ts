import { describe, test, expect } from 'vitest';
import {
  isRed,
  hasAlternatingColors,
  canPlaceOnTableau,
  canPlaceOnEmptyTableau,
  canPlaceOnFoundation,
  isValidTableauSequence,
} from '../klondikeRules';
import type { Card } from '../../core/types';

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

describe('hasAlternatingColors', () => {
  test('returns true for red on black', () => {
    const red: Card = { suit: '♥', value: '7', rank: 7, id: '7♥' };
    const black: Card = { suit: '♠', value: '8', rank: 8, id: '8♠' };
    expect(hasAlternatingColors(red, black)).toBe(true);
  });

  test('returns true for black on red', () => {
    const black: Card = { suit: '♣', value: '5', rank: 5, id: '5♣' };
    const red: Card = { suit: '♦', value: '6', rank: 6, id: '6♦' };
    expect(hasAlternatingColors(black, red)).toBe(true);
  });

  test('returns false for red on red', () => {
    const red1: Card = { suit: '♥', value: '7', rank: 7, id: '7♥' };
    const red2: Card = { suit: '♦', value: '8', rank: 8, id: '8♦' };
    expect(hasAlternatingColors(red1, red2)).toBe(false);
  });

  test('returns false for black on black', () => {
    const black1: Card = { suit: '♠', value: 'Q', rank: 12, id: 'Q♠' };
    const black2: Card = { suit: '♣', value: 'K', rank: 13, id: 'K♣' };
    expect(hasAlternatingColors(black1, black2)).toBe(false);
  });

  test('returns false for same suit', () => {
    const card1: Card = { suit: '♥', value: '5', rank: 5, id: '5♥' };
    const card2: Card = { suit: '♥', value: '6', rank: 6, id: '6♥' };
    expect(hasAlternatingColors(card1, card2)).toBe(false);
  });
});

describe('canPlaceOnTableau', () => {
  test('allows red on black with descending rank', () => {
    const black: Card = { suit: '♠', value: '8', rank: 8, id: '8♠' };
    const red: Card = { suit: '♥', value: '7', rank: 7, id: '7♥' };
    expect(canPlaceOnTableau(red, black)).toBe(true);
  });

  test('allows black on red with descending rank', () => {
    const red: Card = { suit: '♦', value: '10', rank: 10, id: '10♦' };
    const black: Card = { suit: '♣', value: '9', rank: 9, id: '9♣' };
    expect(canPlaceOnTableau(black, red)).toBe(true);
  });

  test('allows Ace on red 2', () => {
    const red2: Card = { suit: '♥', value: '2', rank: 2, id: '2♥' };
    const blackAce: Card = { suit: '♠', value: 'A', rank: 1, id: 'A♠' };
    expect(canPlaceOnTableau(blackAce, red2)).toBe(true);
  });

  test('allows Queen on King', () => {
    const king: Card = { suit: '♣', value: 'K', rank: 13, id: 'K♣' };
    const queen: Card = { suit: '♥', value: 'Q', rank: 12, id: 'Q♥' };
    expect(canPlaceOnTableau(queen, king)).toBe(true);
  });

  test('rejects same color (red on red)', () => {
    const red1: Card = { suit: '♥', value: '8', rank: 8, id: '8♥' };
    const red2: Card = { suit: '♦', value: '7', rank: 7, id: '7♦' };
    expect(canPlaceOnTableau(red2, red1)).toBe(false);
  });

  test('rejects same color (black on black)', () => {
    const black1: Card = { suit: '♠', value: '6', rank: 6, id: '6♠' };
    const black2: Card = { suit: '♣', value: '5', rank: 5, id: '5♣' };
    expect(canPlaceOnTableau(black2, black1)).toBe(false);
  });

  test('rejects wrong rank (too high)', () => {
    const black: Card = { suit: '♠', value: '8', rank: 8, id: '8♠' };
    const red: Card = { suit: '♥', value: '9', rank: 9, id: '9♥' };
    expect(canPlaceOnTableau(red, black)).toBe(false);
  });

  test('rejects wrong rank (too low)', () => {
    const black: Card = { suit: '♠', value: '8', rank: 8, id: '8♠' };
    const red: Card = { suit: '♥', value: '6', rank: 6, id: '6♥' };
    expect(canPlaceOnTableau(red, black)).toBe(false);
  });

  test('rejects same rank', () => {
    const black: Card = { suit: '♠', value: '7', rank: 7, id: '7♠' };
    const red: Card = { suit: '♥', value: '7', rank: 7, id: '7♥' };
    expect(canPlaceOnTableau(red, black)).toBe(false);
  });

  test('rejects rank difference of 2', () => {
    const black: Card = { suit: '♠', value: '9', rank: 9, id: '9♠' };
    const red: Card = { suit: '♥', value: '7', rank: 7, id: '7♥' };
    expect(canPlaceOnTableau(red, black)).toBe(false);
  });

  test('rejects ascending rank', () => {
    const card1: Card = { suit: '♠', value: '5', rank: 5, id: '5♠' };
    const card2: Card = { suit: '♥', value: '6', rank: 6, id: '6♥' };
    expect(canPlaceOnTableau(card2, card1)).toBe(false);
  });
});

describe('canPlaceOnEmptyTableau', () => {
  test('allows King on empty tableau', () => {
    const king: Card = { suit: '♠', value: 'K', rank: 13, id: 'K♠' };
    expect(canPlaceOnEmptyTableau(king)).toBe(true);
  });

  test('allows King of hearts on empty tableau', () => {
    const king: Card = { suit: '♥', value: 'K', rank: 13, id: 'K♥' };
    expect(canPlaceOnEmptyTableau(king)).toBe(true);
  });

  test('allows King of diamonds on empty tableau', () => {
    const king: Card = { suit: '♦', value: 'K', rank: 13, id: 'K♦' };
    expect(canPlaceOnEmptyTableau(king)).toBe(true);
  });

  test('allows King of clubs on empty tableau', () => {
    const king: Card = { suit: '♣', value: 'K', rank: 13, id: 'K♣' };
    expect(canPlaceOnEmptyTableau(king)).toBe(true);
  });

  test('rejects Queen on empty tableau', () => {
    const queen: Card = { suit: '♥', value: 'Q', rank: 12, id: 'Q♥' };
    expect(canPlaceOnEmptyTableau(queen)).toBe(false);
  });

  test('rejects Ace on empty tableau', () => {
    const ace: Card = { suit: '♠', value: 'A', rank: 1, id: 'A♠' };
    expect(canPlaceOnEmptyTableau(ace)).toBe(false);
  });

  test('rejects numbered card on empty tableau', () => {
    const seven: Card = { suit: '♦', value: '7', rank: 7, id: '7♦' };
    expect(canPlaceOnEmptyTableau(seven)).toBe(false);
  });

  test('rejects two on empty tableau', () => {
    const two: Card = { suit: '♣', value: '2', rank: 2, id: '2♣' };
    expect(canPlaceOnEmptyTableau(two)).toBe(false);
  });
});

describe('canPlaceOnFoundation', () => {
  test('allows Ace on empty foundation', () => {
    const ace: Card = { suit: '♥', value: 'A', rank: 1, id: 'A♥' };
    expect(canPlaceOnFoundation(ace, [])).toBe(true);
  });

  test('allows Ace of spades on empty foundation', () => {
    const ace: Card = { suit: '♠', value: 'A', rank: 1, id: 'A♠' };
    expect(canPlaceOnFoundation(ace, [])).toBe(true);
  });

  test('rejects non-ace on empty foundation', () => {
    const two: Card = { suit: '♥', value: '2', rank: 2, id: '2♥' };
    expect(canPlaceOnFoundation(two, [])).toBe(false);
  });

  test('rejects King on empty foundation', () => {
    const king: Card = { suit: '♥', value: 'K', rank: 13, id: 'K♥' };
    expect(canPlaceOnFoundation(king, [])).toBe(false);
  });

  test('allows same suit ascending rank (Ace → 2)', () => {
    const foundation: Card[] = [{ suit: '♥', value: 'A', rank: 1, id: 'A♥' }];
    const two: Card = { suit: '♥', value: '2', rank: 2, id: '2♥' };
    expect(canPlaceOnFoundation(two, foundation)).toBe(true);
  });

  test('allows building to King', () => {
    const foundation: Card[] = [
      { suit: '♠', value: 'A', rank: 1, id: 'A♠' },
      { suit: '♠', value: '2', rank: 2, id: '2♠' },
      { suit: '♠', value: '3', rank: 3, id: '3♠' },
      { suit: '♠', value: '4', rank: 4, id: '4♠' },
      { suit: '♠', value: '5', rank: 5, id: '5♠' },
      { suit: '♠', value: '6', rank: 6, id: '6♠' },
      { suit: '♠', value: '7', rank: 7, id: '7♠' },
      { suit: '♠', value: '8', rank: 8, id: '8♠' },
      { suit: '♠', value: '9', rank: 9, id: '9♠' },
      { suit: '♠', value: '10', rank: 10, id: '10♠' },
      { suit: '♠', value: 'J', rank: 11, id: 'J♠' },
      { suit: '♠', value: 'Q', rank: 12, id: 'Q♠' },
    ];
    const king: Card = { suit: '♠', value: 'K', rank: 13, id: 'K♠' };
    expect(canPlaceOnFoundation(king, foundation)).toBe(true);
  });

  test('rejects different suit', () => {
    const foundation: Card[] = [{ suit: '♥', value: 'A', rank: 1, id: 'A♥' }];
    const two: Card = { suit: '♠', value: '2', rank: 2, id: '2♠' };
    expect(canPlaceOnFoundation(two, foundation)).toBe(false);
  });

  test('rejects wrong rank (skipping)', () => {
    const foundation: Card[] = [{ suit: '♥', value: 'A', rank: 1, id: 'A♥' }];
    const three: Card = { suit: '♥', value: '3', rank: 3, id: '3♥' };
    expect(canPlaceOnFoundation(three, foundation)).toBe(false);
  });

  test('rejects descending rank', () => {
    const foundation: Card[] = [
      { suit: '♦', value: 'A', rank: 1, id: 'A♦' },
      { suit: '♦', value: '2', rank: 2, id: '2♦' },
    ];
    const ace: Card = { suit: '♦', value: 'A', rank: 1, id: 'A♦' };
    expect(canPlaceOnFoundation(ace, foundation)).toBe(false);
  });

  test('rejects same rank', () => {
    const foundation: Card[] = [{ suit: '♣', value: '5', rank: 5, id: '5♣' }];
    const five: Card = { suit: '♣', value: '5', rank: 5, id: '5♣' };
    expect(canPlaceOnFoundation(five, foundation)).toBe(false);
  });

  test('allows sequential building (2 → 3 → 4)', () => {
    const foundation: Card[] = [
      { suit: '♦', value: 'A', rank: 1, id: 'A♦' },
      { suit: '♦', value: '2', rank: 2, id: '2♦' },
      { suit: '♦', value: '3', rank: 3, id: '3♦' },
    ];
    const four: Card = { suit: '♦', value: '4', rank: 4, id: '4♦' };
    expect(canPlaceOnFoundation(four, foundation)).toBe(true);
  });
});

describe('isValidTableauSequence', () => {
  test('single card is valid', () => {
    const cards: Card[] = [{ suit: '♥', value: '7', rank: 7, id: '7♥' }];
    expect(isValidTableauSequence(cards)).toBe(true);
  });

  test('empty sequence is valid', () => {
    const cards: Card[] = [];
    expect(isValidTableauSequence(cards)).toBe(true);
  });

  test('valid descending alternating sequence (K → Q → J)', () => {
    const cards: Card[] = [
      { suit: '♠', value: 'K', rank: 13, id: 'K♠' },
      { suit: '♥', value: 'Q', rank: 12, id: 'Q♥' },
      { suit: '♣', value: 'J', rank: 11, id: 'J♣' },
    ];
    expect(isValidTableauSequence(cards)).toBe(true);
  });

  test('valid sequence (8 → 7 → 6 → 5)', () => {
    const cards: Card[] = [
      { suit: '♦', value: '8', rank: 8, id: '8♦' },
      { suit: '♠', value: '7', rank: 7, id: '7♠' },
      { suit: '♥', value: '6', rank: 6, id: '6♥' },
      { suit: '♣', value: '5', rank: 5, id: '5♣' },
    ];
    expect(isValidTableauSequence(cards)).toBe(true);
  });

  test('valid long sequence', () => {
    const cards: Card[] = [
      { suit: '♠', value: '10', rank: 10, id: '10♠' },
      { suit: '♥', value: '9', rank: 9, id: '9♥' },
      { suit: '♣', value: '8', rank: 8, id: '8♣' },
      { suit: '♦', value: '7', rank: 7, id: '7♦' },
      { suit: '♠', value: '6', rank: 6, id: '6♠' },
      { suit: '♥', value: '5', rank: 5, id: '5♥' },
    ];
    expect(isValidTableauSequence(cards)).toBe(true);
  });

  test('rejects same color sequence (red → red)', () => {
    const cards: Card[] = [
      { suit: '♥', value: '8', rank: 8, id: '8♥' },
      { suit: '♦', value: '7', rank: 7, id: '7♦' },
    ];
    expect(isValidTableauSequence(cards)).toBe(false);
  });

  test('rejects same color sequence (black → black)', () => {
    const cards: Card[] = [
      { suit: '♠', value: '6', rank: 6, id: '6♠' },
      { suit: '♣', value: '5', rank: 5, id: '5♣' },
    ];
    expect(isValidTableauSequence(cards)).toBe(false);
  });

  test('rejects ascending rank', () => {
    const cards: Card[] = [
      { suit: '♠', value: '5', rank: 5, id: '5♠' },
      { suit: '♥', value: '6', rank: 6, id: '6♥' },
    ];
    expect(isValidTableauSequence(cards)).toBe(false);
  });

  test('rejects skipped rank', () => {
    const cards: Card[] = [
      { suit: '♠', value: '9', rank: 9, id: '9♠' },
      { suit: '♥', value: '7', rank: 7, id: '7♥' }, // Skipped 8
    ];
    expect(isValidTableauSequence(cards)).toBe(false);
  });

  test('rejects sequence with same rank', () => {
    const cards: Card[] = [
      { suit: '♠', value: '7', rank: 7, id: '7♠' },
      { suit: '♥', value: '7', rank: 7, id: '7♥' },
    ];
    expect(isValidTableauSequence(cards)).toBe(false);
  });

  test('rejects sequence broken in the middle', () => {
    const cards: Card[] = [
      { suit: '♠', value: '10', rank: 10, id: '10♠' },
      { suit: '♥', value: '9', rank: 9, id: '9♥' }, // Valid so far
      { suit: '♣', value: '7', rank: 7, id: '7♣' }, // Broken (skipped 8)
    ];
    expect(isValidTableauSequence(cards)).toBe(false);
  });

  test('rejects sequence with color break', () => {
    const cards: Card[] = [
      { suit: '♠', value: '8', rank: 8, id: '8♠' },
      { suit: '♥', value: '7', rank: 7, id: '7♥' }, // Valid so far
      { suit: '♦', value: '6', rank: 6, id: '6♦' }, // Broken (red → red)
    ];
    expect(isValidTableauSequence(cards)).toBe(false);
  });
});
