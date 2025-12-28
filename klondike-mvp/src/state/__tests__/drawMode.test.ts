/**
 * Tests for Draw Mode functionality (Draw-1 vs Draw-3)
 */

import { describe, it, expect } from 'vitest';
import { createInitialState } from '../gameState';
import { drawFromStock } from '../gameActions';
import type { KlondikeGameState } from '../gameState';

describe('Draw Mode', () => {
  describe('createInitialState', () => {
    it('should create game with draw1 mode by default', () => {
      const state = createInitialState(12345);
      expect(state.drawMode).toBe('draw1');
    });

    it('should create game with draw3 mode when specified', () => {
      const state = createInitialState(12345, 'draw3');
      expect(state.drawMode).toBe('draw3');
    });

    it('should have 24 cards in stock initially', () => {
      const state = createInitialState(12345);
      expect(state.stock.length).toBe(24);
      expect(state.waste.length).toBe(0);
    });
  });

  describe('drawFromStock - Draw-1 mode', () => {
    it('should draw exactly 1 card in draw1 mode', () => {
      const initialState = createInitialState(12345, 'draw1');
      const newState = drawFromStock(initialState);

      expect(newState.stock.length).toBe(23);
      expect(newState.waste.length).toBe(1);
    });

    it('should draw 1 card each time in draw1 mode', () => {
      let state = createInitialState(12345, 'draw1');

      state = drawFromStock(state);
      expect(state.stock.length).toBe(23);
      expect(state.waste.length).toBe(1);

      state = drawFromStock(state);
      expect(state.stock.length).toBe(22);
      expect(state.waste.length).toBe(2);

      state = drawFromStock(state);
      expect(state.stock.length).toBe(21);
      expect(state.waste.length).toBe(3);
    });
  });

  describe('drawFromStock - Draw-3 mode', () => {
    it('should draw exactly 3 cards in draw3 mode when stock has >= 3 cards', () => {
      const initialState = createInitialState(12345, 'draw3');
      const newState = drawFromStock(initialState);

      expect(newState.stock.length).toBe(21); // 24 - 3 = 21
      expect(newState.waste.length).toBe(3);
    });

    it('should draw 3 cards each time in draw3 mode', () => {
      let state = createInitialState(12345, 'draw3');

      // First draw: 3 cards
      state = drawFromStock(state);
      expect(state.stock.length).toBe(21);
      expect(state.waste.length).toBe(3);

      // Second draw: 3 cards
      state = drawFromStock(state);
      expect(state.stock.length).toBe(18);
      expect(state.waste.length).toBe(6);

      // Third draw: 3 cards
      state = drawFromStock(state);
      expect(state.stock.length).toBe(15);
      expect(state.waste.length).toBe(9);
    });

    it('should draw fewer than 3 cards when stock has < 3 cards remaining', () => {
      // Create a state with only 2 cards in stock
      const initialState = createInitialState(12345, 'draw3');
      const almostEmptyState: KlondikeGameState = {
        ...initialState,
        stock: initialState.stock.slice(0, 2), // Only 2 cards left
        waste: initialState.stock.slice(2), // Rest in waste
      };

      const newState = drawFromStock(almostEmptyState);

      expect(newState.stock.length).toBe(0); // All drawn
      expect(newState.waste.length).toBe(almostEmptyState.waste.length + 2); // Added 2 cards
    });

    it('should draw 1 card when only 1 card remains in stock', () => {
      const initialState = createInitialState(12345, 'draw3');
      const oneCardState: KlondikeGameState = {
        ...initialState,
        stock: [initialState.stock[0]], // Only 1 card
        waste: initialState.stock.slice(1), // Rest in waste
      };

      const newState = drawFromStock(oneCardState);

      expect(newState.stock.length).toBe(0);
      expect(newState.waste.length).toBe(oneCardState.waste.length + 1);
    });
  });

  describe('Recycling waste to stock', () => {
    it('should recycle waste to stock in draw1 mode when stock is empty', () => {
      const initialState = createInitialState(12345, 'draw1');

      // Move all cards from stock to waste
      let state = initialState;
      while (state.stock.length > 0) {
        state = drawFromStock(state);
      }

      expect(state.stock.length).toBe(0);
      expect(state.waste.length).toBe(24);

      // Now recycle
      const recycledState = drawFromStock(state);

      expect(recycledState.stock.length).toBe(23); // 24 reversed, then 1 drawn
      expect(recycledState.waste.length).toBe(1); // 1 card drawn from recycled stock
    });

    it('should recycle waste to stock in draw3 mode when stock is empty', () => {
      const initialState = createInitialState(12345, 'draw3');

      // Move all cards from stock to waste
      let state = initialState;
      while (state.stock.length > 0) {
        state = drawFromStock(state);
      }

      expect(state.stock.length).toBe(0);
      expect(state.waste.length).toBe(24);

      // Now recycle
      const recycledState = drawFromStock(state);

      expect(recycledState.stock.length).toBe(21); // 24 reversed, then 3 drawn
      expect(recycledState.waste.length).toBe(3); // 3 cards drawn from recycled stock
    });

    it('should reverse waste when recycling to stock', () => {
      const initialState = createInitialState(12345, 'draw1');

      // Draw 3 cards so we know the order
      let state = initialState;
      state = drawFromStock(state); // Card A
      state = drawFromStock(state); // Card B
      state = drawFromStock(state); // Card C

      // Empty the stock
      while (state.stock.length > 0) {
        state = drawFromStock(state);
      }

      // Recycle
      const recycled = drawFromStock(state);

      // The last card in waste should be at the bottom of stock (drawn last)
      // After recycling and drawing, the top of stock should be what was the first card in waste
      expect(recycled.stock.length).toBe(23);
      expect(recycled.waste[0].id).toBe(wasteCards[wasteCards.length - 1].id);
    });
  });

  describe('Move counter', () => {
    it('should increment moves when drawing in draw1 mode', () => {
      const state = createInitialState(12345, 'draw1');
      expect(state.moves).toBe(0);

      const drawn = drawFromStock(state);
      expect(drawn.moves).toBe(1);
    });

    it('should increment moves when drawing in draw3 mode', () => {
      const state = createInitialState(12345, 'draw3');
      expect(state.moves).toBe(0);

      const drawn = drawFromStock(state);
      expect(drawn.moves).toBe(1);
    });

    it('should increment moves when recycling waste', () => {
      let state = createInitialState(12345, 'draw1');

      // Empty stock
      while (state.stock.length > 0) {
        state = drawFromStock(state);
      }

      const movesBeforeRecycle = state.moves;
      const recycled = drawFromStock(state);

      expect(recycled.moves).toBe(movesBeforeRecycle + 1);
    });
  });

  describe('Edge cases', () => {
    it('should do nothing when both stock and waste are empty', () => {
      const emptyState: KlondikeGameState = {
        ...createInitialState(12345, 'draw1'),
        stock: [],
        waste: [],
      };

      const result = drawFromStock(emptyState);

      expect(result.stock.length).toBe(0);
      expect(result.waste.length).toBe(0);
      expect(result).toBe(emptyState); // Should return same state (no change)
    });

    it('should preserve drawMode after drawing', () => {
      const draw3State = createInitialState(12345, 'draw3');
      const afterDraw = drawFromStock(draw3State);

      expect(afterDraw.drawMode).toBe('draw3');
    });

    it('should preserve drawMode after recycling', () => {
      let state = createInitialState(12345, 'draw3');

      // Empty stock
      while (state.stock.length > 0) {
        state = drawFromStock(state);
      }

      // Recycle
      const recycled = drawFromStock(state);

      expect(recycled.drawMode).toBe('draw3');
    });
  });
});
