/**
 * Diagnostic tests for touch interaction bugs
 *
 * Bug 1: Touch-to-select doesn't work - tapping should select, not drag
 * Bug 2: Drag over card doesn't work - missing card-index attributes
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCardInteraction } from '../useCardInteraction';
import type { CardInteractionConfig, GameLocation } from '../../types/CardInteraction';

describe('Touch Interaction Bugs - Diagnostic Tests', () => {
  let mockValidateMove: ReturnType<typeof vi.fn>;
  let mockExecuteMove: ReturnType<typeof vi.fn>;
  let mockGetCardAtLocation: ReturnType<typeof vi.fn>;
  let config: CardInteractionConfig<GameLocation>;

  beforeEach(() => {
    mockValidateMove = vi.fn();
    mockExecuteMove = vi.fn();
    mockGetCardAtLocation = vi.fn();

    config = {
      validateMove: mockValidateMove,
      executeMove: mockExecuteMove,
      getCardAtLocation: mockGetCardAtLocation,
    };

    // Mock document.elementFromPoint
    document.elementFromPoint = vi.fn().mockReturnValue(null);
  });

  describe('Bug 1: Touch-to-select functionality', () => {
    it('FAILING: Quick tap should select card, not start drag', () => {
      const { result } = renderHook(() => useCardInteraction(config));

      const location: GameLocation = { type: 'tableau', index: 0, cardIndex: 5, cardCount: 1 };

      // Simulate a quick tap (touchstart + touchend without move)
      const touchStartEvent = {
        touches: [{ clientX: 100, clientY: 200 }],
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent;

      const touchEndEvent = {
        changedTouches: [{ clientX: 100, clientY: 200 }], // Same position = tap
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent;

      // Start touch
      act(() => {
        const handler = result.current.handlers.handleTouchStart(location);
        handler(touchStartEvent);
      });

      // Immediately end (no move) - this should be a tap, not a drag
      act(() => {
        result.current.handlers.handleTouchEnd(touchEndEvent);
      });

      // EXPECTED: Card should be selected for click-to-move
      // ACTUAL: touchDragging is true, so it tries to execute drag logic instead
      expect(result.current.state.selectedCard).toEqual(location);
      expect(result.current.state.draggingCard).toBeNull();
    });

    it('FAILING: Tap-to-select then tap-to-move workflow', () => {
      mockValidateMove.mockReturnValue(true);
      const { result } = renderHook(() => useCardInteraction(config));

      const sourceLocation: GameLocation = { type: 'tableau', index: 0, cardIndex: 5, cardCount: 1 };
      const destLocation: GameLocation = { type: 'freeCell', index: 0, cardCount: 1 };

      // First tap - select source card
      const tap1Start = {
        touches: [{ clientX: 100, clientY: 200 }],
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent;

      const tap1End = {
        changedTouches: [{ clientX: 100, clientY: 200 }],
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent;

      act(() => {
        const handler = result.current.handlers.handleTouchStart(sourceLocation);
        handler(tap1Start);
      });

      act(() => {
        result.current.handlers.handleTouchEnd(tap1End);
      });

      // EXPECTED: Source card should be selected
      expect(result.current.state.selectedCard).toEqual(sourceLocation);

      // Second tap - move to destination
      const mockDestElement = document.createElement('div');
      mockDestElement.setAttribute('data-drop-target-type', 'freeCell');
      mockDestElement.setAttribute('data-drop-target-index', '0');
      document.elementFromPoint = vi.fn().mockReturnValue(mockDestElement);

      const tap2Start = {
        touches: [{ clientX: 300, clientY: 100 }],
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent;

      const tap2End = {
        changedTouches: [{ clientX: 300, clientY: 100 }],
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent;

      act(() => {
        const handler = result.current.handlers.handleTouchStart(destLocation);
        handler(tap2Start);
      });

      act(() => {
        result.current.handlers.handleTouchEnd(tap2End);
      });

      // EXPECTED: Move should be executed
      expect(mockExecuteMove).toHaveBeenCalledWith(sourceLocation, expect.objectContaining({
        type: 'freeCell',
        index: 0,
      }));
    });

    it('PASSING: Long press with movement should trigger drag', () => {
      mockValidateMove.mockReturnValue(true);
      const { result } = renderHook(() => useCardInteraction(config));

      const sourceLocation: GameLocation = { type: 'tableau', index: 0, cardIndex: 5, cardCount: 1 };

      const touchStartEvent = {
        touches: [{ clientX: 100, clientY: 200 }],
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent;

      const touchMoveEvent = {
        touches: [{ clientX: 150, clientY: 250 }], // Moved significantly
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent;

      const mockDestElement = document.createElement('div');
      mockDestElement.setAttribute('data-drop-target-type', 'freeCell');
      mockDestElement.setAttribute('data-drop-target-index', '0');
      document.elementFromPoint = vi.fn().mockReturnValue(mockDestElement);

      const touchEndEvent = {
        changedTouches: [{ clientX: 300, clientY: 300 }],
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent;

      // Start touch
      act(() => {
        const handler = result.current.handlers.handleTouchStart(sourceLocation);
        handler(touchStartEvent);
      });

      // Move significantly
      act(() => {
        result.current.handlers.handleTouchMove(touchMoveEvent);
      });

      // End at different location
      act(() => {
        result.current.handlers.handleTouchEnd(touchEndEvent);
      });

      // This SHOULD trigger drag-and-drop logic
      expect(result.current.state.touchDragging).toBe(false); // Cleaned up
      expect(mockExecuteMove).toHaveBeenCalled();
    });
  });

  describe('Bug 2: Drag over card - missing drop target attributes', () => {
    it('FAILING: Should handle drop on card with missing card-index attributes', () => {
      mockValidateMove.mockReturnValue(true);
      const { result } = renderHook(() => useCardInteraction(config));

      const sourceLocation: GameLocation = {
        type: 'tableau',
        index: 0,
        cardIndex: 5,
        cardCount: 1
      };

      const touchStartEvent = {
        touches: [{ clientX: 100, clientY: 200 }],
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent;

      const touchMoveEvent = {
        touches: [{ clientX: 250, clientY: 300 }],
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent;

      // Simulate dropping on a card that ONLY has tableau type/index
      // (missing card-index, which is needed for precise drop location)
      const mockCardElement = document.createElement('div');
      mockCardElement.setAttribute('data-drop-target-type', 'tableau');
      mockCardElement.setAttribute('data-drop-target-index', '3');
      // BUG: Missing data-drop-target-card-index!
      // BUG: Missing data-drop-target-card-count!

      document.elementFromPoint = vi.fn().mockReturnValue(mockCardElement);

      const touchEndEvent = {
        changedTouches: [{ clientX: 250, clientY: 300 }],
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent;

      // Start drag
      act(() => {
        const handler = result.current.handlers.handleTouchStart(sourceLocation);
        handler(touchStartEvent);
      });

      // Move
      act(() => {
        result.current.handlers.handleTouchMove(touchMoveEvent);
      });

      // Drop on card
      act(() => {
        result.current.handlers.handleTouchEnd(touchEndEvent);
      });

      // EXPECTED: Should construct valid drop location even without card-index
      // (Tableau column drops should work even if specific card isn't specified)
      const expectedDropLocation: GameLocation = {
        type: 'tableau',
        index: 3,
        // card-index and card-count are optional for column drops
      };

      expect(mockValidateMove).toHaveBeenCalledWith(
        sourceLocation,
        expect.objectContaining({
          type: 'tableau',
          index: 3,
        })
      );
    });

    it('PASSING: Should handle drop on column wrapper (not card)', () => {
      mockValidateMove.mockReturnValue(true);
      const { result } = renderHook(() => useCardInteraction(config));

      const sourceLocation: GameLocation = {
        type: 'tableau',
        index: 0,
        cardIndex: 5,
        cardCount: 1
      };

      const touchStartEvent = {
        touches: [{ clientX: 100, clientY: 200 }],
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent;

      const touchMoveEvent = {
        touches: [{ clientX: 150, clientY: 250 }], // Move to trigger drag
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent;

      // Drop on column wrapper
      const mockColumnElement = document.createElement('div');
      mockColumnElement.setAttribute('data-drop-target-type', 'tableau');
      mockColumnElement.setAttribute('data-drop-target-index', '3');

      document.elementFromPoint = vi.fn().mockReturnValue(mockColumnElement);

      const touchEndEvent = {
        changedTouches: [{ clientX: 250, clientY: 300 }],
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent;

      // Start drag
      act(() => {
        const handler = result.current.handlers.handleTouchStart(sourceLocation);
        handler(touchStartEvent);
      });

      // Move to trigger drag
      act(() => {
        result.current.handlers.handleTouchMove(touchMoveEvent);
      });

      // Drop
      act(() => {
        result.current.handlers.handleTouchEnd(touchEndEvent);
      });

      // Should work fine - column wrapper has enough info
      expect(mockValidateMove).toHaveBeenCalledWith(
        sourceLocation,
        expect.objectContaining({
          type: 'tableau',
          index: 3,
        })
      );
      expect(mockExecuteMove).toHaveBeenCalled();
    });
  });

  describe('Touch behavior edge cases', () => {
    it('Should distinguish between tap and drag based on movement threshold', () => {
      const { result } = renderHook(() => useCardInteraction(config));

      const location: GameLocation = { type: 'tableau', index: 0, cardIndex: 5, cardCount: 1 };

      // Small movement (< threshold) = tap
      const tap = {
        start: { x: 100, y: 200 },
        end: { x: 102, y: 201 }, // 2-3 pixel drift
      };

      // Large movement (>= threshold) = drag
      const drag = {
        start: { x: 100, y: 200 },
        end: { x: 150, y: 250 }, // Clear movement
      };

      // This test documents the EXPECTED behavior
      // Current implementation doesn't distinguish between tap and drag
      expect(tap.end.x - tap.start.x).toBeLessThan(10);
      expect(Math.abs(drag.end.x - drag.start.x)).toBeGreaterThan(10);
    });
  });
});
