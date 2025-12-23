/**
 * Shared card interaction hook
 * Provides click-to-select, drag-and-drop, and touch interaction logic
 * Used by FreeCell, Klondike, and future games
 */

import { useState, useCallback } from 'react';
import type {
  CardLocation,
  CardInteractionConfig,
  CardInteractionState,
  CardInteractionHandlers,
  UseCardInteractionReturn,
} from '../types/CardInteraction';

/**
 * Hook for managing card interactions (click, drag, touch)
 *
 * @param config - Configuration object with game-specific logic
 * @returns State and handlers for card interactions
 *
 * @example
 * ```tsx
 * const { state, handlers } = useCardInteraction({
 *   validateMove: (from, to) => isValidMove(gameState, from, to),
 *   executeMove: (from, to) => performMove(gameState, from, to),
 *   getCardAtLocation: (loc) => getCard(gameState, loc),
 * });
 *
 * <Card onClick={() => handlers.handleCardClick(location)} />
 * ```
 */
export function useCardInteraction<TLocation extends CardLocation>(
  config: CardInteractionConfig<TLocation>
): UseCardInteractionReturn<TLocation> {
  const { validateMove, executeMove } = config;

  // State
  const [selectedCard, setSelectedCard] = useState<TLocation | null>(null);
  const [draggingCard, setDraggingCard] = useState<TLocation | null>(null);
  const [touchDragging, setTouchDragging] = useState(false);
  const [touchPosition, setTouchPosition] = useState<{ x: number; y: number } | null>(null);

  /**
   * Compare two locations for equality
   */
  const locationsEqual = useCallback((a: TLocation | null, b: TLocation | null): boolean => {
    if (a === null || b === null) return a === b;
    return (
      a.type === b.type &&
      a.index === b.index &&
      a.cardIndex === b.cardIndex &&
      a.cardCount === b.cardCount
    );
  }, []);

  /**
   * Click-to-select handler
   *
   * Behavior:
   * 1. First click: Select the card
   * 2. Click same card: Deselect
   * 3. Click different card: Try to move, or change selection
   */
  const handleCardClick = useCallback(
    (location: TLocation) => {
      // Ignore clicks during drag
      if (draggingCard) return;

      // Ignore null locations
      if (!location) return;

      // If no card selected, select this one
      if (!selectedCard) {
        setSelectedCard(location);
        return;
      }

      // If clicking the same card, deselect
      if (locationsEqual(selectedCard, location)) {
        setSelectedCard(null);
        return;
      }

      // Try to move from selected to clicked location
      if (validateMove(selectedCard, location)) {
        // Valid move - execute and clear selection
        try {
          executeMove(selectedCard, location);
          setSelectedCard(null);
        } catch (error) {
          // If move execution fails, clear selection and re-throw
          setSelectedCard(null);
          throw error;
        }
      } else {
        // Invalid move - only change selection if clicking same type (likely another source card)
        // If clicking different type (likely a destination), keep current selection
        if (selectedCard.type === location.type) {
          setSelectedCard(location);
        }
        // else: keep selectedCard unchanged
      }
    },
    [selectedCard, draggingCard, validateMove, executeMove, locationsEqual]
  );

  /**
   * Drag start handler (mouse)
   */
  const handleDragStart = useCallback(
    (location: TLocation) => {
      return (e: React.DragEvent) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', JSON.stringify(location));
        setDraggingCard(location);
        setSelectedCard(null); // Clear selection when drag starts
      };
    },
    []
  );

  /**
   * Drag end handler (mouse)
   */
  const handleDragEnd = useCallback(() => {
    setDraggingCard(null);
  }, []);

  /**
   * Drag over handler (required to allow drop)
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); // Required to allow drop
  }, []);

  /**
   * Drop handler (mouse)
   */
  const handleDrop = useCallback(
    (location: TLocation) => {
      return (e: React.DragEvent) => {
        e.preventDefault();

        if (!draggingCard) return;

        // Try to execute the move
        if (validateMove(draggingCard, location)) {
          executeMove(draggingCard, location);
        }

        // Always clear drag state after drop (even if invalid)
        setDraggingCard(null);
      };
    },
    [draggingCard, validateMove, executeMove]
  );

  /**
   * Touch start handler (mobile)
   */
  const handleTouchStart = useCallback(
    (location: TLocation) => {
      return (e: React.TouchEvent) => {
        e.preventDefault(); // Prevent scrolling while dragging

        const touch = e.touches[0];
        setDraggingCard(location);
        setTouchDragging(true);
        setTouchPosition({ x: touch.clientX, y: touch.clientY });
        setSelectedCard(null); // Clear selection when touch drag starts
      };
    },
    []
  );

  /**
   * Touch move handler (mobile)
   */
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchDragging) return;

    e.preventDefault(); // Prevent scrolling

    const touch = e.touches[0];
    setTouchPosition({ x: touch.clientX, y: touch.clientY });
  }, [touchDragging]);

  /**
   * Touch end handler (mobile)
   *
   * Finds the drop target using document.elementFromPoint
   * and executes the move if valid
   */
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchDragging || !draggingCard) {
        // Clear state even if no active drag
        setTouchDragging(false);
        setDraggingCard(null);
        setTouchPosition(null);
        return;
      }

      e.preventDefault();

      const touch = e.changedTouches[0];
      const dropElement = document.elementFromPoint(touch.clientX, touch.clientY);

      if (dropElement) {
        // Find drop target from data attributes
        const targetType = dropElement.getAttribute('data-drop-target-type');
        const targetIndex = dropElement.getAttribute('data-drop-target-index');
        const targetCardIndex = dropElement.getAttribute('data-drop-target-card-index');
        const targetCardCount = dropElement.getAttribute('data-drop-target-card-count');

        if (targetType !== null) {
          const dropLocation: TLocation = {
            type: targetType,
            index: targetIndex !== null ? parseInt(targetIndex, 10) : undefined,
            cardIndex: targetCardIndex !== null ? parseInt(targetCardIndex, 10) : undefined,
            cardCount: targetCardCount !== null ? parseInt(targetCardCount, 10) : undefined,
          } as TLocation;

          // Try to execute the move
          if (validateMove(draggingCard, dropLocation)) {
            executeMove(draggingCard, dropLocation);
          }
        }
      }

      // Clear touch drag state
      setTouchDragging(false);
      setDraggingCard(null);
      setTouchPosition(null);
    },
    [touchDragging, draggingCard, validateMove, executeMove]
  );

  /**
   * Touch cancel handler (mobile)
   */
  const handleTouchCancel = useCallback(() => {
    setTouchDragging(false);
    setDraggingCard(null);
    setTouchPosition(null);
  }, []);

  // Return state and handlers
  return {
    state: {
      selectedCard,
      draggingCard,
      touchDragging,
      touchPosition,
    },
    handlers: {
      handleCardClick,
      handleDragStart,
      handleDragEnd,
      handleDragOver,
      handleDrop,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      handleTouchCancel,
    },
  };
}
