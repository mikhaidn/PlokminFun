/**
 * Comprehensive tests for useCardInteraction hook
 * Testing: click-to-select, drag-and-drop, touch interactions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCardInteraction } from '../useCardInteraction';
import type { CardInteractionConfig, CardLocation } from '../../types/CardInteraction';

// Test location type (generic for testing)
interface TestLocation extends CardLocation {
  type: 'pile' | 'target';
  index: number;
}

// Mock card data
const mockCard = { suit: '♥', value: '7', rank: 7, id: '7♥' };

describe('useCardInteraction', () => {
  let mockValidateMove: ReturnType<typeof vi.fn>;
  let mockExecuteMove: ReturnType<typeof vi.fn>;
  let mockGetCardAtLocation: ReturnType<typeof vi.fn>;
  let config: CardInteractionConfig<TestLocation>;

  beforeEach(() => {
    mockValidateMove = vi.fn();
    mockExecuteMove = vi.fn();
    mockGetCardAtLocation = vi.fn();

    config = {
      validateMove: mockValidateMove,
      executeMove: mockExecuteMove,
      getCardAtLocation: mockGetCardAtLocation,
    };
  });

  describe('click-to-select', () => {
    it('should select a card on first click', () => {
      const { result } = renderHook(() => useCardInteraction(config));

      const location: TestLocation = { type: 'pile', index: 0 };

      act(() => {
        result.current.handlers.handleCardClick(location);
      });

      expect(result.current.state.selectedCard).toEqual(location);
    });

    it('should deselect card if clicking the same card', () => {
      const { result } = renderHook(() => useCardInteraction(config));

      const location: TestLocation = { type: 'pile', index: 0 };

      // First click - select
      act(() => {
        result.current.handlers.handleCardClick(location);
      });

      expect(result.current.state.selectedCard).toEqual(location);

      // Second click - deselect
      act(() => {
        result.current.handlers.handleCardClick(location);
      });

      expect(result.current.state.selectedCard).toBeNull();
    });

    it('should move card if clicking valid destination', () => {
      mockValidateMove.mockReturnValue(true);

      const { result } = renderHook(() => useCardInteraction(config));

      const from: TestLocation = { type: 'pile', index: 0 };
      const to: TestLocation = { type: 'target', index: 1 };

      // Select source card
      act(() => {
        result.current.handlers.handleCardClick(from);
      });

      expect(result.current.state.selectedCard).toEqual(from);

      // Click destination
      act(() => {
        result.current.handlers.handleCardClick(to);
      });

      expect(mockValidateMove).toHaveBeenCalledWith(from, to);
      expect(mockExecuteMove).toHaveBeenCalledWith(from, to);
      expect(result.current.state.selectedCard).toBeNull();
    });

    it('should not move if destination is invalid', () => {
      mockValidateMove.mockReturnValue(false);

      const { result } = renderHook(() => useCardInteraction(config));

      const from: TestLocation = { type: 'pile', index: 0 };
      const to: TestLocation = { type: 'target', index: 1 };

      // Select source card
      act(() => {
        result.current.handlers.handleCardClick(from);
      });

      // Click invalid destination
      act(() => {
        result.current.handlers.handleCardClick(to);
      });

      expect(mockValidateMove).toHaveBeenCalledWith(from, to);
      expect(mockExecuteMove).not.toHaveBeenCalled();
      expect(result.current.state.selectedCard).toEqual(from); // Still selected
    });

    it('should clear selection after successful move', () => {
      mockValidateMove.mockReturnValue(true);

      const { result } = renderHook(() => useCardInteraction(config));

      const from: TestLocation = { type: 'pile', index: 0 };
      const to: TestLocation = { type: 'target', index: 1 };

      // Select source card
      act(() => {
        result.current.handlers.handleCardClick(from);
      });

      expect(result.current.state.selectedCard).toEqual(from);

      // Move to destination
      act(() => {
        result.current.handlers.handleCardClick(to);
      });

      expect(result.current.state.selectedCard).toBeNull();
    });

    it('should switch selection when clicking different source card', () => {
      const { result } = renderHook(() => useCardInteraction(config));

      const location1: TestLocation = { type: 'pile', index: 0 };
      const location2: TestLocation = { type: 'pile', index: 1 };

      // Select first card
      act(() => {
        result.current.handlers.handleCardClick(location1);
      });

      expect(result.current.state.selectedCard).toEqual(location1);

      // Select second card (not a move, just change selection)
      mockValidateMove.mockReturnValue(false);

      act(() => {
        result.current.handlers.handleCardClick(location2);
      });

      expect(result.current.state.selectedCard).toEqual(location2);
    });
  });

  describe('drag-and-drop', () => {
    it('should set dragging state on drag start', () => {
      const { result } = renderHook(() => useCardInteraction(config));

      const location: TestLocation = { type: 'pile', index: 0 };
      const mockEvent = {
        dataTransfer: { effectAllowed: '', setData: vi.fn() },
        preventDefault: vi.fn(),
      } as unknown as React.DragEvent;

      act(() => {
        const handler = result.current.handlers.handleDragStart(location);
        handler(mockEvent);
      });

      expect(result.current.state.draggingCard).toEqual(location);
      expect(mockEvent.dataTransfer.effectAllowed).toBe('move');
    });

    it('should clear dragging state on drag end', () => {
      const { result } = renderHook(() => useCardInteraction(config));

      const location: TestLocation = { type: 'pile', index: 0 };
      const mockEvent = {
        dataTransfer: { effectAllowed: '', setData: vi.fn() },
        preventDefault: vi.fn(),
      } as unknown as React.DragEvent;

      // Start drag
      act(() => {
        const handler = result.current.handlers.handleDragStart(location);
        handler(mockEvent);
      });

      expect(result.current.state.draggingCard).toEqual(location);

      // End drag
      act(() => {
        result.current.handlers.handleDragEnd();
      });

      expect(result.current.state.draggingCard).toBeNull();
    });

    it('should execute move on valid drop', () => {
      mockValidateMove.mockReturnValue(true);

      const { result } = renderHook(() => useCardInteraction(config));

      const from: TestLocation = { type: 'pile', index: 0 };
      const to: TestLocation = { type: 'target', index: 1 };

      const dragStartEvent = {
        dataTransfer: { effectAllowed: '', setData: vi.fn() },
        preventDefault: vi.fn(),
      } as unknown as React.DragEvent;

      const dropEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.DragEvent;

      // Start drag
      act(() => {
        const handler = result.current.handlers.handleDragStart(from);
        handler(dragStartEvent);
      });

      // Drop
      act(() => {
        const handler = result.current.handlers.handleDrop(to);
        handler(dropEvent);
      });

      expect(mockValidateMove).toHaveBeenCalledWith(from, to);
      expect(mockExecuteMove).toHaveBeenCalledWith(from, to);
      expect(dropEvent.preventDefault).toHaveBeenCalled();
      expect(result.current.state.draggingCard).toBeNull();
    });

    it('should not execute move on invalid drop', () => {
      mockValidateMove.mockReturnValue(false);

      const { result } = renderHook(() => useCardInteraction(config));

      const from: TestLocation = { type: 'pile', index: 0 };
      const to: TestLocation = { type: 'target', index: 1 };

      const dragStartEvent = {
        dataTransfer: { effectAllowed: '', setData: vi.fn() },
        preventDefault: vi.fn(),
      } as unknown as React.DragEvent;

      const dropEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.DragEvent;

      // Start drag
      act(() => {
        const handler = result.current.handlers.handleDragStart(from);
        handler(dragStartEvent);
      });

      // Drop at invalid location
      act(() => {
        const handler = result.current.handlers.handleDrop(to);
        handler(dropEvent);
      });

      expect(mockValidateMove).toHaveBeenCalledWith(from, to);
      expect(mockExecuteMove).not.toHaveBeenCalled();
      expect(result.current.state.draggingCard).toBeNull(); // Still clears drag state
    });

    it('should prevent default on drag over', () => {
      const { result } = renderHook(() => useCardInteraction(config));

      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.DragEvent;

      act(() => {
        result.current.handlers.handleDragOver(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should not drop if no dragging card', () => {
      const { result } = renderHook(() => useCardInteraction(config));

      const to: TestLocation = { type: 'target', index: 1 };
      const dropEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.DragEvent;

      act(() => {
        const handler = result.current.handlers.handleDrop(to);
        handler(dropEvent);
      });

      expect(mockValidateMove).not.toHaveBeenCalled();
      expect(mockExecuteMove).not.toHaveBeenCalled();
    });
  });

  describe('touch interactions', () => {
    it('should start touch drag on touch start + move', () => {
      const { result } = renderHook(() => useCardInteraction(config));

      const location: TestLocation = { type: 'pile', index: 0 };
      const touchStartEvent = {
        touches: [{ clientX: 100, clientY: 200 }],
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent;

      const touchMoveEvent = {
        touches: [{ clientX: 150, clientY: 250 }], // Move more than threshold
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent;

      // Start touch
      act(() => {
        const handler = result.current.handlers.handleTouchStart(location);
        handler(touchStartEvent);
      });

      // Initially not dragging yet
      expect(result.current.state.draggingCard).toBeNull();
      expect(result.current.state.touchDragging).toBe(false);

      // Move to trigger drag
      act(() => {
        result.current.handlers.handleTouchMove(touchMoveEvent);
      });

      // Now dragging
      expect(result.current.state.draggingCard).toEqual(location);
      expect(result.current.state.touchDragging).toBe(true);
      expect(result.current.state.touchPosition).toEqual({ x: 150, y: 250 });
    });

    it('should update touch position on touch move', () => {
      const { result } = renderHook(() => useCardInteraction(config));

      const location: TestLocation = { type: 'pile', index: 0 };
      const touchStartEvent = {
        touches: [{ clientX: 100, clientY: 200 }],
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent;

      const touchMoveEvent = {
        touches: [{ clientX: 150, clientY: 250 }],
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent;

      // Start touch drag
      act(() => {
        const handler = result.current.handlers.handleTouchStart(location);
        handler(touchStartEvent);
      });

      // Move
      act(() => {
        result.current.handlers.handleTouchMove(touchMoveEvent);
      });

      expect(result.current.state.touchPosition).toEqual({ x: 150, y: 250 });
      expect(touchMoveEvent.preventDefault).toHaveBeenCalled();
    });

    it('should execute move on touch end at valid target', () => {
      mockValidateMove.mockReturnValue(true);

      // Mock document.elementFromPoint
      const mockElement = document.createElement('div');
      mockElement.setAttribute('data-drop-target-type', 'target');
      mockElement.setAttribute('data-drop-target-index', '1');
      document.elementFromPoint = vi.fn().mockReturnValue(mockElement);

      const { result } = renderHook(() => useCardInteraction(config));

      const from: TestLocation = { type: 'pile', index: 0 };
      const touchStartEvent = {
        touches: [{ clientX: 100, clientY: 200 }],
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent;

      const touchMoveEvent = {
        touches: [{ clientX: 130, clientY: 230 }], // Move to trigger drag
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent;

      const touchEndEvent = {
        changedTouches: [{ clientX: 150, clientY: 250 }],
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent;

      // Start touch drag
      act(() => {
        const handler = result.current.handlers.handleTouchStart(from);
        handler(touchStartEvent);
      });

      // Move to trigger drag
      act(() => {
        result.current.handlers.handleTouchMove(touchMoveEvent);
      });

      // End touch at target
      act(() => {
        result.current.handlers.handleTouchEnd(touchEndEvent);
      });

      const expectedTo: TestLocation = { type: 'target', index: 1 };
      expect(mockValidateMove).toHaveBeenCalledWith(from, expectedTo);
      expect(mockExecuteMove).toHaveBeenCalledWith(from, expectedTo);
      expect(result.current.state.touchDragging).toBe(false);
      expect(result.current.state.draggingCard).toBeNull();
      expect(result.current.state.touchPosition).toBeNull();
    });

    it('should not move if touch ends at invalid target', () => {
      mockValidateMove.mockReturnValue(false);

      const mockElement = document.createElement('div');
      mockElement.setAttribute('data-drop-target-type', 'target');
      mockElement.setAttribute('data-drop-target-index', '1');
      document.elementFromPoint = vi.fn().mockReturnValue(mockElement);

      const { result } = renderHook(() => useCardInteraction(config));

      const from: TestLocation = { type: 'pile', index: 0 };
      const touchStartEvent = {
        touches: [{ clientX: 100, clientY: 200 }],
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent;

      const touchMoveEvent = {
        touches: [{ clientX: 130, clientY: 230 }], // Move to trigger drag
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent;

      const touchEndEvent = {
        changedTouches: [{ clientX: 150, clientY: 250 }],
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent;

      // Start touch drag
      act(() => {
        const handler = result.current.handlers.handleTouchStart(from);
        handler(touchStartEvent);
      });

      // Move to trigger drag
      act(() => {
        result.current.handlers.handleTouchMove(touchMoveEvent);
      });

      // End touch at invalid target
      act(() => {
        result.current.handlers.handleTouchEnd(touchEndEvent);
      });

      expect(mockValidateMove).toHaveBeenCalled();
      expect(mockExecuteMove).not.toHaveBeenCalled();
      expect(result.current.state.touchDragging).toBe(false);
    });

    it('should cancel touch drag on touch cancel', () => {
      const { result } = renderHook(() => useCardInteraction(config));

      const location: TestLocation = { type: 'pile', index: 0 };
      const touchStartEvent = {
        touches: [{ clientX: 100, clientY: 200 }],
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent;

      const touchMoveEvent = {
        touches: [{ clientX: 150, clientY: 250 }], // Move to trigger drag
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent;

      // Start touch drag
      act(() => {
        const handler = result.current.handlers.handleTouchStart(location);
        handler(touchStartEvent);
      });

      // Move to trigger drag
      act(() => {
        result.current.handlers.handleTouchMove(touchMoveEvent);
      });

      expect(result.current.state.touchDragging).toBe(true);

      // Cancel
      act(() => {
        result.current.handlers.handleTouchCancel();
      });

      expect(result.current.state.touchDragging).toBe(false);
      expect(result.current.state.draggingCard).toBeNull();
      expect(result.current.state.touchPosition).toBeNull();
    });

    it('should find drop target from touch coordinates', () => {
      mockValidateMove.mockReturnValue(true);

      const mockElement = document.createElement('div');
      mockElement.setAttribute('data-drop-target-type', 'target');
      mockElement.setAttribute('data-drop-target-index', '2');
      document.elementFromPoint = vi.fn().mockReturnValue(mockElement);

      const { result } = renderHook(() => useCardInteraction(config));

      const from: TestLocation = { type: 'pile', index: 0 };
      const touchStartEvent = {
        touches: [{ clientX: 100, clientY: 200 }],
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent;

      const touchMoveEvent = {
        touches: [{ clientX: 250, clientY: 350 }], // Move to trigger drag
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent;

      const touchEndEvent = {
        changedTouches: [{ clientX: 300, clientY: 400 }],
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent;

      // Start touch drag
      act(() => {
        const handler = result.current.handlers.handleTouchStart(from);
        handler(touchStartEvent);
      });

      // Move to trigger drag
      act(() => {
        result.current.handlers.handleTouchMove(touchMoveEvent);
      });

      // End touch
      act(() => {
        result.current.handlers.handleTouchEnd(touchEndEvent);
      });

      expect(document.elementFromPoint).toHaveBeenCalledWith(300, 400);
      const expectedTo: TestLocation = { type: 'target', index: 2 };
      expect(mockValidateMove).toHaveBeenCalledWith(from, expectedTo);
    });

    it('should not crash if touch ends without drop target', () => {
      document.elementFromPoint = vi.fn().mockReturnValue(null);

      const { result } = renderHook(() => useCardInteraction(config));

      const from: TestLocation = { type: 'pile', index: 0 };
      const touchStartEvent = {
        touches: [{ clientX: 100, clientY: 200 }],
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent;

      const touchEndEvent = {
        changedTouches: [{ clientX: 150, clientY: 250 }],
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent;

      act(() => {
        const handler = result.current.handlers.handleTouchStart(from);
        handler(touchStartEvent);
        result.current.handlers.handleTouchEnd(touchEndEvent);
      });

      expect(mockExecuteMove).not.toHaveBeenCalled();
      expect(result.current.state.touchDragging).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle null locations gracefully', () => {
      const { result } = renderHook(() => useCardInteraction(config));

      // Click null should not crash
      act(() => {
        result.current.handlers.handleCardClick(null as unknown as TestLocation);
      });

      expect(result.current.state.selectedCard).toBeNull();
    });

    it('should prevent concurrent drag and click', () => {
      const { result } = renderHook(() => useCardInteraction(config));

      const dragLocation: TestLocation = { type: 'pile', index: 0 };
      const clickLocation: TestLocation = { type: 'pile', index: 1 };

      const dragStartEvent = {
        dataTransfer: { effectAllowed: '', setData: vi.fn() },
        preventDefault: vi.fn(),
      } as unknown as React.DragEvent;

      // Start drag
      act(() => {
        const handler = result.current.handlers.handleDragStart(dragLocation);
        handler(dragStartEvent);
      });

      // Try to click while dragging
      act(() => {
        result.current.handlers.handleCardClick(clickLocation);
      });

      // Click should be ignored while dragging
      expect(result.current.state.selectedCard).toBeNull();
      expect(result.current.state.draggingCard).toEqual(dragLocation);
    });

    it('should handle executeMove throwing error', () => {
      mockValidateMove.mockReturnValue(true);
      mockExecuteMove.mockImplementation(() => {
        throw new Error('Move failed');
      });

      const { result } = renderHook(() => useCardInteraction(config));

      const from: TestLocation = { type: 'pile', index: 0 };
      const to: TestLocation = { type: 'target', index: 1 };

      // Select source card
      act(() => {
        result.current.handlers.handleCardClick(from);
      });

      expect(result.current.state.selectedCard).toEqual(from);

      // Try to move (should throw error)
      expect(() => {
        act(() => {
          result.current.handlers.handleCardClick(to);
        });
      }).toThrow('Move failed');

      // Error should propagate to caller
      expect(mockExecuteMove).toHaveBeenCalledWith(from, to);
    });

    it('should handle touch move without active drag', () => {
      const { result } = renderHook(() => useCardInteraction(config));

      const touchMoveEvent = {
        touches: [{ clientX: 150, clientY: 250 }],
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent;

      // Move without starting drag should not crash
      act(() => {
        result.current.handlers.handleTouchMove(touchMoveEvent);
      });

      expect(result.current.state.touchPosition).toBeNull();
    });

    it('should handle touch end without active drag', () => {
      const { result } = renderHook(() => useCardInteraction(config));

      const touchEndEvent = {
        changedTouches: [{ clientX: 150, clientY: 250 }],
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent;

      // End without starting drag should not crash
      act(() => {
        result.current.handlers.handleTouchEnd(touchEndEvent);
      });

      expect(mockExecuteMove).not.toHaveBeenCalled();
    });

    it('should clear selection when starting drag', () => {
      const { result } = renderHook(() => useCardInteraction(config));

      const clickLocation: TestLocation = { type: 'pile', index: 0 };
      const dragLocation: TestLocation = { type: 'pile', index: 1 };

      // Select a card with click
      act(() => {
        result.current.handlers.handleCardClick(clickLocation);
      });

      expect(result.current.state.selectedCard).toEqual(clickLocation);

      // Start dragging different card
      const dragStartEvent = {
        dataTransfer: { effectAllowed: '', setData: vi.fn() },
        preventDefault: vi.fn(),
      } as unknown as React.DragEvent;

      act(() => {
        const handler = result.current.handlers.handleDragStart(dragLocation);
        handler(dragStartEvent);
      });

      // Selection should be cleared when drag starts
      expect(result.current.state.selectedCard).toBeNull();
      expect(result.current.state.draggingCard).toEqual(dragLocation);
    });
  });

  describe('getCardAtLocation integration', () => {
    it('should return card data when getCardAtLocation is provided', () => {
      mockGetCardAtLocation.mockReturnValue(mockCard);

      const { result } = renderHook(() => useCardInteraction(config));

      const location: TestLocation = { type: 'pile', index: 0 };

      act(() => {
        result.current.handlers.handleCardClick(location);
      });

      // Hook doesn't expose card data directly, but getCardAtLocation should be called
      // This is for external use (e.g., DraggingCardPreview component)
      expect(mockGetCardAtLocation).not.toHaveBeenCalled(); // Only called by external components
    });

    it('should work without getCardAtLocation', () => {
      const configWithoutCards = {
        validateMove: mockValidateMove,
        executeMove: mockExecuteMove,
        // No getCardAtLocation
      };

      const { result } = renderHook(() => useCardInteraction(configWithoutCards));

      const location: TestLocation = { type: 'pile', index: 0 };

      // Should not crash without getCardAtLocation
      act(() => {
        result.current.handlers.handleCardClick(location);
      });

      expect(result.current.state.selectedCard).toEqual(location);
    });
  });
});
