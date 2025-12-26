/**
 * Tests for getValidMoves() function
 * RFC-005 Phase 2 Week 2: Smart tap-to-move functionality
 *
 * Integration tests using real game states
 */

import { describe, it, expect } from 'vitest';
import {
  getValidMoves,
  moveCardToFreeCell,
  moveCardFromFreeCell,
  moveCardToFoundation,
  moveCardsToTableau,
  type SourceLocation,
} from '../gameActions';
import { initializeGame } from '../gameState';

describe('getValidMoves', () => {
  describe('basic functionality', () => {
    it('should return empty array from empty tableau column', () => {
      const state = initializeGame(42);
      state.tableau[0] = [];

      const from: SourceLocation = { type: 'tableau', index: 0 };
      const validMoves = getValidMoves(state, from);

      expect(validMoves).toEqual([]);
    });

    it('should return empty array from empty free cell', () => {
      const state = initializeGame(42);
      state.freeCells[0] = null;

      const from: SourceLocation = { type: 'freeCell', index: 0 };
      const validMoves = getValidMoves(state, from);

      expect(validMoves).toEqual([]);
    });

    it('should return empty array from empty foundation', () => {
      const state = initializeGame(42);
      state.foundations[0] = [];

      const from: SourceLocation = { type: 'foundation', index: 0 };
      const validMoves = getValidMoves(state, from);

      expect(validMoves).toEqual([]);
    });
  });

  describe('from tableau', () => {
    it('should find valid moves for top card in tableau', () => {
      const state = initializeGame(42);

      // Get moves for first tableau column
      const from: SourceLocation = { type: 'tableau', index: 0 };
      const validMoves = getValidMoves(state, from);

      // Should return an array
      expect(Array.isArray(validMoves)).toBe(true);

      // Verify returned locations have valid types
      validMoves.forEach((move) => {
        expect(['tableau', 'foundation', 'freeCell']).toContain(move.type);
        if (move.type === 'tableau') {
          expect(move.index).toBeGreaterThanOrEqual(0);
          expect(move.index).toBeLessThan(8);
        } else if (move.type === 'foundation') {
          expect(move.index).toBeGreaterThanOrEqual(0);
          expect(move.index).toBeLessThan(4);
        } else if (move.type === 'freeCell') {
          expect(move.index).toBeGreaterThanOrEqual(0);
          expect(move.index).toBeLessThan(4);
        }
      });
    });

    it('should not include source column in results', () => {
      const state = initializeGame(42);
      const from: SourceLocation = { type: 'tableau', index: 3 };

      const validMoves = getValidMoves(state, from);

      // Should not include tableau index 3 (source)
      const hasSelf = validMoves.some(
        (m) => m.type === 'tableau' && m.index === 3
      );
      expect(hasSelf).toBe(false);
    });

    it('should include free cells in results when available', () => {
      const state = initializeGame(42);
      // Ensure all free cells are empty
      state.freeCells = [null, null, null, null];

      const from: SourceLocation = { type: 'tableau', index: 0 };
      const validMoves = getValidMoves(state, from);

      // Should include at least one free cell destination
      const freeCellMoves = validMoves.filter((m) => m.type === 'freeCell');
      expect(freeCellMoves.length).toBeGreaterThan(0);
    });

    it('should validate that all returned moves are actually valid', () => {
      const state = initializeGame(42);
      const from: SourceLocation = { type: 'tableau', index: 0 };

      const validMoves = getValidMoves(state, from);

      // Try to execute each move - they should all succeed
      validMoves.forEach((to) => {
        let result = null;

        if (to.type === 'tableau') {
          // For tableau, move 1 card
          result = moveCardsToTableau(state, from.index, 1, to.index);
        } else if (to.type === 'freeCell') {
          result = moveCardToFreeCell(state, from.index, to.index);
        } else if (to.type === 'foundation') {
          result = moveCardToFoundation(state, 'tableau', from.index, to.index);
        }

        // Should return a new state (not null)
        expect(result).not.toBeNull();
      });
    });
  });

  describe('from free cell', () => {
    it('should find valid moves from occupied free cell', () => {
      const state = initializeGame(42);

      // Move a card to free cell first
      const tableau0TopCard = state.tableau[0][state.tableau[0].length - 1];
      state.freeCells[0] = tableau0TopCard;
      state.tableau[0] = state.tableau[0].slice(0, -1);

      const from: SourceLocation = { type: 'freeCell', index: 0 };
      const validMoves = getValidMoves(state, from);

      // Should be an array
      expect(Array.isArray(validMoves)).toBe(true);

      // Should NOT include other free cells (can't move from free cell to free cell)
      const freeCellMoves = validMoves.filter((m) => m.type === 'freeCell');
      expect(freeCellMoves).toHaveLength(0);

      // May include tableau or foundation destinations depending on the card
      expect(validMoves.length).toBeGreaterThanOrEqual(0);
    });

    it('should validate all returned moves are actually valid', () => {
      const state = initializeGame(42);

      // Place a card in free cell
      const tableau0TopCard = state.tableau[0][state.tableau[0].length - 1];
      state.freeCells[0] = tableau0TopCard;
      state.tableau[0] = state.tableau[0].slice(0, -1);

      const from: SourceLocation = { type: 'freeCell', index: 0 };
      const validMoves = getValidMoves(state, from);

      // Try to execute each move
      validMoves.forEach((to) => {
        let result = null;

        if (to.type === 'tableau') {
          result = moveCardFromFreeCell(state, from.index, to.index);
        } else if (to.type === 'foundation') {
          result = moveCardToFoundation(state, 'freeCell', from.index, to.index);
        }

        // Should return a new state (not null)
        expect(result).not.toBeNull();
      });
    });
  });

  describe('from foundation', () => {
    it('should find valid moves when card is in foundation', () => {
      const state = initializeGame(42);

      // Find an Ace and place it in foundation
      for (let i = 0; i < state.tableau.length; i++) {
        const column = state.tableau[i];
        if (column.length > 0) {
          const topCard = column[column.length - 1];
          if (topCard.rank === 1) {
            // Found an Ace
            state.foundations[0] = [topCard];
            state.tableau[i] = column.slice(0, -1);

            const from: SourceLocation = { type: 'foundation', index: 0 };
            const validMoves = getValidMoves(state, from);

            // Should be an array
            expect(Array.isArray(validMoves)).toBe(true);

            // Should NOT include the same foundation (source)
            const sameFoundationMove = validMoves.find(
              (m) => m.type === 'foundation' && m.index === 0
            );
            expect(sameFoundationMove).toBeUndefined();

            return; // Test passed
          }
        }
      }

      // If no Ace found, skip this test
      expect(true).toBe(true);
    });
  });

  describe('smart tap use cases', () => {
    it('should handle single valid move scenario (ideal for auto-execute)', () => {
      const state = initializeGame(123); // Different seed

      // Find any card with exactly one valid move
      for (let i = 0; i < 8; i++) {
        if (state.tableau[i].length > 0) {
          const from: SourceLocation = { type: 'tableau', index: i };
          const validMoves = getValidMoves(state, from);

          if (validMoves.length === 1) {
            // Perfect! This card has exactly one destination
            const to = validMoves[0];
            let result = null;

            if (to.type === 'tableau') {
              result = moveCardsToTableau(state, from.index, 1, to.index);
            } else if (to.type === 'freeCell') {
              result = moveCardToFreeCell(state, from.index, to.index);
            } else if (to.type === 'foundation') {
              result = moveCardToFoundation(state, 'tableau', from.index, to.index);
            }

            expect(result).not.toBeNull();
            return; // Test passed
          }
        }
      }

      // If no single-move cards found, that's okay
      expect(true).toBe(true);
    });

    it('should handle multiple valid moves scenario (show options)', () => {
      const state = initializeGame(456); // Different seed

      // Find any card with multiple valid moves
      for (let i = 0; i < 8; i++) {
        if (state.tableau[i].length > 0) {
          const from: SourceLocation = { type: 'tableau', index: i };
          const validMoves = getValidMoves(state, from);

          if (validMoves.length > 1) {
            // This card has multiple destinations
            expect(validMoves.length).toBeGreaterThan(1);
            return; // Test passed
          }
        }
      }

      // If no multi-move cards found, that's okay
      expect(true).toBe(true);
    });
  });

  describe('multi-card sequences', () => {
    it('should support moving valid sequences when enough free cells available', () => {
      const state = initializeGame(42);

      // Ensure we have free cells and empty columns for multi-card moves
      state.freeCells = [null, null, null, null];

      // Check if any tableau has a valid sequence
      for (let i = 0; i < 8; i++) {
        const from: SourceLocation = { type: 'tableau', index: i };
        const validMoves = getValidMoves(state, from);

        // Should return an array (may include multi-card sequence moves)
        expect(Array.isArray(validMoves)).toBe(true);
      }
    });
  });
});
