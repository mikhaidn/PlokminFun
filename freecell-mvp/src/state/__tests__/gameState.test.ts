import { describe, test, expect } from 'vitest';
import { initializeGame, checkWinCondition } from '../gameState';

describe('initializeGame', () => {
  test('creates 8 tableau columns', () => {
    const state = initializeGame(12345);
    expect(state.tableau).toHaveLength(8);
  });

  test('distributes all 52 cards to tableau', () => {
    const state = initializeGame(12345);
    const totalCards = state.tableau.reduce((sum, col) => sum + col.length, 0);
    expect(totalCards).toBe(52);
  });

  test('first 4 columns have 7 cards each', () => {
    const state = initializeGame(12345);
    for (let i = 0; i < 4; i++) {
      expect(state.tableau[i]).toHaveLength(7);
    }
  });

  test('last 4 columns have 6 cards each', () => {
    const state = initializeGame(12345);
    for (let i = 4; i < 8; i++) {
      expect(state.tableau[i]).toHaveLength(6);
    }
  });

  test('creates 4 empty free cells', () => {
    const state = initializeGame(12345);
    expect(state.freeCells).toEqual([null, null, null, null]);
  });

  test('creates 4 empty foundations', () => {
    const state = initializeGame(12345);
    expect(state.foundations).toHaveLength(4);
    state.foundations.forEach(f => expect(f).toEqual([]));
  });

  test('same seed produces same initial state', () => {
    const state1 = initializeGame(99999);
    const state2 = initializeGame(99999);
    expect(state1.tableau).toEqual(state2.tableau);
  });

  test('different seeds produce different states', () => {
    const state1 = initializeGame(11111);
    const state2 = initializeGame(99999);
    expect(state1.tableau).not.toEqual(state2.tableau);
  });

  test('stores seed in state', () => {
    const state = initializeGame(54321);
    expect(state.seed).toBe(54321);
  });

  test('initializes move count to 0', () => {
    const state = initializeGame(777);
    expect(state.moves).toBe(0);
  });

  test('all cards in tableau are unique', () => {
    const state = initializeGame(42);
    const allCards = state.tableau.flat();
    const ids = allCards.map(c => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(52);
  });

  test('distribution pattern is correct', () => {
    const state = initializeGame(100);
    const columnLengths = state.tableau.map(col => col.length);
    expect(columnLengths).toEqual([7, 7, 7, 7, 6, 6, 6, 6]);
  });
});

describe('checkWinCondition', () => {
  test('returns false for initial state', () => {
    const state = initializeGame(12345);
    expect(checkWinCondition(state)).toBe(false);
  });

  test('returns true when all foundations have 13 cards', () => {
    const state = initializeGame(12345);

    // Simulate a won game by filling foundations
    state.foundations = [
      Array(13).fill(null).map((_, i) => ({ suit: '♠', value: 'A', rank: i + 1, id: `${i + 1}♠` })),
      Array(13).fill(null).map((_, i) => ({ suit: '♥', value: 'A', rank: i + 1, id: `${i + 1}♥` })),
      Array(13).fill(null).map((_, i) => ({ suit: '♦', value: 'A', rank: i + 1, id: `${i + 1}♦` })),
      Array(13).fill(null).map((_, i) => ({ suit: '♣', value: 'A', rank: i + 1, id: `${i + 1}♣` })),
    ];
    state.tableau = Array(8).fill(null).map(() => []);
    state.freeCells = [null, null, null, null];

    expect(checkWinCondition(state)).toBe(true);
  });

  test('returns false when only 3 foundations are complete', () => {
    const state = initializeGame(12345);

    state.foundations = [
      Array(13).fill(null).map((_, i) => ({ suit: '♠', value: 'A', rank: i + 1, id: `${i + 1}♠` })),
      Array(13).fill(null).map((_, i) => ({ suit: '♥', value: 'A', rank: i + 1, id: `${i + 1}♥` })),
      Array(13).fill(null).map((_, i) => ({ suit: '♦', value: 'A', rank: i + 1, id: `${i + 1}♦` })),
      [], // Empty foundation
    ];

    expect(checkWinCondition(state)).toBe(false);
  });

  test('returns false when foundations are partially filled', () => {
    const state = initializeGame(12345);

    state.foundations = [
      Array(5).fill(null).map((_, i) => ({ suit: '♠', value: 'A', rank: i + 1, id: `${i + 1}♠` })),
      Array(3).fill(null).map((_, i) => ({ suit: '♥', value: 'A', rank: i + 1, id: `${i + 1}♥` })),
      [],
      [],
    ];

    expect(checkWinCondition(state)).toBe(false);
  });

  test('win condition checks all foundations', () => {
    const state = initializeGame(12345);

    // All foundations must have exactly 13 cards
    state.foundations = [
      Array(13).fill(null).map((_, i) => ({ suit: '♠', value: 'A', rank: i + 1, id: `${i + 1}♠` })),
      Array(13).fill(null).map((_, i) => ({ suit: '♥', value: 'A', rank: i + 1, id: `${i + 1}♥` })),
      Array(13).fill(null).map((_, i) => ({ suit: '♦', value: 'A', rank: i + 1, id: `${i + 1}♦` })),
      Array(13).fill(null).map((_, i) => ({ suit: '♣', value: 'A', rank: i + 1, id: `${i + 1}♣` })),
    ];
    state.tableau = Array(8).fill(null).map(() => []);
    state.freeCells = [null, null, null, null];

    expect(checkWinCondition(state)).toBe(true);
  });
});
