import { describe, test, expect } from 'vitest';
import { drawFromStock, moveCards, autoMoveToFoundations } from '../gameActions';
import { createInitialState, type Location } from '../gameState';

describe('drawFromStock', () => {
  test('draws one card from stock to waste', () => {
    const state = createInitialState(12345);
    const originalStockLength = state.stock.length;
    const topCard = state.stock[state.stock.length - 1];

    const newState = drawFromStock(state);

    expect(newState.stock).toHaveLength(originalStockLength - 1);
    expect(newState.waste).toHaveLength(1);
    expect(newState.waste[0]).toEqual(topCard);
    expect(newState.moves).toBe(1);
  });

  test('draws multiple cards sequentially', () => {
    const state = createInitialState(12345);
    const card1 = state.stock[state.stock.length - 1];
    const card2 = state.stock[state.stock.length - 2];

    const state1 = drawFromStock(state);
    const state2 = drawFromStock(state1);

    expect(state2.waste).toHaveLength(2);
    expect(state2.waste[0]).toEqual(card1);
    expect(state2.waste[1]).toEqual(card2);
    expect(state2.stock).toHaveLength(22); // 24 - 2
  });

  test('recycles waste to stock when stock is empty', () => {
    const state = createInitialState(12345);
    state.stock = [];
    state.waste = [
      { suit: '♥', value: 'A', rank: 1, id: 'A♥' },
      { suit: '♠', value: 'K', rank: 13, id: 'K♠' },
      { suit: '♦', value: '7', rank: 7, id: '7♦' },
    ];

    const newState = drawFromStock(state);

    expect(newState.stock).toHaveLength(3);
    expect(newState.waste).toHaveLength(0);
    // Waste is reversed when recycled to stock
    expect(newState.stock[0]).toEqual({ suit: '♦', value: '7', rank: 7, id: '7♦' });
    expect(newState.stock[1]).toEqual({ suit: '♠', value: 'K', rank: 13, id: 'K♠' });
    expect(newState.stock[2]).toEqual({ suit: '♥', value: 'A', rank: 1, id: 'A♥' });
  });

  test('returns same state when both stock and waste are empty', () => {
    const state = createInitialState(12345);
    state.stock = [];
    state.waste = [];

    const newState = drawFromStock(state);

    expect(newState).toBe(state); // Same reference
    expect(newState.stock).toHaveLength(0);
    expect(newState.waste).toHaveLength(0);
  });

  test('increments move counter', () => {
    const state = createInitialState(12345);
    state.moves = 5;

    const newState = drawFromStock(state);

    expect(newState.moves).toBe(6);
  });

  test('does not mutate original state', () => {
    const state = createInitialState(12345);
    const originalStock = [...state.stock];
    const originalWaste = [...state.waste];

    drawFromStock(state);

    expect(state.stock).toEqual(originalStock);
    expect(state.waste).toEqual(originalWaste);
  });

  test('draws all cards from stock', () => {
    let state = createInitialState(12345);
    const originalStockLength = state.stock.length;

    // Draw all cards
    for (let i = 0; i < originalStockLength; i++) {
      state = drawFromStock(state);
    }

    expect(state.stock).toHaveLength(0);
    expect(state.waste).toHaveLength(originalStockLength);
  });

  test('recycle preserves all cards', () => {
    const state = createInitialState(12345);
    state.stock = [];
    state.waste = [
      { suit: '♥', value: 'A', rank: 1, id: 'A♥' },
      { suit: '♠', value: 'K', rank: 13, id: 'K♠' },
    ];

    const wasteIds = state.waste.map(c => c.id);
    const newState = drawFromStock(state);
    const stockIds = newState.stock.map(c => c.id);

    expect(stockIds.sort()).toEqual(wasteIds.sort());
  });
});

describe('moveCards - waste to tableau', () => {
  test('moves card from waste to tableau', () => {
    const state = createInitialState(12345);
    state.waste = [{ suit: '♥', value: '7', rank: 7, id: '7♥' }];
    state.tableau[0] = {
      cards: [{ suit: '♠', value: '8', rank: 8, id: '8♠' }],
      faceUpCount: 1,
    };

    const from: Location = { type: 'waste' };
    const to: Location = { type: 'tableau', index: 0 };

    const newState = moveCards(state, from, to, 1);

    expect(newState).not.toBeNull();
    expect(newState!.waste).toHaveLength(0);
    expect(newState!.tableau[0].cards).toHaveLength(2);
    expect(newState!.tableau[0].cards[1].id).toBe('7♥');
    expect(newState!.tableau[0].faceUpCount).toBe(2);
    expect(newState!.moves).toBe(1);
  });

  test('returns null for invalid move (same color)', () => {
    const state = createInitialState(12345);
    state.waste = [{ suit: '♥', value: '7', rank: 7, id: '7♥' }];
    state.tableau[0] = {
      cards: [{ suit: '♦', value: '8', rank: 8, id: '8♦' }], // Both red
      faceUpCount: 1,
    };

    const from: Location = { type: 'waste' };
    const to: Location = { type: 'tableau', index: 0 };

    const result = moveCards(state, from, to, 1);

    expect(result).toBeNull();
  });

  test('returns null for invalid move (wrong rank)', () => {
    const state = createInitialState(12345);
    state.waste = [{ suit: '♥', value: '9', rank: 9, id: '9♥' }];
    state.tableau[0] = {
      cards: [{ suit: '♠', value: '8', rank: 8, id: '8♠' }], // 9 can't go on 8
      faceUpCount: 1,
    };

    const from: Location = { type: 'waste' };
    const to: Location = { type: 'tableau', index: 0 };

    const result = moveCards(state, from, to, 1);

    expect(result).toBeNull();
  });

  test('moves King from waste to empty tableau', () => {
    const state = createInitialState(12345);
    state.waste = [{ suit: '♠', value: 'K', rank: 13, id: 'K♠' }];
    state.tableau[0] = {
      cards: [],
      faceUpCount: 0,
    };

    const from: Location = { type: 'waste' };
    const to: Location = { type: 'tableau', index: 0 };

    const newState = moveCards(state, from, to, 1);

    expect(newState).not.toBeNull();
    expect(newState!.tableau[0].cards).toHaveLength(1);
    expect(newState!.tableau[0].cards[0].id).toBe('K♠');
  });

  test('returns null when moving non-King to empty tableau', () => {
    const state = createInitialState(12345);
    state.waste = [{ suit: '♥', value: '7', rank: 7, id: '7♥' }];
    state.tableau[0] = {
      cards: [],
      faceUpCount: 0,
    };

    const from: Location = { type: 'waste' };
    const to: Location = { type: 'tableau', index: 0 };

    const result = moveCards(state, from, to, 1);

    expect(result).toBeNull();
  });
});

describe('moveCards - waste to foundation', () => {
  test('moves Ace from waste to empty foundation', () => {
    const state = createInitialState(12345);
    state.waste = [{ suit: '♥', value: 'A', rank: 1, id: 'A♥' }];

    const from: Location = { type: 'waste' };
    const to: Location = { type: 'foundation', index: 0 };

    const newState = moveCards(state, from, to, 1);

    expect(newState).not.toBeNull();
    expect(newState!.waste).toHaveLength(0);
    expect(newState!.foundations[0]).toHaveLength(1);
    expect(newState!.foundations[0][0].id).toBe('A♥');
  });

  test('builds foundation sequentially', () => {
    const state = createInitialState(12345);
    state.foundations[0] = [{ suit: '♠', value: 'A', rank: 1, id: 'A♠' }];
    state.waste = [{ suit: '♠', value: '2', rank: 2, id: '2♠' }];

    const from: Location = { type: 'waste' };
    const to: Location = { type: 'foundation', index: 0 };

    const newState = moveCards(state, from, to, 1);

    expect(newState).not.toBeNull();
    expect(newState!.foundations[0]).toHaveLength(2);
    expect(newState!.foundations[0][1].id).toBe('2♠');
  });

  test('returns null when moving wrong suit to foundation', () => {
    const state = createInitialState(12345);
    state.foundations[0] = [{ suit: '♠', value: 'A', rank: 1, id: 'A♠' }];
    state.waste = [{ suit: '♥', value: '2', rank: 2, id: '2♥' }]; // Different suit

    const from: Location = { type: 'waste' };
    const to: Location = { type: 'foundation', index: 0 };

    const result = moveCards(state, from, to, 1);

    expect(result).toBeNull();
  });

  test('returns null when moving non-Ace to empty foundation', () => {
    const state = createInitialState(12345);
    state.waste = [{ suit: '♥', value: '2', rank: 2, id: '2♥' }];

    const from: Location = { type: 'waste' };
    const to: Location = { type: 'foundation', index: 0 };

    const result = moveCards(state, from, to, 1);

    expect(result).toBeNull();
  });
});

describe('moveCards - tableau to tableau', () => {
  test('moves single card between tableau columns', () => {
    const state = createInitialState(12345);
    state.tableau[0] = {
      cards: [{ suit: '♥', value: '7', rank: 7, id: '7♥' }],
      faceUpCount: 1,
    };
    state.tableau[1] = {
      cards: [{ suit: '♠', value: '8', rank: 8, id: '8♠' }],
      faceUpCount: 1,
    };

    const from: Location = { type: 'tableau', index: 0 };
    const to: Location = { type: 'tableau', index: 1 };

    const newState = moveCards(state, from, to, 1);

    expect(newState).not.toBeNull();
    expect(newState!.tableau[0].cards).toHaveLength(0);
    expect(newState!.tableau[1].cards).toHaveLength(2);
    expect(newState!.tableau[1].cards[1].id).toBe('7♥');
  });

  test('moves sequence of cards', () => {
    const state = createInitialState(12345);
    state.tableau[0] = {
      cards: [
        { suit: '♠', value: '9', rank: 9, id: '9♠' },
        { suit: '♥', value: '8', rank: 8, id: '8♥' },
        { suit: '♣', value: '7', rank: 7, id: '7♣' },
      ],
      faceUpCount: 3,
    };
    state.tableau[1] = {
      cards: [{ suit: '♦', value: '10', rank: 10, id: '10♦' }],
      faceUpCount: 1,
    };

    const from: Location = { type: 'tableau', index: 0 };
    const to: Location = { type: 'tableau', index: 1 };

    const newState = moveCards(state, from, to, 3);

    expect(newState).not.toBeNull();
    expect(newState!.tableau[0].cards).toHaveLength(0);
    expect(newState!.tableau[1].cards).toHaveLength(4);
    expect(newState!.tableau[1].faceUpCount).toBe(4);
  });

  test('returns null when moving invalid sequence', () => {
    const state = createInitialState(12345);
    state.tableau[0] = {
      cards: [
        { suit: '♠', value: '9', rank: 9, id: '9♠' },
        { suit: '♣', value: '8', rank: 8, id: '8♣' }, // Same color - invalid
      ],
      faceUpCount: 2,
    };
    state.tableau[1] = {
      cards: [{ suit: '♦', value: '10', rank: 10, id: '10♦' }],
      faceUpCount: 1,
    };

    const from: Location = { type: 'tableau', index: 0 };
    const to: Location = { type: 'tableau', index: 1 };

    const result = moveCards(state, from, to, 2);

    expect(result).toBeNull();
  });

  test('flips top card after moving from tableau', () => {
    const state = createInitialState(12345);
    state.tableau[0] = {
      cards: [
        { suit: '♦', value: '9', rank: 9, id: '9♦' },
        { suit: '♠', value: '8', rank: 8, id: '8♠' },
      ],
      faceUpCount: 1, // Only last card is face-up
    };
    state.tableau[1] = {
      cards: [{ suit: '♥', value: '9', rank: 9, id: '9♥' }],
      faceUpCount: 1,
    };

    const from: Location = { type: 'tableau', index: 0 };
    const to: Location = { type: 'tableau', index: 1 };

    const newState = moveCards(state, from, to, 1);

    expect(newState).not.toBeNull();
    expect(newState!.tableau[0].cards).toHaveLength(1);
    expect(newState!.tableau[0].faceUpCount).toBe(1); // Top card flipped
  });

  test('does not flip when tableau becomes empty', () => {
    const state = createInitialState(12345);
    state.tableau[0] = {
      cards: [{ suit: '♠', value: '8', rank: 8, id: '8♠' }],
      faceUpCount: 1,
    };
    state.tableau[1] = {
      cards: [{ suit: '♥', value: '9', rank: 9, id: '9♥' }],
      faceUpCount: 1,
    };

    const from: Location = { type: 'tableau', index: 0 };
    const to: Location = { type: 'tableau', index: 1 };

    const newState = moveCards(state, from, to, 1);

    expect(newState).not.toBeNull();
    expect(newState!.tableau[0].cards).toHaveLength(0);
    expect(newState!.tableau[0].faceUpCount).toBe(0);
  });

  test('returns null when trying to move face-down cards', () => {
    const state = createInitialState(12345);
    state.tableau[0] = {
      cards: [
        { suit: '♦', value: '9', rank: 9, id: '9♦' },
        { suit: '♠', value: '8', rank: 8, id: '8♠' },
      ],
      faceUpCount: 1, // Only last card is face-up
    };
    state.tableau[1] = {
      cards: [{ suit: '♥', value: '10', rank: 10, id: '10♥' }],
      faceUpCount: 1,
    };

    const from: Location = { type: 'tableau', index: 0 };
    const to: Location = { type: 'tableau', index: 1 };

    // Trying to move 2 cards, but only 1 is face-up
    const result = moveCards(state, from, to, 2);

    expect(result).toBeNull();
  });

  test('moves King to empty tableau', () => {
    const state = createInitialState(12345);
    state.tableau[0] = {
      cards: [{ suit: '♠', value: 'K', rank: 13, id: 'K♠' }],
      faceUpCount: 1,
    };
    state.tableau[1] = {
      cards: [],
      faceUpCount: 0,
    };

    const from: Location = { type: 'tableau', index: 0 };
    const to: Location = { type: 'tableau', index: 1 };

    const newState = moveCards(state, from, to, 1);

    expect(newState).not.toBeNull();
    expect(newState!.tableau[1].cards).toHaveLength(1);
    expect(newState!.tableau[1].cards[0].id).toBe('K♠');
  });

  test('moves King sequence to empty tableau', () => {
    const state = createInitialState(12345);
    state.tableau[0] = {
      cards: [
        { suit: '♠', value: 'K', rank: 13, id: 'K♠' },
        { suit: '♥', value: 'Q', rank: 12, id: 'Q♥' },
      ],
      faceUpCount: 2,
    };
    state.tableau[1] = {
      cards: [],
      faceUpCount: 0,
    };

    const from: Location = { type: 'tableau', index: 0 };
    const to: Location = { type: 'tableau', index: 1 };

    const newState = moveCards(state, from, to, 2);

    expect(newState).not.toBeNull();
    expect(newState!.tableau[1].cards).toHaveLength(2);
  });
});

describe('moveCards - tableau to foundation', () => {
  test('moves Ace from tableau to foundation', () => {
    const state = createInitialState(12345);
    state.tableau[0] = {
      cards: [{ suit: '♥', value: 'A', rank: 1, id: 'A♥' }],
      faceUpCount: 1,
    };

    const from: Location = { type: 'tableau', index: 0 };
    const to: Location = { type: 'foundation', index: 0 };

    const newState = moveCards(state, from, to, 1);

    expect(newState).not.toBeNull();
    expect(newState!.tableau[0].cards).toHaveLength(0);
    expect(newState!.foundations[0]).toHaveLength(1);
    expect(newState!.foundations[0][0].id).toBe('A♥');
  });

  test('returns null when trying to move multiple cards to foundation', () => {
    const state = createInitialState(12345);
    state.tableau[0] = {
      cards: [
        { suit: '♥', value: 'A', rank: 1, id: 'A♥' },
        { suit: '♠', value: '2', rank: 2, id: '2♠' },
      ],
      faceUpCount: 2,
    };

    const from: Location = { type: 'tableau', index: 0 };
    const to: Location = { type: 'foundation', index: 0 };

    const result = moveCards(state, from, to, 2);

    expect(result).toBeNull();
  });
});

describe('moveCards - invalid moves', () => {
  test('returns null when moving from stock', () => {
    const state = createInitialState(12345);

    const from: Location = { type: 'stock' };
    const to: Location = { type: 'tableau', index: 0 };

    const result = moveCards(state, from, to, 1);

    expect(result).toBeNull();
  });

  test('returns null when moving to stock', () => {
    const state = createInitialState(12345);
    state.waste = [{ suit: '♥', value: 'A', rank: 1, id: 'A♥' }];

    const from: Location = { type: 'waste' };
    const to: Location = { type: 'stock' };

    const result = moveCards(state, from, to, 1);

    expect(result).toBeNull();
  });

  test('returns null when moving to waste', () => {
    const state = createInitialState(12345);
    state.tableau[0] = {
      cards: [{ suit: '♥', value: 'A', rank: 1, id: 'A♥' }],
      faceUpCount: 1,
    };

    const from: Location = { type: 'tableau', index: 0 };
    const to: Location = { type: 'waste' };

    const result = moveCards(state, from, to, 1);

    expect(result).toBeNull();
  });

  test('returns null when moving 0 cards', () => {
    const state = createInitialState(12345);

    const from: Location = { type: 'waste' };
    const to: Location = { type: 'tableau', index: 0 };

    const result = moveCards(state, from, to, 0);

    expect(result).toBeNull();
  });

  test('returns null when source is empty', () => {
    const state = createInitialState(12345);
    state.waste = [];

    const from: Location = { type: 'waste' };
    const to: Location = { type: 'tableau', index: 0 };

    const result = moveCards(state, from, to, 1);

    expect(result).toBeNull();
  });
});

describe('moveCards - immutability', () => {
  test('does not mutate original state', () => {
    const state = createInitialState(12345);
    state.waste = [{ suit: '♥', value: '7', rank: 7, id: '7♥' }];
    state.tableau[0] = {
      cards: [{ suit: '♠', value: '8', rank: 8, id: '8♠' }],
      faceUpCount: 1,
    };

    const originalWaste = [...state.waste];
    const originalTableau = JSON.parse(JSON.stringify(state.tableau));

    const from: Location = { type: 'waste' };
    const to: Location = { type: 'tableau', index: 0 };

    moveCards(state, from, to, 1);

    expect(state.waste).toEqual(originalWaste);
    expect(state.tableau).toEqual(originalTableau);
  });
});

describe('autoMoveToFoundations', () => {
  test('auto-moves Ace from waste to foundation', () => {
    const state = createInitialState(12345);
    state.waste = [{ suit: '♥', value: 'A', rank: 1, id: 'A♥' }];

    const newState = autoMoveToFoundations(state);

    expect(newState.waste).toHaveLength(0);
    // Hearts (♥) goes to foundation index 1 (suit order: ♠, ♥, ♦, ♣)
    expect(newState.foundations[1]).toHaveLength(1);
    expect(newState.foundations[1][0].id).toBe('A♥');
  });

  test('auto-moves Ace from tableau to foundation', () => {
    const state = createInitialState(12345);
    state.tableau[0] = {
      cards: [{ suit: '♠', value: 'A', rank: 1, id: 'A♠' }],
      faceUpCount: 1,
    };

    const newState = autoMoveToFoundations(state);

    expect(newState.tableau[0].cards).toHaveLength(0);
    expect(newState.foundations[0]).toHaveLength(1);
    expect(newState.foundations[0][0].id).toBe('A♠');
  });

  test('auto-moves multiple cards in sequence', () => {
    const state = createInitialState(12345);
    state.foundations[0] = [{ suit: '♠', value: 'A', rank: 1, id: 'A♠' }];
    state.waste = [{ suit: '♠', value: '2', rank: 2, id: '2♠' }];
    state.tableau[0] = {
      cards: [{ suit: '♠', value: '3', rank: 3, id: '3♠' }],
      faceUpCount: 1,
    };

    const newState = autoMoveToFoundations(state);

    expect(newState.waste).toHaveLength(0);
    expect(newState.tableau[0].cards).toHaveLength(0);
    expect(newState.foundations[0]).toHaveLength(3);
    expect(newState.foundations[0][2].id).toBe('3♠');
  });

  test('does not move if no valid moves available', () => {
    const state = createInitialState(12345);
    state.waste = [{ suit: '♥', value: '7', rank: 7, id: '7♥' }];

    const newState = autoMoveToFoundations(state);

    expect(newState).toEqual(state);
  });

  test('prioritizes waste over tableau', () => {
    const state = createInitialState(12345);
    state.waste = [{ suit: '♥', value: 'A', rank: 1, id: 'A♥' }];
    state.tableau[0] = {
      cards: [{ suit: '♠', value: 'A', rank: 1, id: 'A♠' }],
      faceUpCount: 1,
    };

    const newState = autoMoveToFoundations(state);

    // Waste card should be moved first
    expect(newState.waste).toHaveLength(0);
    expect(newState.foundations.flat()).toHaveLength(2); // Both should be moved
  });

  test('moves cards to correct foundation based on suit', () => {
    const state = createInitialState(12345);
    state.waste = [
      { suit: '♠', value: 'A', rank: 1, id: 'A♠' },
      { suit: '♥', value: 'A', rank: 1, id: 'A♥' },
      { suit: '♦', value: 'A', rank: 1, id: 'A♦' },
      { suit: '♣', value: 'A', rank: 1, id: 'A♣' },
    ];

    const newState = autoMoveToFoundations(state);

    // All aces should be distributed to foundations
    expect(newState.waste).toHaveLength(0);
    expect(newState.foundations[0][0].suit).toBe('♠');
    expect(newState.foundations[1][0].suit).toBe('♥');
    expect(newState.foundations[2][0].suit).toBe('♦');
    expect(newState.foundations[3][0].suit).toBe('♣');
  });

  test('does not mutate original state', () => {
    const state = createInitialState(12345);
    state.waste = [{ suit: '♥', value: 'A', rank: 1, id: 'A♥' }];

    const originalWaste = [...state.waste];
    const originalFoundations = JSON.parse(JSON.stringify(state.foundations));

    autoMoveToFoundations(state);

    expect(state.waste).toEqual(originalWaste);
    expect(state.foundations).toEqual(originalFoundations);
  });
});
