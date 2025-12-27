import { describe, test, expect } from 'vitest';
import {
  moveCardToFreeCell,
  moveCardToFoundation,
  moveCardsToTableau,
  moveCardFromFreeCell,
  moveCardFromFoundationToTableau,
  moveCardFromFoundationToFreeCell,
} from '../gameActions';
import { initializeGame } from '../gameState';
import { type CardType as Card } from '@cardgames/shared';

describe('moveCardToFreeCell', () => {
  test('moves card from tableau to empty free cell', () => {
    const state = initializeGame(12345);
    const sourceColumn = 0;
    const originalLength = state.tableau[sourceColumn].length;
    const card = state.tableau[sourceColumn][originalLength - 1];

    const newState = moveCardToFreeCell(state, sourceColumn, 0);

    expect(newState).not.toBeNull();
    expect(newState!.freeCells[0]).toEqual(card);
    expect(newState!.tableau[sourceColumn]).toHaveLength(originalLength - 1);
    expect(newState!.moves).toBe(state.moves + 1);
  });

  test('returns null if free cell is occupied', () => {
    const state = initializeGame(12345);
    state.freeCells[0] = { suit: '♥', value: 'A', rank: 1, id: 'A♥' };

    const result = moveCardToFreeCell(state, 0, 0);
    expect(result).toBeNull();
  });

  test('returns null if tableau column is empty', () => {
    const state = initializeGame(12345);
    state.tableau[0] = []; // Empty column

    const result = moveCardToFreeCell(state, 0, 0);
    expect(result).toBeNull();
  });

  test('does not mutate original state', () => {
    const state = initializeGame(12345);
    const originalTableau = JSON.parse(JSON.stringify(state.tableau));
    const originalFreeCells = [...state.freeCells];

    moveCardToFreeCell(state, 0, 0);

    expect(state.tableau).toEqual(originalTableau);
    expect(state.freeCells).toEqual(originalFreeCells);
  });

  test('can move to different free cell slots', () => {
    const state = initializeGame(12345);

    const newState1 = moveCardToFreeCell(state, 0, 1);
    expect(newState1!.freeCells[1]).not.toBeNull();
    expect(newState1!.freeCells[0]).toBeNull();

    const newState2 = moveCardToFreeCell(newState1!, 1, 3);
    expect(newState2!.freeCells[3]).not.toBeNull();
  });
});

describe('moveCardFromFreeCell', () => {
  test('moves card from free cell to tableau', () => {
    const state = initializeGame(12345);
    const card: Card = { suit: '♥', value: '7', rank: 7, id: '7♥' };
    state.freeCells[0] = card;
    state.tableau[0] = [{ suit: '♠', value: '8', rank: 8, id: '8♠' }];

    const newState = moveCardFromFreeCell(state, 0, 0);

    expect(newState).not.toBeNull();
    expect(newState!.freeCells[0]).toBeNull();
    expect(newState!.tableau[0]).toHaveLength(2);
    expect(newState!.tableau[0][1]).toEqual(card);
  });

  test('returns null if free cell is empty', () => {
    const state = initializeGame(12345);
    state.freeCells[0] = null;

    const result = moveCardFromFreeCell(state, 0, 0);
    expect(result).toBeNull();
  });

  test('returns null if move violates tableau stacking rules', () => {
    const state = initializeGame(12345);
    const card: Card = { suit: '♥', value: '9', rank: 9, id: '9♥' };
    state.freeCells[0] = card;
    state.tableau[0] = [{ suit: '♠', value: '8', rank: 8, id: '8♠' }]; // 9 can't go on 8

    const result = moveCardFromFreeCell(state, 0, 0);
    expect(result).toBeNull();
  });
});

describe('moveCardToFoundation', () => {
  test('moves ace from tableau to empty foundation', () => {
    const state = initializeGame(12345);
    const ace: Card = { suit: '♥', value: 'A', rank: 1, id: 'A♥' };
    state.tableau[0] = [ace];

    const newState = moveCardToFoundation(state, 'tableau', 0, 0);

    expect(newState).not.toBeNull();
    expect(newState!.foundations[0]).toHaveLength(1);
    expect(newState!.foundations[0][0]).toEqual(ace);
    expect(newState!.tableau[0]).toHaveLength(0);
    expect(newState!.moves).toBe(1);
  });

  test('builds foundation in sequence', () => {
    const state = initializeGame(12345);
    const ace: Card = { suit: '♠', value: 'A', rank: 1, id: 'A♠' };
    const two: Card = { suit: '♠', value: '2', rank: 2, id: '2♠' };

    state.foundations[0] = [ace];
    state.tableau[0] = [two];

    const newState = moveCardToFoundation(state, 'tableau', 0, 0);

    expect(newState).not.toBeNull();
    expect(newState!.foundations[0]).toHaveLength(2);
    expect(newState!.foundations[0][1]).toEqual(two);
  });

  test('returns null for invalid foundation move', () => {
    const state = initializeGame(12345);
    const king: Card = { suit: '♥', value: 'K', rank: 13, id: 'K♥' };
    state.tableau[0] = [king];

    const result = moveCardToFoundation(state, 'tableau', 0, 0);
    expect(result).toBeNull();
  });

  test('moves card from free cell to foundation', () => {
    const state = initializeGame(12345);
    const ace: Card = { suit: '♦', value: 'A', rank: 1, id: 'A♦' };
    state.freeCells[0] = ace;

    const newState = moveCardToFoundation(state, 'freeCell', 0, 0);

    expect(newState).not.toBeNull();
    expect(newState!.foundations[0]).toHaveLength(1);
    expect(newState!.freeCells[0]).toBeNull();
  });
});

describe('moveCardsToTableau', () => {
  test('moves single card to tableau', () => {
    const state = initializeGame(12345);
    const card: Card = { suit: '♥', value: '7', rank: 7, id: '7♥' };
    state.tableau[0] = [{ suit: '♠', value: '8', rank: 8, id: '8♠' }];
    state.tableau[1] = [card];

    const newState = moveCardsToTableau(state, 1, 1, 0);

    expect(newState).not.toBeNull();
    expect(newState!.tableau[0]).toHaveLength(2);
    expect(newState!.tableau[0][1]).toEqual(card);
    expect(newState!.tableau[1]).toHaveLength(0);
  });

  test('moves valid stack to tableau', () => {
    const state = initializeGame(12345);
    state.tableau[0] = [
      { suit: '♠', value: '10', rank: 10, id: '10♠' },
      { suit: '♥', value: '9', rank: 9, id: '9♥' },
      { suit: '♣', value: '8', rank: 8, id: '8♣' },
    ];
    state.tableau[1] = [{ suit: '♦', value: 'J', rank: 11, id: 'J♦' }];
    state.freeCells = [null, null, null, null]; // 4 free cells = max 5 cards movable

    const newState = moveCardsToTableau(state, 0, 3, 1);

    expect(newState).not.toBeNull();
    expect(newState!.tableau[1]).toHaveLength(4);
  });

  test('returns null if stack is invalid', () => {
    const state = initializeGame(12345);
    state.tableau[0] = [
      { suit: '♠', value: '10', rank: 10, id: '10♠' },
      { suit: '♣', value: '9', rank: 9, id: '9♣' }, // Same color - invalid stack
    ];
    state.tableau[1] = [{ suit: '♦', value: 'J', rank: 11, id: 'J♦' }];

    const result = moveCardsToTableau(state, 0, 2, 1);
    expect(result).toBeNull();
  });

  test('returns null if stack is too large', () => {
    const state = initializeGame(12345);
    state.tableau[0] = [
      { suit: '♠', value: '10', rank: 10, id: '10♠' },
      { suit: '♥', value: '9', rank: 9, id: '9♥' },
      { suit: '♣', value: '8', rank: 8, id: '8♣' },
      { suit: '♦', value: '7', rank: 7, id: '7♦' },
      { suit: '♠', value: '6', rank: 6, id: '6♠' },
      { suit: '♥', value: '5', rank: 5, id: '5♥' },
    ];
    state.tableau[1] = [{ suit: '♦', value: 'J', rank: 11, id: 'J♦' }];
    state.freeCells = [null, null, null, null]; // Max 5 cards with 4 free cells, 0 empty columns

    const result = moveCardsToTableau(state, 0, 6, 1);
    expect(result).toBeNull();
  });

  test('can move to empty tableau column', () => {
    const state = initializeGame(12345);
    const card: Card = { suit: '♥', value: '7', rank: 7, id: '7♥' };
    state.tableau[0] = [card];
    state.tableau[1] = [];

    const newState = moveCardsToTableau(state, 0, 1, 1);

    expect(newState).not.toBeNull();
    expect(newState!.tableau[1]).toHaveLength(1);
    expect(newState!.tableau[1][0]).toEqual(card);
  });

  test('returns null if trying to move 0 cards', () => {
    const state = initializeGame(12345);
    const result = moveCardsToTableau(state, 0, 0, 1);
    expect(result).toBeNull();
  });
});

describe('moveCardFromFoundationToTableau', () => {
  test('moves card from foundation to tableau with valid stacking', () => {
    const state = initializeGame(12345);
    const ace: Card = { suit: '♠', value: 'A', rank: 1, id: 'A♠' };
    const two: Card = { suit: '♠', value: '2', rank: 2, id: '2♠' };
    const threeRed: Card = { suit: '♥', value: '3', rank: 3, id: '3♥' };

    state.foundations[0] = [ace, two];
    state.tableau[0] = [threeRed];

    const newState = moveCardFromFoundationToTableau(state, 0, 0);

    expect(newState).not.toBeNull();
    expect(newState!.foundations[0]).toHaveLength(1);
    expect(newState!.foundations[0][0]).toEqual(ace);
    expect(newState!.tableau[0]).toHaveLength(2);
    expect(newState!.tableau[0][1]).toEqual(two);
    expect(newState!.moves).toBe(state.moves + 1);
  });

  test('moves card from foundation to empty tableau column', () => {
    const state = initializeGame(12345);
    const king: Card = { suit: '♦', value: 'K', rank: 13, id: 'K♦' };

    state.foundations[0] = [king];
    state.tableau[0] = [];

    const newState = moveCardFromFoundationToTableau(state, 0, 0);

    expect(newState).not.toBeNull();
    expect(newState!.foundations[0]).toHaveLength(0);
    expect(newState!.tableau[0]).toHaveLength(1);
    expect(newState!.tableau[0][0]).toEqual(king);
  });

  test('returns null if foundation is empty', () => {
    const state = initializeGame(12345);
    state.foundations[0] = [];
    state.tableau[0] = [{ suit: '♥', value: '5', rank: 5, id: '5♥' }];

    const result = moveCardFromFoundationToTableau(state, 0, 0);
    expect(result).toBeNull();
  });

  test('returns null if stacking rules are violated (same color)', () => {
    const state = initializeGame(12345);
    const blackTwo: Card = { suit: '♠', value: '2', rank: 2, id: '2♠' };
    const blackThree: Card = { suit: '♣', value: '3', rank: 3, id: '3♣' };

    state.foundations[0] = [blackTwo];
    state.tableau[0] = [blackThree];

    const result = moveCardFromFoundationToTableau(state, 0, 0);
    expect(result).toBeNull();
  });

  test('returns null if stacking rules are violated (wrong rank)', () => {
    const state = initializeGame(12345);
    const five: Card = { suit: '♦', value: '5', rank: 5, id: '5♦' };
    const three: Card = { suit: '♠', value: '3', rank: 3, id: '3♠' };

    state.foundations[0] = [five];
    state.tableau[0] = [three];

    const result = moveCardFromFoundationToTableau(state, 0, 0);
    expect(result).toBeNull();
  });

  test('does not mutate original state', () => {
    const state = initializeGame(12345);
    const two: Card = { suit: '♠', value: '2', rank: 2, id: '2♠' };
    const three: Card = { suit: '♥', value: '3', rank: 3, id: '3♥' };

    state.foundations[0] = [two];
    state.tableau[0] = [three];

    const originalFoundations = JSON.parse(JSON.stringify(state.foundations));
    const originalTableau = JSON.parse(JSON.stringify(state.tableau));

    moveCardFromFoundationToTableau(state, 0, 0);

    expect(state.foundations).toEqual(originalFoundations);
    expect(state.tableau).toEqual(originalTableau);
  });
});

describe('moveCardFromFoundationToFreeCell', () => {
  test('moves card from foundation to empty free cell', () => {
    const state = initializeGame(12345);
    const ace: Card = { suit: '♥', value: 'A', rank: 1, id: 'A♥' };
    const two: Card = { suit: '♥', value: '2', rank: 2, id: '2♥' };

    state.foundations[0] = [ace, two];
    state.freeCells[0] = null;

    const newState = moveCardFromFoundationToFreeCell(state, 0, 0);

    expect(newState).not.toBeNull();
    expect(newState!.foundations[0]).toHaveLength(1);
    expect(newState!.foundations[0][0]).toEqual(ace);
    expect(newState!.freeCells[0]).toEqual(two);
    expect(newState!.moves).toBe(state.moves + 1);
  });

  test('returns null if free cell is occupied', () => {
    const state = initializeGame(12345);
    const ace: Card = { suit: '♠', value: 'A', rank: 1, id: 'A♠' };
    const occupyingCard: Card = { suit: '♦', value: 'K', rank: 13, id: 'K♦' };

    state.foundations[0] = [ace];
    state.freeCells[0] = occupyingCard;

    const result = moveCardFromFoundationToFreeCell(state, 0, 0);
    expect(result).toBeNull();
  });

  test('returns null if foundation is empty', () => {
    const state = initializeGame(12345);
    state.foundations[0] = [];
    state.freeCells[0] = null;

    const result = moveCardFromFoundationToFreeCell(state, 0, 0);
    expect(result).toBeNull();
  });

  test('can move to different free cell slots', () => {
    const state = initializeGame(12345);
    const ace: Card = { suit: '♣', value: 'A', rank: 1, id: 'A♣' };
    const two: Card = { suit: '♣', value: '2', rank: 2, id: '2♣' };

    state.foundations[0] = [ace, two];
    state.freeCells = [null, null, null, null];

    const newState1 = moveCardFromFoundationToFreeCell(state, 0, 2);
    expect(newState1!.freeCells[2]).toEqual(two);
    expect(newState1!.freeCells[0]).toBeNull();

    const newState2 = moveCardFromFoundationToFreeCell(newState1!, 0, 3);
    expect(newState2!.freeCells[3]).toEqual(ace);
    expect(newState2!.freeCells[2]).toEqual(two);
  });

  test('does not mutate original state', () => {
    const state = initializeGame(12345);
    const ace: Card = { suit: '♦', value: 'A', rank: 1, id: 'A♦' };

    state.foundations[0] = [ace];
    state.freeCells[0] = null;

    const originalFoundations = JSON.parse(JSON.stringify(state.foundations));
    const originalFreeCells = [...state.freeCells];

    moveCardFromFoundationToFreeCell(state, 0, 0);

    expect(state.foundations).toEqual(originalFoundations);
    expect(state.freeCells).toEqual(originalFreeCells);
  });
});
