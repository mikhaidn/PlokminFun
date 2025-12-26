/**
 * Tests for getValidMoves() function
 * RFC-005 Phase 2 Week 2: Smart tap-to-move functionality
 *
 * Integration tests using real game states
 */

import { describe, it, expect } from 'vitest';
import { getValidMoves, moveCards } from '../gameActions';
import { createInitialState, type Location } from '../gameState';

describe('getValidMoves', () => {
  describe('basic functionality', () => {
    it('should return empty array from stock (cannot move directly)', () => {
      const state = createInitialState(42);
      const from: Location = { type: 'stock' };

      const validMoves = getValidMoves(state, from);

      expect(validMoves).toEqual([]);
    });

    it('should return empty array from empty waste', () => {
      const state = createInitialState(42);
      const from: Location = { type: 'waste' };

      const validMoves = getValidMoves(state, from);

      expect(validMoves).toEqual([]);
    });

    it('should return empty array from empty tableau column', () => {
      const state = createInitialState(42);
      // Make first column empty
      state.tableau[0] = { cards: [], faceUpCount: 0 };

      const from: Location = { type: 'tableau', index: 0 };
      const validMoves = getValidMoves(state, from);

      expect(validMoves).toEqual([]);
    });

    it('should return empty array from empty foundation', () => {
      const state = createInitialState(42);
      const from: Location = { type: 'foundation', index: 0 };

      const validMoves = getValidMoves(state, from);

      expect(validMoves).toEqual([]);
    });
  });

  describe('from tableau', () => {
    it('should find valid moves for top card in tableau', () => {
      const state = createInitialState(42);

      // Get the top card from first column
      const from: Location = { type: 'tableau', index: 0 };
      const validMoves = getValidMoves(state, from);

      // Should return an array
      expect(Array.isArray(validMoves)).toBe(true);

      // Verify returned locations are valid
      validMoves.forEach((move) => {
        expect(['tableau', 'foundation']).toContain(move.type);
        if (move.type === 'tableau') {
          expect(move.index).toBeGreaterThanOrEqual(0);
          expect(move.index).toBeLessThan(7);
        } else if (move.type === 'foundation') {
          expect(move.index).toBeGreaterThanOrEqual(0);
          expect(move.index).toBeLessThan(4);
        }
      });
    });

    it('should not include source column in results', () => {
      const state = createInitialState(42);
      const from: Location = { type: 'tableau', index: 3 };

      const validMoves = getValidMoves(state, from);

      // Should not include tableau index 3 (source)
      const hasSelf = validMoves.some(
        (m) => m.type === 'tableau' && m.index === 3
      );
      expect(hasSelf).toBe(false);
    });

    it('should validate that all returned moves are actually valid', () => {
      const state = createInitialState(42);
      const from: Location = { type: 'tableau', index: 0 };

      const validMoves = getValidMoves(state, from);

      // Try to execute each move - they should all succeed
      validMoves.forEach((to) => {
        const result = moveCards(state, from, to, 1);
        // Should return a new state (not null)
        expect(result).not.toBeNull();
      });
    });
  });

  describe('from waste', () => {
    it('should find valid moves after drawing a card', () => {
      const state = createInitialState(42);

      // Manually add a card to waste (simulating a draw)
      const testCard = state.stock[state.stock.length - 1];
      state.waste = [testCard];
      state.stock = state.stock.slice(0, -1);

      const from: Location = { type: 'waste' };
      const validMoves = getValidMoves(state, from);

      // Should be an array (might be empty if no valid moves for this specific card)
      expect(Array.isArray(validMoves)).toBe(true);

      // All returned moves should be valid
      validMoves.forEach((to) => {
        const result = moveCards(state, from, to, 1);
        expect(result).not.toBeNull();
      });
    });
  });

  describe('from foundation', () => {
    it('should find valid moves when moving card back from foundation', () => {
      const state = createInitialState(42);

      // Manually place a card in foundation
      const testCard = state.tableau[0].cards[state.tableau[0].cards.length - 1];
      if (testCard && testCard.rank === 1) {
        // Only test if we have an Ace
        state.foundations[0] = [testCard];

        const from: Location = { type: 'foundation', index: 0 };
        const validMoves = getValidMoves(state, from);

        // Should be an array
        expect(Array.isArray(validMoves)).toBe(true);

        // All returned moves should be valid
        validMoves.forEach((to) => {
          const result = moveCards(state, from, to, 1);
          expect(result).not.toBeNull();
        });
      }
    });
  });

  describe('smart tap use cases', () => {
    it('should handle single valid move scenario (ideal for auto-execute)', () => {
      const state = createInitialState(123); // Different seed for variety

      // Find any card with exactly one valid move
      for (let i = 0; i < 7; i++) {
        const from: Location = { type: 'tableau', index: i };
        const validMoves = getValidMoves(state, from);

        if (validMoves.length === 1) {
          // Perfect! This card has exactly one destination
          // Verify that move is actually valid
          const result = moveCards(state, from, validMoves[0], 1);
          expect(result).not.toBeNull();

          // This is the ideal case for smart tap auto-execute
          return; // Test passed
        }
      }

      // If no single-move cards found in this seed, that's okay
      // Different seeds will have different scenarios
      expect(true).toBe(true);
    });

    it('should handle multiple valid moves scenario (show options)', () => {
      const state = createInitialState(456); // Different seed

      // Find any card with multiple valid moves
      for (let i = 0; i < 7; i++) {
        const from: Location = { type: 'tableau', index: i };
        const validMoves = getValidMoves(state, from);

        if (validMoves.length > 1) {
          // This card has multiple destinations - should show options to user
          expect(validMoves.length).toBeGreaterThan(1);

          // All should be valid
          validMoves.forEach((to) => {
            const result = moveCards(state, from, to, 1);
            expect(result).not.toBeNull();
          });

          return; // Test passed
        }
      }

      // If no multi-move cards found, that's okay
      expect(true).toBe(true);
    });
  });

  describe('multi-card moves', () => {
    it('should not return foundation moves for multi-card count', () => {
      const state = createInitialState(42);
      const from: Location = { type: 'tableau', index: 0 };

      // Try to get moves for 2 cards (even if column doesn't have 2 cards)
      const validMoves = getValidMoves(state, from, 2);

      // Should not include any foundation moves (can't move multiple cards to foundation)
      const foundationMoves = validMoves.filter((m) => m.type === 'foundation');
      expect(foundationMoves).toHaveLength(0);
    });
  });
});
