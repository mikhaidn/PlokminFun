import { describe, test, expect } from 'vitest';
import { validateMove } from '../moveValidation';
import { executeMove } from '../../state/moveExecution';
import type { GameState } from '../../state/gameState';
import type { GameLocation } from '@plokmin/shared';
import type { CardType as Card } from '@plokmin/shared';

/**
 * Tests for drag and drop functionality in FreeCell
 * Reproduces the bug where cards cannot be dragged onto other cards in the tableau
 */

// Helper to create a card
function card(value: Card['value'], suit: Card['suit']): Card {
  const rankMap: Record<Card['value'], number> = {
    A: 1,
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    '10': 10,
    J: 11,
    Q: 12,
    K: 13,
  };
  return {
    suit,
    value,
    rank: rankMap[value],
    id: `${value}${suit}`,
  };
}

// Helper to create a minimal game state for testing
function createTestState(tableau: Card[][]): GameState {
  return {
    seed: 1,
    tableau,
    freeCells: [null, null, null, null],
    foundations: [[], [], [], []],
    moves: 0,
  };
}

describe('Drag and Drop: Single Card from Tableau to Tableau', () => {
  test('should validate dragging a single card to a valid tableau position', () => {
    // Setup: Column 0 has [8♠], Column 1 has [7♥]
    // We want to drag 7♥ onto 8♠ (red 7 on black 8 is valid)
    const state = createTestState([
      [card('8', '♠')], // Column 0
      [card('7', '♥')], // Column 1
      [],
      [],
      [],
      [],
      [],
      [],
    ]);

    const from: GameLocation = {
      type: 'tableau',
      index: 1, // Column 1
      cardIndex: 0, // First (only) card
      cardCount: 1,
    };

    const to: GameLocation = {
      type: 'tableau',
      index: 0, // Column 0
    };

    const isValid = validateMove(state, from, to);
    expect(isValid).toBe(true);
  });

  test('should execute dragging a single card to a valid tableau position', () => {
    const state = createTestState([
      [card('8', '♠')], // Column 0
      [card('7', '♥')], // Column 1
      [],
      [],
      [],
      [],
      [],
      [],
    ]);

    const from: GameLocation = {
      type: 'tableau',
      index: 1,
      cardIndex: 0,
      cardCount: 1,
    };

    const to: GameLocation = {
      type: 'tableau',
      index: 0,
    };

    const newState = executeMove(state, from, to);

    expect(newState).not.toBeNull();
    expect(newState!.tableau[0]).toHaveLength(2);
    expect(newState!.tableau[0][0]).toEqual(card('8', '♠'));
    expect(newState!.tableau[0][1]).toEqual(card('7', '♥'));
    expect(newState!.tableau[1]).toHaveLength(0);
  });

  test('should reject dragging a card with wrong color', () => {
    // Setup: Column 0 has [8♠], Column 1 has [7♣]
    // Trying to drag 7♣ onto 8♠ (black on black is invalid)
    const state = createTestState([
      [card('8', '♠')], // Column 0
      [card('7', '♣')], // Column 1
      [],
      [],
      [],
      [],
      [],
      [],
    ]);

    const from: GameLocation = {
      type: 'tableau',
      index: 1,
      cardIndex: 0,
      cardCount: 1,
    };

    const to: GameLocation = {
      type: 'tableau',
      index: 0,
    };

    const isValid = validateMove(state, from, to);
    expect(isValid).toBe(false);
  });

  test('should reject dragging a card with wrong rank', () => {
    // Setup: Column 0 has [8♠], Column 1 has [6♥]
    // Trying to drag 6♥ onto 8♠ (rank difference must be exactly 1)
    const state = createTestState([
      [card('8', '♠')], // Column 0
      [card('6', '♥')], // Column 1
      [],
      [],
      [],
      [],
      [],
      [],
    ]);

    const from: GameLocation = {
      type: 'tableau',
      index: 1,
      cardIndex: 0,
      cardCount: 1,
    };

    const to: GameLocation = {
      type: 'tableau',
      index: 0,
    };

    const isValid = validateMove(state, from, to);
    expect(isValid).toBe(false);
  });
});

describe('Drag and Drop: Card from Middle of Column', () => {
  test('should validate dragging a card from the middle of a column', () => {
    // Setup: Column 0 has [9♠, 8♥, 7♠], Column 1 has [10♦]
    // We want to drag 9♠ (with 8♥ and 7♠ below) onto 10♦
    const state = createTestState([
      [card('9', '♠'), card('8', '♥'), card('7', '♠')], // Column 0
      [card('10', '♦')], // Column 1
      [],
      [],
      [],
      [],
      [],
      [],
    ]);

    const from: GameLocation = {
      type: 'tableau',
      index: 0, // Column 0
      cardIndex: 0, // Top card (9♠)
      cardCount: 3, // Moving all 3 cards
    };

    const to: GameLocation = {
      type: 'tableau',
      index: 1, // Column 1
    };

    const isValid = validateMove(state, from, to);
    // This should be valid if we have enough free cells/empty columns
    // With 4 free cells and 6 empty columns, max movable = (1 + 4) * 2^6 = 320
    expect(isValid).toBe(true);
  });

  test('should execute dragging cards from middle of column', () => {
    const state = createTestState([
      [card('9', '♠'), card('8', '♥'), card('7', '♠')], // Column 0
      [card('10', '♦')], // Column 1
      [],
      [],
      [],
      [],
      [],
      [],
    ]);

    const from: GameLocation = {
      type: 'tableau',
      index: 0,
      cardIndex: 0,
      cardCount: 3,
    };

    const to: GameLocation = {
      type: 'tableau',
      index: 1,
    };

    const newState = executeMove(state, from, to);

    expect(newState).not.toBeNull();
    expect(newState!.tableau[0]).toHaveLength(0); // Column 0 should be empty
    expect(newState!.tableau[1]).toHaveLength(4); // Column 1 should have 4 cards
    expect(newState!.tableau[1][0]).toEqual(card('10', '♦'));
    expect(newState!.tableau[1][1]).toEqual(card('9', '♠'));
    expect(newState!.tableau[1][2]).toEqual(card('8', '♥'));
    expect(newState!.tableau[1][3]).toEqual(card('7', '♠'));
  });

  test('should validate dragging only the bottom card from a column', () => {
    // Setup: Column 0 has [9♠, 8♥, 7♠], Column 1 has [8♦]
    // We want to drag only 7♠ onto 8♦
    const state = createTestState([
      [card('9', '♠'), card('8', '♥'), card('7', '♠')], // Column 0
      [card('8', '♦')], // Column 1
      [],
      [],
      [],
      [],
      [],
      [],
    ]);

    const from: GameLocation = {
      type: 'tableau',
      index: 0, // Column 0
      cardIndex: 2, // Bottom card (7♠)
      cardCount: 1, // Moving only 1 card
    };

    const to: GameLocation = {
      type: 'tableau',
      index: 1, // Column 1
    };

    const isValid = validateMove(state, from, to);
    expect(isValid).toBe(true);
  });
});

describe('Drag and Drop: Edge Cases', () => {
  test('should allow dragging any card to an empty column', () => {
    const state = createTestState([
      [card('7', '♥')], // Column 0
      [], // Column 1 (empty)
      [],
      [],
      [],
      [],
      [],
      [],
    ]);

    const from: GameLocation = {
      type: 'tableau',
      index: 0,
      cardIndex: 0,
      cardCount: 1,
    };

    const to: GameLocation = {
      type: 'tableau',
      index: 1, // Empty column
    };

    const isValid = validateMove(state, from, to);
    expect(isValid).toBe(true);
  });

  test('should execute dragging to an empty column', () => {
    const state = createTestState([
      [card('7', '♥')], // Column 0
      [], // Column 1 (empty)
      [],
      [],
      [],
      [],
      [],
      [],
    ]);

    const from: GameLocation = {
      type: 'tableau',
      index: 0,
      cardIndex: 0,
      cardCount: 1,
    };

    const to: GameLocation = {
      type: 'tableau',
      index: 1,
    };

    const newState = executeMove(state, from, to);

    expect(newState).not.toBeNull();
    expect(newState!.tableau[0]).toHaveLength(0);
    expect(newState!.tableau[1]).toHaveLength(1);
    expect(newState!.tableau[1][0]).toEqual(card('7', '♥'));
  });

  test('should reject dragging when not enough empty cells/columns for supermove', () => {
    // Setup: All free cells full, no empty columns
    // Trying to move 4 cards when we can only move (1 + 0) * 2^0 = 1
    const state: GameState = {
      seed: 1,
      tableau: [
        [card('Q', '♠'), card('J', '♥'), card('10', '♠'), card('9', '♥')], // Column 0
        [card('K', '♦')], // Column 1
        [card('5', '♠')],
        [card('6', '♥')],
        [card('7', '♠')],
        [card('8', '♥')],
        [card('2', '♠')],
        [card('3', '♥')],
      ],
      freeCells: [card('A', '♠'), card('A', '♥'), card('A', '♦'), card('A', '♣')], // All full
      foundations: [[], [], [], []],
      moves: 0,
    };

    const from: GameLocation = {
      type: 'tableau',
      index: 0,
      cardIndex: 0, // All 4 cards
      cardCount: 4,
    };

    const to: GameLocation = {
      type: 'tableau',
      index: 1,
    };

    const isValid = validateMove(state, from, to);
    expect(isValid).toBe(false); // Can't move 4 cards with no resources
  });
});

describe('Drag and Drop: Real-world Scenario', () => {
  test('should handle a typical mid-game move', () => {
    // More realistic game state
    const state = createTestState([
      [card('K', '♠'), card('Q', '♥'), card('J', '♠')], // Column 0
      [card('10', '♦'), card('9', '♣')], // Column 1
      [card('8', '♥')], // Column 2
      [], // Column 3 (empty)
      [card('7', '♠')],
      [card('6', '♥')],
      [card('5', '♠')],
      [card('4', '♥')],
    ]);

    // Drag 9♣ from column 1 onto 10♦... wait, they're in the same column
    // Let me fix this: Drag 9♣ from column 1 onto J♠ in column 0
    const from: GameLocation = {
      type: 'tableau',
      index: 1, // Column 1
      cardIndex: 1, // 9♣ (index 1)
      cardCount: 1,
    };

    const to: GameLocation = {
      type: 'tableau',
      index: 2, // Column 2 (onto 8♥)
    };

    // 9♣ (black) on 8♥ (red) - wrong rank (should be 7)
    const isValid = validateMove(state, from, to);
    expect(isValid).toBe(false);
  });

  test('should handle dragging the last card from a column onto another card', () => {
    const state = createTestState([
      [card('K', '♠'), card('Q', '♥'), card('J', '♠'), card('10', '♦')], // Column 0
      [card('9', '♣')], // Column 1
      [],
      [],
      [],
      [],
      [],
      [],
    ]);

    const from: GameLocation = {
      type: 'tableau',
      index: 1, // Column 1
      cardIndex: 0, // 9♣
      cardCount: 1,
    };

    const to: GameLocation = {
      type: 'tableau',
      index: 0, // Column 0 (onto 10♦)
    };

    // 9♣ (black) on 10♦ (red) - valid!
    const isValid = validateMove(state, from, to);
    expect(isValid).toBe(true);

    const newState = executeMove(state, from, to);
    expect(newState).not.toBeNull();
    expect(newState!.tableau[0]).toHaveLength(5);
    expect(newState!.tableau[0][4]).toEqual(card('9', '♣'));
    expect(newState!.tableau[1]).toHaveLength(0);
  });
});
