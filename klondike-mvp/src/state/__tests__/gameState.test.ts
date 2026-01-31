import { describe, test, expect } from 'vitest';
import {
  createInitialState,
  isCardFaceUp,
  getCardsAtLocation,
  isGameWon,
  type Location,
} from '../gameState';
import type { CardType as Card } from '@plokmin/shared';

describe('createInitialState', () => {
  test('creates 7 tableau columns', () => {
    const state = createInitialState(12345);
    expect(state.tableau).toHaveLength(7);
  });

  test('tableau columns have correct sizes (1, 2, 3, 4, 5, 6, 7)', () => {
    const state = createInitialState(12345);

    expect(state.tableau[0].cards).toHaveLength(1);
    expect(state.tableau[1].cards).toHaveLength(2);
    expect(state.tableau[2].cards).toHaveLength(3);
    expect(state.tableau[3].cards).toHaveLength(4);
    expect(state.tableau[4].cards).toHaveLength(5);
    expect(state.tableau[5].cards).toHaveLength(6);
    expect(state.tableau[6].cards).toHaveLength(7);
  });

  test('each tableau column has exactly 1 face-up card initially', () => {
    const state = createInitialState(12345);

    state.tableau.forEach((column) => {
      expect(column.faceUpCount).toBe(1);
    });
  });

  test('stock contains 24 cards (52 - 28 in tableau)', () => {
    const state = createInitialState(12345);
    expect(state.stock).toHaveLength(24);
  });

  test('waste starts empty', () => {
    const state = createInitialState(12345);
    expect(state.waste).toHaveLength(0);
  });

  test('creates 4 empty foundation piles', () => {
    const state = createInitialState(12345);
    expect(state.foundations).toHaveLength(4);

    state.foundations.forEach((foundation) => {
      expect(foundation).toHaveLength(0);
    });
  });

  test('sets seed correctly', () => {
    const seed = 54321;
    const state = createInitialState(seed);
    expect(state.seed).toBe(seed);
  });

  test('starts with 0 moves', () => {
    const state = createInitialState(12345);
    expect(state.moves).toBe(0);
  });

  test('all 52 cards are distributed (28 tableau + 24 stock)', () => {
    const state = createInitialState(12345);

    const tableauCards = state.tableau.flatMap((col) => col.cards);
    const totalCards = tableauCards.length + state.stock.length;

    expect(totalCards).toBe(52);
  });

  test('different seeds produce different games', () => {
    const state1 = createInitialState(111);
    const state2 = createInitialState(999);

    const firstCard1 = state1.tableau[0].cards[0];
    const firstCard2 = state2.tableau[0].cards[0];

    // Very unlikely to have same first card with different seeds
    expect(firstCard1.id).not.toBe(firstCard2.id);
  });

  test('same seed produces same game', () => {
    const state1 = createInitialState(777);
    const state2 = createInitialState(777);

    // Check that first cards in each column match
    for (let i = 0; i < 7; i++) {
      const cards1 = state1.tableau[i].cards.map((c) => c.id);
      const cards2 = state2.tableau[i].cards.map((c) => c.id);
      expect(cards1).toEqual(cards2);
    }

    // Check stock matches
    const stock1Ids = state1.stock.map((c) => c.id);
    const stock2Ids = state2.stock.map((c) => c.id);
    expect(stock1Ids).toEqual(stock2Ids);
  });

  test('all cards are unique', () => {
    const state = createInitialState(12345);

    const allCards = [
      ...state.tableau.flatMap((col) => col.cards),
      ...state.stock,
      ...state.waste,
      ...state.foundations.flat(),
    ];

    const cardIds = allCards.map((c) => c.id);
    const uniqueIds = new Set(cardIds);

    expect(uniqueIds.size).toBe(52);
  });
});

describe('isCardFaceUp', () => {
  test('top card in tableau column is face-up', () => {
    const state = createInitialState(12345);
    const location: Location = { type: 'tableau', index: 0 };

    // Column 0 has 1 card, and faceUpCount is 1
    expect(isCardFaceUp(state, location, 0)).toBe(true);
  });

  test('face-down cards in tableau are not face-up', () => {
    const state = createInitialState(12345);
    const location: Location = { type: 'tableau', index: 6 }; // Column with 7 cards

    // Only the last card (index 6) should be face-up initially
    expect(isCardFaceUp(state, location, 0)).toBe(false); // First card
    expect(isCardFaceUp(state, location, 5)).toBe(false); // 6th card
    expect(isCardFaceUp(state, location, 6)).toBe(true); // 7th card (last)
  });

  test('stock cards are always face-down', () => {
    const state = createInitialState(12345);
    const location: Location = { type: 'stock' };

    expect(isCardFaceUp(state, location, 0)).toBe(false);
    expect(isCardFaceUp(state, location, 10)).toBe(false);
    expect(isCardFaceUp(state, location, 23)).toBe(false);
  });

  test('waste cards are always face-up', () => {
    const state = createInitialState(12345);
    state.waste = [
      { suit: '♥', value: 'A', rank: 1, id: 'A♥' },
      { suit: '♠', value: 'K', rank: 13, id: 'K♠' },
    ];
    const location: Location = { type: 'waste' };

    expect(isCardFaceUp(state, location, 0)).toBe(true);
    expect(isCardFaceUp(state, location, 1)).toBe(true);
  });

  test('foundation cards are always face-up', () => {
    const state = createInitialState(12345);
    state.foundations[0] = [
      { suit: '♥', value: 'A', rank: 1, id: 'A♥' },
      { suit: '♥', value: '2', rank: 2, id: '2♥' },
    ];
    const location: Location = { type: 'foundation', index: 0 };

    expect(isCardFaceUp(state, location, 0)).toBe(true);
    expect(isCardFaceUp(state, location, 1)).toBe(true);
  });

  test('handles tableau with multiple face-up cards', () => {
    const state = createInitialState(12345);
    state.tableau[0] = {
      cards: [
        { suit: '♠', value: '8', rank: 8, id: '8♠' },
        { suit: '♥', value: '7', rank: 7, id: '7♥' },
        { suit: '♣', value: '6', rank: 6, id: '6♣' },
      ],
      faceUpCount: 2, // Last 2 cards are face-up
    };
    const location: Location = { type: 'tableau', index: 0 };

    expect(isCardFaceUp(state, location, 0)).toBe(false); // Face-down
    expect(isCardFaceUp(state, location, 1)).toBe(true); // Face-up
    expect(isCardFaceUp(state, location, 2)).toBe(true); // Face-up
  });

  test('handles tableau with all cards face-up', () => {
    const state = createInitialState(12345);
    state.tableau[0] = {
      cards: [
        { suit: '♠', value: '5', rank: 5, id: '5♠' },
        { suit: '♥', value: '4', rank: 4, id: '4♥' },
      ],
      faceUpCount: 2, // All cards face-up
    };
    const location: Location = { type: 'tableau', index: 0 };

    expect(isCardFaceUp(state, location, 0)).toBe(true);
    expect(isCardFaceUp(state, location, 1)).toBe(true);
  });

  test('handles tableau with all cards face-down', () => {
    const state = createInitialState(12345);
    state.tableau[0] = {
      cards: [
        { suit: '♠', value: '5', rank: 5, id: '5♠' },
        { suit: '♥', value: '4', rank: 4, id: '4♥' },
      ],
      faceUpCount: 0, // All cards face-down (shouldn't happen in real game)
    };
    const location: Location = { type: 'tableau', index: 0 };

    expect(isCardFaceUp(state, location, 0)).toBe(false);
    expect(isCardFaceUp(state, location, 1)).toBe(false);
  });
});

describe('getCardsAtLocation', () => {
  test('returns cards from tableau column', () => {
    const state = createInitialState(12345);
    const location: Location = { type: 'tableau', index: 0 };

    const cards = getCardsAtLocation(state, location);
    expect(cards).toEqual(state.tableau[0].cards);
  });

  test('returns cards from different tableau columns', () => {
    const state = createInitialState(12345);

    for (let i = 0; i < 7; i++) {
      const location: Location = { type: 'tableau', index: i };
      const cards = getCardsAtLocation(state, location);
      expect(cards).toEqual(state.tableau[i].cards);
    }
  });

  test('returns stock cards', () => {
    const state = createInitialState(12345);
    const location: Location = { type: 'stock' };

    const cards = getCardsAtLocation(state, location);
    expect(cards).toEqual(state.stock);
  });

  test('returns waste cards', () => {
    const state = createInitialState(12345);
    state.waste = [
      { suit: '♥', value: 'A', rank: 1, id: 'A♥' },
      { suit: '♠', value: 'K', rank: 13, id: 'K♠' },
    ];
    const location: Location = { type: 'waste' };

    const cards = getCardsAtLocation(state, location);
    expect(cards).toEqual(state.waste);
  });

  test('returns foundation cards', () => {
    const state = createInitialState(12345);
    state.foundations[0] = [
      { suit: '♥', value: 'A', rank: 1, id: 'A♥' },
      { suit: '♥', value: '2', rank: 2, id: '2♥' },
    ];
    const location: Location = { type: 'foundation', index: 0 };

    const cards = getCardsAtLocation(state, location);
    expect(cards).toEqual(state.foundations[0]);
  });

  test('returns empty array for tableau without index', () => {
    const state = createInitialState(12345);
    const location: Location = { type: 'tableau' }; // No index

    const cards = getCardsAtLocation(state, location);
    expect(cards).toEqual([]);
  });

  test('returns empty array for foundation without index', () => {
    const state = createInitialState(12345);
    const location: Location = { type: 'foundation' }; // No index

    const cards = getCardsAtLocation(state, location);
    expect(cards).toEqual([]);
  });

  test('returns empty waste when waste is empty', () => {
    const state = createInitialState(12345);
    const location: Location = { type: 'waste' };

    const cards = getCardsAtLocation(state, location);
    expect(cards).toEqual([]);
  });
});

describe('isGameWon', () => {
  test('returns false for initial game state', () => {
    const state = createInitialState(12345);
    expect(isGameWon(state)).toBe(false);
  });

  test('returns false when foundations are empty', () => {
    const state = createInitialState(12345);
    state.foundations = [[], [], [], []];
    expect(isGameWon(state)).toBe(false);
  });

  test('returns false when some foundations are incomplete', () => {
    const state = createInitialState(12345);
    state.foundations[0] = Array.from({ length: 13 }, (_, i) => ({
      suit: '♠' as const,
      value: ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'][i] as Card['value'],
      rank: i + 1,
      id: `${['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'][i]}♠`,
    }));
    state.foundations[1] = []; // Incomplete
    state.foundations[2] = [];
    state.foundations[3] = [];

    expect(isGameWon(state)).toBe(false);
  });

  test('returns false when 3 foundations are complete', () => {
    const state = createInitialState(12345);
    const suits = ['♠', '♥', '♦'] as const;
    const values: Card['value'][] = [
      'A',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      'J',
      'Q',
      'K',
    ];

    for (let i = 0; i < 3; i++) {
      state.foundations[i] = values.map((value, index) => ({
        suit: suits[i],
        value,
        rank: index + 1,
        id: `${value}${suits[i]}`,
      }));
    }
    state.foundations[3] = []; // One incomplete

    expect(isGameWon(state)).toBe(false);
  });

  test('returns true when all 4 foundations have 13 cards', () => {
    const state = createInitialState(12345);
    const suits = ['♠', '♥', '♦', '♣'] as const;
    const values: Card['value'][] = [
      'A',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      'J',
      'Q',
      'K',
    ];

    for (let i = 0; i < 4; i++) {
      state.foundations[i] = values.map((value, index) => ({
        suit: suits[i],
        value,
        rank: index + 1,
        id: `${value}${suits[i]}`,
      }));
    }

    expect(isGameWon(state)).toBe(true);
  });

  test('returns false when foundations have too many cards', () => {
    const state = createInitialState(12345);
    // This shouldn't happen in a real game, but test the boundary
    state.foundations[0] = Array.from({ length: 14 }, () => ({
      suit: '♠' as const,
      value: 'A' as const,
      rank: 1,
      id: 'A♠',
    }));
    state.foundations[1] = [];
    state.foundations[2] = [];
    state.foundations[3] = [];

    expect(isGameWon(state)).toBe(false);
  });

  test('returns false when foundations have 12 cards each', () => {
    const state = createInitialState(12345);
    const suits = ['♠', '♥', '♦', '♣'] as const;
    const values: Card['value'][] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q'];

    for (let i = 0; i < 4; i++) {
      state.foundations[i] = values.map((value, index) => ({
        suit: suits[i],
        value,
        rank: index + 1,
        id: `${value}${suits[i]}`,
      }));
    }

    expect(isGameWon(state)).toBe(false);
  });
});
