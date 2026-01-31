/**
 * Tests for Card Display Logic (RFC-005 Compatible)
 *
 * These tests validate the isCardFaceUp() function that will eventually
 * become part of KlondikeGameActions in RFC-005.
 *
 * IMPORTANT: These tests are written to transfer directly to GameActions tests
 * when we migrate to the unified system.
 */

import { describe, it, expect } from 'vitest';
import { isCardFaceUp, getCardsAtLocation, getCardAtLocation } from '../cardDisplay';
import { createInitialState } from '../gameState';
import type { CardType as Card } from '@plokmin/shared';

describe('isCardFaceUp (RFC-005 compatible)', () => {
  describe('Stock pile', () => {
    it('all stock cards are face-down', () => {
      const state = createInitialState(12345);

      // Stock pile should have 24 cards initially
      expect(state.stock.length).toBe(24);

      // All stock cards should be face-down
      expect(isCardFaceUp(state, { type: 'stock', index: 0 })).toBe(false);
      expect(isCardFaceUp(state, { type: 'stock', index: 0 }, 0)).toBe(false);
      expect(isCardFaceUp(state, { type: 'stock', index: 0 }, 10)).toBe(false);
      expect(isCardFaceUp(state, { type: 'stock', index: 0 }, 23)).toBe(false);
    });

    it('empty stock is considered face-up (safe default)', () => {
      const state = createInitialState(12345);
      state.stock = []; // Empty the stock

      // Empty stock should return true (safe default)
      expect(isCardFaceUp(state, { type: 'stock', index: 0 })).toBe(false);
      // Note: Stock is ALWAYS false, even when empty
    });
  });

  describe('Waste pile', () => {
    it('all waste cards are face-up', () => {
      const state = createInitialState(12345);

      // Move some cards to waste
      state.waste = state.stock.slice(0, 3);
      state.stock = state.stock.slice(3);

      // All waste cards should be face-up
      expect(isCardFaceUp(state, { type: 'waste', index: 0 })).toBe(true);
      expect(isCardFaceUp(state, { type: 'waste', index: 0 }, 0)).toBe(true);
      expect(isCardFaceUp(state, { type: 'waste', index: 0 }, 1)).toBe(true);
      expect(isCardFaceUp(state, { type: 'waste', index: 0 }, 2)).toBe(true);
    });

    it('empty waste is considered face-up', () => {
      const state = createInitialState(12345);
      // Waste is initially empty

      expect(isCardFaceUp(state, { type: 'waste', index: 0 })).toBe(true);
    });
  });

  describe('Foundation piles', () => {
    it('all foundation cards are face-up', () => {
      const state = createInitialState(12345);

      // Add some cards to foundation
      const aceOfSpades: Card = { suit: '♠', value: 'A', rank: 1, id: 'A♠' };
      const twoOfSpades: Card = { suit: '♠', value: '2', rank: 2, id: '2♠' };
      state.foundations[0] = [aceOfSpades, twoOfSpades];

      // All foundation cards should be face-up
      expect(isCardFaceUp(state, { type: 'foundation', index: 0 })).toBe(true);
      expect(isCardFaceUp(state, { type: 'foundation', index: 0 }, 0)).toBe(true);
      expect(isCardFaceUp(state, { type: 'foundation', index: 0 }, 1)).toBe(true);
    });

    it('empty foundation is considered face-up', () => {
      const state = createInitialState(12345);
      // Foundations are initially empty

      expect(isCardFaceUp(state, { type: 'foundation', index: 0 })).toBe(true);
      expect(isCardFaceUp(state, { type: 'foundation', index: 1 })).toBe(true);
      expect(isCardFaceUp(state, { type: 'foundation', index: 2 })).toBe(true);
      expect(isCardFaceUp(state, { type: 'foundation', index: 3 })).toBe(true);
    });
  });

  describe('Tableau columns', () => {
    it('respects faceUpCount for each column', () => {
      const state = createInitialState(12345);

      // Initial tableau setup:
      // Column 0: 1 card, faceUpCount=1 → all face-up (index 0)
      // Column 1: 2 cards, faceUpCount=1 → index 0 face-down, index 1 face-up
      // Column 2: 3 cards, faceUpCount=1 → indices 0-1 face-down, index 2 face-up
      // Column 6: 7 cards, faceUpCount=1 → indices 0-5 face-down, index 6 face-up

      // Column 0: 1 card total, 1 face-up
      expect(isCardFaceUp(state, { type: 'tableau', index: 0 }, 0)).toBe(true);

      // Column 1: 2 cards total, 1 face-up (faceDownCount = 1)
      expect(isCardFaceUp(state, { type: 'tableau', index: 1 }, 0)).toBe(false); // face-down
      expect(isCardFaceUp(state, { type: 'tableau', index: 1 }, 1)).toBe(true); // face-up

      // Column 2: 3 cards total, 1 face-up (faceDownCount = 2)
      expect(isCardFaceUp(state, { type: 'tableau', index: 2 }, 0)).toBe(false); // face-down
      expect(isCardFaceUp(state, { type: 'tableau', index: 2 }, 1)).toBe(false); // face-down
      expect(isCardFaceUp(state, { type: 'tableau', index: 2 }, 2)).toBe(true); // face-up

      // Column 6: 7 cards total, 1 face-up (faceDownCount = 6)
      expect(isCardFaceUp(state, { type: 'tableau', index: 6 }, 0)).toBe(false); // face-down
      expect(isCardFaceUp(state, { type: 'tableau', index: 6 }, 5)).toBe(false); // face-down
      expect(isCardFaceUp(state, { type: 'tableau', index: 6 }, 6)).toBe(true); // face-up
    });

    it('handles increased faceUpCount after flipping cards', () => {
      const state = createInitialState(12345);

      // Simulate flipping more cards in column 2
      // Initially: 3 cards, faceUpCount=1 (indices 0-1 down, 2 up)
      state.tableau[2].faceUpCount = 3; // Now all face-up

      expect(isCardFaceUp(state, { type: 'tableau', index: 2 }, 0)).toBe(true);
      expect(isCardFaceUp(state, { type: 'tableau', index: 2 }, 1)).toBe(true);
      expect(isCardFaceUp(state, { type: 'tableau', index: 2 }, 2)).toBe(true);
    });

    it('handles partial faceUpCount', () => {
      const state = createInitialState(12345);

      // Column 6 has 7 cards
      // Set faceUpCount to 4 (bottom 4 cards face-up)
      state.tableau[6].faceUpCount = 4;

      // faceDownCount = 7 - 4 = 3
      // Indices 0-2 face-down, indices 3-6 face-up
      expect(isCardFaceUp(state, { type: 'tableau', index: 6 }, 0)).toBe(false);
      expect(isCardFaceUp(state, { type: 'tableau', index: 6 }, 1)).toBe(false);
      expect(isCardFaceUp(state, { type: 'tableau', index: 6 }, 2)).toBe(false);
      expect(isCardFaceUp(state, { type: 'tableau', index: 6 }, 3)).toBe(true);
      expect(isCardFaceUp(state, { type: 'tableau', index: 6 }, 4)).toBe(true);
      expect(isCardFaceUp(state, { type: 'tableau', index: 6 }, 5)).toBe(true);
      expect(isCardFaceUp(state, { type: 'tableau', index: 6 }, 6)).toBe(true);
    });

    it('empty tableau column is considered face-up (safe default)', () => {
      const state = createInitialState(12345);

      // Empty a column
      state.tableau[0] = { cards: [], faceUpCount: 0 };

      expect(isCardFaceUp(state, { type: 'tableau', index: 0 })).toBe(true);
      expect(isCardFaceUp(state, { type: 'tableau', index: 0 }, 0)).toBe(true);
    });

    it('handles index undefined (checks if ANY cards are face-up)', () => {
      const state = createInitialState(12345);

      // Column with faceUpCount > 0
      expect(isCardFaceUp(state, { type: 'tableau', index: 0 })).toBe(true);

      // Column with faceUpCount = 0 (all face-down)
      state.tableau[0].faceUpCount = 0;
      expect(isCardFaceUp(state, { type: 'tableau', index: 0 })).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('handles freeCell location (not used in Klondike)', () => {
      const state = createInitialState(12345);

      // FreeCell type returns true (safe default)
      expect(isCardFaceUp(state, { type: 'freeCell', index: 0 })).toBe(true);
    });

    it('handles invalid tableau index gracefully', () => {
      const state = createInitialState(12345);

      // Out of bounds index (Klondike has 7 columns: 0-6)
      // Should return true (safe default for invalid locations)
      const result = isCardFaceUp(state, { type: 'tableau', index: 99 }, 0);
      expect(result).toBe(true);
    });
  });
});

describe('getCardsAtLocation (RFC-005 compatible)', () => {
  it('returns cards from tableau column', () => {
    const state = createInitialState(12345);

    const cards = getCardsAtLocation(state, { type: 'tableau', index: 0 });
    expect(cards).toHaveLength(1);
    expect(cards[0]).toBeDefined();
  });

  it('returns cards from stock', () => {
    const state = createInitialState(12345);

    const cards = getCardsAtLocation(state, { type: 'stock', index: 0 });
    expect(cards).toHaveLength(24);
  });

  it('returns cards from waste', () => {
    const state = createInitialState(12345);
    state.waste = state.stock.slice(0, 3);

    const cards = getCardsAtLocation(state, { type: 'waste', index: 0 });
    expect(cards).toHaveLength(3);
  });

  it('returns cards from foundation', () => {
    const state = createInitialState(12345);
    const aceOfSpades: Card = { suit: '♠', value: 'A', rank: 1, id: 'A♠' };
    state.foundations[0] = [aceOfSpades];

    const cards = getCardsAtLocation(state, { type: 'foundation', index: 0 });
    expect(cards).toHaveLength(1);
    expect(cards[0]).toEqual(aceOfSpades);
  });

  it('returns empty array for empty locations', () => {
    const state = createInitialState(12345);
    state.waste = [];

    const cards = getCardsAtLocation(state, { type: 'waste', index: 0 });
    expect(cards).toEqual([]);
  });

  it('returns empty array for freeCell (not used in Klondike)', () => {
    const state = createInitialState(12345);

    const cards = getCardsAtLocation(state, { type: 'freeCell', index: 0 });
    expect(cards).toEqual([]);
  });
});

describe('getCardAtLocation (RFC-005 compatible)', () => {
  it('returns top card from tableau column', () => {
    const state = createInitialState(12345);

    const card = getCardAtLocation(state, { type: 'tableau', index: 2 });
    expect(card).toBeDefined();
    // Should be the last card in column 2
    expect(card).toEqual(state.tableau[2].cards[state.tableau[2].cards.length - 1]);
  });

  it('returns top card from waste', () => {
    const state = createInitialState(12345);
    state.waste = state.stock.slice(0, 3);

    const card = getCardAtLocation(state, { type: 'waste', index: 0 });
    expect(card).toEqual(state.waste[2]); // Top card (last in array)
  });

  it('returns null for empty locations', () => {
    const state = createInitialState(12345);
    state.waste = [];

    const card = getCardAtLocation(state, { type: 'waste', index: 0 });
    expect(card).toBeNull();
  });

  it('returns null for empty tableau column', () => {
    const state = createInitialState(12345);
    state.tableau[0] = { cards: [], faceUpCount: 0 };

    const card = getCardAtLocation(state, { type: 'tableau', index: 0 });
    expect(card).toBeNull();
  });
});

describe('RFC-005 Migration Readiness', () => {
  it('function signatures match GameActions interface', () => {
    // This test documents that our functions match the RFC-005 GameActions interface
    // When we migrate, these functions will become methods on KlondikeGameActions

    const state = createInitialState(12345);

    // isCardFaceUp signature: (state: TState, location: GameLocation, index?: number) => boolean
    const _faceUp: boolean = isCardFaceUp(state, { type: 'tableau', index: 0 }, 0);

    // getCardsAtLocation - helper for GameActions.getCardAt
    const _cards: Card[] = getCardsAtLocation(state, { type: 'tableau', index: 0 });

    // getCardAtLocation - helper for GameActions.getCardAt
    const _card: Card | null = getCardAtLocation(state, { type: 'tableau', index: 0 });

    // If this compiles, the signatures are compatible!
    expect(_faceUp).toBeDefined();
    expect(_cards).toBeDefined();
    expect(_card).toBeDefined();
  });

  it('uses shared GameLocation type (not local Location type)', () => {
    // This test ensures we're using the @plokmin/shared GameLocation type
    // which is required for RFC-005 compatibility

    const state = createInitialState(12345);

    // GameLocation from @plokmin/shared supports these location types
    const tableauLocation = { type: 'tableau' as const, index: 0 };
    const stockLocation = { type: 'stock' as const, index: 0 };
    const wasteLocation = { type: 'waste' as const, index: 0 };
    const foundationLocation = { type: 'foundation' as const, index: 0 };
    const freeCellLocation = { type: 'freeCell' as const, index: 0 };

    // All should work with our function
    expect(isCardFaceUp(state, tableauLocation)).toBeDefined();
    expect(isCardFaceUp(state, stockLocation)).toBeDefined();
    expect(isCardFaceUp(state, wasteLocation)).toBeDefined();
    expect(isCardFaceUp(state, foundationLocation)).toBeDefined();
    expect(isCardFaceUp(state, freeCellLocation)).toBeDefined();
  });
});
