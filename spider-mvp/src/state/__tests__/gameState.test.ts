import { describe, test, expect } from 'vitest';
import {
  createSpiderDeck,
  createInitialState,
  isGameWon,
  NUM_COLUMNS,
  NUM_FOUNDATIONS,
  type SuitCount,
} from '../gameState';

describe('createSpiderDeck', () => {
  test.each<[SuitCount, number]>([
    [1, 8],
    [2, 4],
    [4, 2],
  ])('builds 104 cards for %i suit(s) with %i copies of each card', (suitCount, copies) => {
    const deck = createSpiderDeck(suitCount);
    expect(deck).toHaveLength(104);

    const distinctSuits = new Set(deck.map((c) => c.suit));
    expect(distinctSuits.size).toBe(suitCount);

    // Every rank of every used suit appears exactly `copies` times
    for (const suit of distinctSuits) {
      for (let rank = 1; rank <= 13; rank++) {
        const count = deck.filter((c) => c.suit === suit && c.rank === rank).length;
        expect(count).toBe(copies);
      }
    }
  });

  test('one-suit deck is all spades', () => {
    const deck = createSpiderDeck(1);
    expect(deck.every((c) => c.suit === '♠')).toBe(true);
  });

  test('gives every card a unique id', () => {
    const deck = createSpiderDeck(4);
    expect(new Set(deck.map((c) => c.id)).size).toBe(104);
  });
});

describe('createInitialState', () => {
  test('deals 10 columns: four of 6 cards, six of 5 cards', () => {
    const state = createInitialState(12345);
    expect(state.tableau).toHaveLength(NUM_COLUMNS);
    for (let i = 0; i < NUM_COLUMNS; i++) {
      expect(state.tableau[i].cards).toHaveLength(i < 4 ? 6 : 5);
    }
  });

  test('deals 54 cards to the tableau and 50 to the stock', () => {
    const state = createInitialState(12345);
    const tableauTotal = state.tableau.reduce((sum, col) => sum + col.cards.length, 0);
    expect(tableauTotal).toBe(54);
    expect(state.stock).toHaveLength(50);
  });

  test('only the top card of each column starts face-up', () => {
    const state = createInitialState(12345);
    expect(state.tableau.every((col) => col.faceUpCount === 1)).toBe(true);
  });

  test('starts with no completed foundations and zero moves', () => {
    const state = createInitialState(12345);
    expect(state.foundations).toEqual([]);
    expect(state.moves).toBe(0);
  });

  test('defaults to a single-suit (all spades) game', () => {
    const state = createInitialState(12345);
    expect(state.suitCount).toBe(1);
    const allCards = state.tableau.flatMap((c) => c.cards).concat(state.stock);
    expect(allCards.every((c) => c.suit === '♠')).toBe(true);
  });

  test('the same seed produces the same deal', () => {
    const a = createInitialState(777, 4);
    const b = createInitialState(777, 4);
    const ids = (s: typeof a) => s.tableau.flatMap((col) => col.cards.map((c) => c.id));
    expect(ids(a)).toEqual(ids(b));
  });
});

describe('isGameWon', () => {
  test('is false for a fresh game', () => {
    expect(isGameWon(createInitialState(1))).toBe(false);
  });

  test('is true once all eight runs are completed', () => {
    const state = createInitialState(1);
    const won = { ...state, foundations: Array.from({ length: NUM_FOUNDATIONS }, () => []) };
    expect(isGameWon(won)).toBe(true);
  });
});
