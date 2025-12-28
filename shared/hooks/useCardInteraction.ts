/**
 * Shared card interaction hook
 * Provides click-to-select, drag-and-drop, touch interaction, and smart tap-to-move
 * Used by FreeCell, Klondike, and future games
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  CardLocation,
  GameLocation,
  CardInteractionConfig,
  UseCardInteractionReturn,
  InvalidMoveAttempt,
} from '../types/CardInteraction';
import { useSettings } from '../contexts/SettingsContext';

/**
 * Hook for managing card interactions (click, drag, touch)
 *
 * @param config - Configuration object with game-specific logic
 * @returns State and handlers for card interactions
 *
 * @example
 * ```tsx
 * // Using GameLocation (recommended for new code)
 * import type { GameLocation } from '@cardgames/shared';
 *
 * const { state, handlers } = useCardInteraction<GameLocation>({
 *   validateMove: (from, to) => isValidMove(gameState, from, to),
 *   executeMove: (from, to) => performMove(gameState, from, to),
 *   getCardAtLocation: (loc) => getCard(gameState, loc),
 * });
 *
 * <Card onClick={() => handlers.handleCardClick({
 *   type: 'tableau',
 *   index: 3,
 *   cardCount: 2
 * })} />
 * ```
 */
export function useCardInteraction<TLocation extends CardLocation = GameLocation>(
  config: CardInteractionConfig<TLocation>
): UseCardInteractionReturn<TLocation> {
  const { validateMove, executeMove, getValidMoves } = config;
  const { settings } = useSettings();

  // State
  const [selectedCard, setSelectedCard] = useState<TLocation | null>(null);
  const [draggingCard, setDraggingCard] = useState<TLocation | null>(null);
  const [touchDragging, setTouchDragging] = useState(false);
  const [touchPosition, setTouchPosition] = useState<{ x: number; y: number } | null>(null);
  const [touchStartLocation, setTouchStartLocation] = useState<TLocation | null>(null);
  const [touchStartPosition, setTouchStartPosition] = useState<{ x: number; y: number } | null>(
    null
  );
  const [highlightedCells, setHighlightedCells] = useState<TLocation[]>([]);
  const [invalidMoveAttempt, setInvalidMoveAttempt] =
    useState<InvalidMoveAttempt<TLocation> | null>(null);

  // Timer ref for auto-clearing invalid move feedback
  const invalidMoveTimerRef = useRef<number | null>(null);

  /**
   * Trigger invalid move feedback
   * Shows shake animation and optional tooltip
   * Auto-clears after 600ms
   */
  const triggerInvalidMove = useCallback((location: TLocation, reason?: string) => {
    // Clear any existing timer
    if (invalidMoveTimerRef.current !== null) {
      window.clearTimeout(invalidMoveTimerRef.current);
    }

    // Set invalid move state
    setInvalidMoveAttempt({
      location,
      reason,
      timestamp: Date.now(),
    });

    // Auto-clear after 600ms (enough time for shake animation)
    invalidMoveTimerRef.current = window.setTimeout(() => {
      setInvalidMoveAttempt(null);
      invalidMoveTimerRef.current = null;
    }, 600);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (invalidMoveTimerRef.current !== null) {
        window.clearTimeout(invalidMoveTimerRef.current);
      }
    };
  }, []);

  /**
   * Compare two locations for equality
   *
   * For destination matching (tap-tap movement), we need lenient comparison:
   * - Type and index must always match
   * - cardIndex and cardCount are optional metadata
   * - Only compare if BOTH locations have them defined
   *
   * This allows matching destinations from getValidMoves() (which don't have cardCount)
   * with click locations from GameBoard (which do have cardCount).
   */
  const locationsEqual = useCallback((a: TLocation | null, b: TLocation | null): boolean => {
    if (a === null || b === null) return a === b;

    // Type and index must always match
    if (a.type !== b.type || a.index !== b.index) {
      return false;
    }

    // cardIndex: only compare if BOTH are defined
    if (a.cardIndex !== undefined && b.cardIndex !== undefined && a.cardIndex !== b.cardIndex) {
      return false;
    }

    // cardCount: only compare if BOTH are defined
    if (a.cardCount !== undefined && b.cardCount !== undefined && a.cardCount !== b.cardCount) {
      return false;
    }

    return true;
  }, []);

  /**
   * Click-to-select handler with smart tap-to-move support
   *
   * Behavior:
   * - Smart tap enabled + getValidMoves provided:
   *   1. Click card with 1 valid move: Auto-execute
   *   2. Click card with multiple moves: Highlight options
   *   3. Click highlighted destination: Execute move
   *   4. Click card with no valid moves: Provide feedback (shake animation could be added)
   *
   * - Traditional mode (or no getValidMoves):
   *   1. First click: Select the card
   *   2. Click same card: Deselect
   *   3. Click different card: Try to move, or change selection
   */
  const handleCardClick = useCallback(
    (location: TLocation) => {
      // Ignore clicks during drag
      if (draggingCard) return;

      // Ignore null locations
      if (!location) return;

      // Check if smart tap-to-move is enabled and available
      const smartTapEnabled = settings.smartTapToMove && !!getValidMoves;

      // If there's a selected card, check if this click is on a highlighted cell
      if (selectedCard && highlightedCells.length > 0) {
        const isHighlightedCell = highlightedCells.some((cell) => locationsEqual(cell, location));

        if (isHighlightedCell) {
          // Clicking a highlighted destination - execute the move
          try {
            executeMove(selectedCard, location);
            setSelectedCard(null);
            setHighlightedCells([]);
          } catch (error) {
            setSelectedCard(null);
            setHighlightedCells([]);
            throw error;
          }
          return;
        }
      }

      // If clicking the same card, deselect
      if (selectedCard && locationsEqual(selectedCard, location)) {
        setSelectedCard(null);
        setHighlightedCells([]);
        return;
      }

      // If smart tap is enabled, use smart tap logic
      if (smartTapEnabled) {
        const validMoves = getValidMoves!(location);

        if (validMoves.length === 0) {
          // No valid moves - trigger shake animation and feedback
          triggerInvalidMove(location, 'No valid moves for this card');
          setSelectedCard(null);
          setHighlightedCells([]);
          return;
        } else if (validMoves.length === 1) {
          // Only one valid move - auto-execute
          try {
            executeMove(location, validMoves[0]);
            setSelectedCard(null);
            setHighlightedCells([]);
          } catch (error) {
            setSelectedCard(null);
            setHighlightedCells([]);
            throw error;
          }
          return;
        } else {
          // Multiple valid moves - highlight them
          setSelectedCard(location);
          setHighlightedCells(validMoves);
          return;
        }
      }

      // Traditional click-to-select mode
      // If no card selected, select this one
      if (!selectedCard) {
        setSelectedCard(location);
        // Highlight valid destinations if getValidMoves is available
        if (getValidMoves) {
          const validMoves = getValidMoves(location);
          setHighlightedCells(validMoves);
        } else {
          setHighlightedCells([]);
        }
        return;
      }

      // Try to move from selected to clicked location
      if (validateMove(selectedCard, location)) {
        // Valid move - execute and clear selection
        try {
          executeMove(selectedCard, location);
          setSelectedCard(null);
          setHighlightedCells([]);
        } catch (error) {
          // If move execution fails, clear selection and re-throw
          setSelectedCard(null);
          setHighlightedCells([]);
          throw error;
        }
      } else {
        // Invalid move - trigger shake animation and feedback
        triggerInvalidMove(location, 'Invalid move');

        // Only change selection if clicking same type (likely another source card)
        // If clicking different type (likely a destination), keep current selection
        if (selectedCard.type === location.type) {
          setSelectedCard(location);
          // Highlight valid destinations for the new selection
          if (getValidMoves) {
            const validMoves = getValidMoves(location);
            setHighlightedCells(validMoves);
          } else {
            setHighlightedCells([]);
          }
        }
        // else: keep selectedCard unchanged
      }
    },
    [
      selectedCard,
      draggingCard,
      highlightedCells,
      validateMove,
      executeMove,
      getValidMoves,
      settings.smartTapToMove,
      locationsEqual,
      triggerInvalidMove,
    ]
  );

  /**
   * Drag start handler (mouse)
   */
  const handleDragStart = useCallback((location: TLocation) => {
    return (e: React.DragEvent) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', JSON.stringify(location));
      setDraggingCard(location);
      setSelectedCard(null); // Clear selection when drag starts
      setHighlightedCells([]); // Clear highlights when drag starts
    };
  }, []);

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
        } else {
          // Invalid drop - trigger shake animation
          triggerInvalidMove(location, 'Cannot drop card here');
        }

        // Always clear drag state after drop (even if invalid)
        setDraggingCard(null);
      };
    },
    [draggingCard, validateMove, executeMove, triggerInvalidMove]
  );

  /**
   * Touch start handler (mobile)
   *
   * Strategy: Don't immediately start dragging. Instead, track the touch
   * and only start dragging if the user moves their finger significantly.
   * If they release without moving, treat it as a tap (click-to-select).
   */
  const handleTouchStart = useCallback((location: TLocation) => {
    return (e: React.TouchEvent) => {
      e.preventDefault(); // Prevent scrolling

      const touch = e.touches[0];
      // Store touch start location and position, but don't start dragging yet
      setTouchStartLocation(location);
      setTouchStartPosition({ x: touch.clientX, y: touch.clientY });
      setTouchPosition({ x: touch.clientX, y: touch.clientY });
    };
  }, []);

  /**
   * Touch move handler (mobile)
   *
   * If the user moves their finger more than a threshold distance,
   * start the drag operation. Otherwise, keep it as a potential tap.
   */
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartLocation || !touchStartPosition) return;

      e.preventDefault(); // Prevent scrolling

      const touch = e.touches[0];
      const currentPos = { x: touch.clientX, y: touch.clientY };

      // Calculate distance moved
      const dx = currentPos.x - touchStartPosition.x;
      const dy = currentPos.y - touchStartPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Movement threshold: 10 pixels
      // If moved more than threshold, start dragging
      const DRAG_THRESHOLD = 10;

      if (!touchDragging && distance > DRAG_THRESHOLD) {
        // Start drag
        setDraggingCard(touchStartLocation);
        setTouchDragging(true);
        setSelectedCard(null); // Clear selection when drag starts
        setHighlightedCells([]); // Clear highlights when drag starts
      }

      // Update touch position for drag preview
      setTouchPosition(currentPos);
    },
    [touchStartLocation, touchStartPosition, touchDragging]
  );

  /**
   * Touch end handler (mobile)
   *
   * If dragging: Find drop target and execute move
   * If tapping: Select the card (click-to-select behavior)
   */
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartLocation) {
        // No touch started, clear state
        setTouchDragging(false);
        setDraggingCard(null);
        setTouchPosition(null);
        setTouchStartLocation(null);
        setTouchStartPosition(null);
        return;
      }

      e.preventDefault();

      // If we were dragging, handle drop
      if (touchDragging && draggingCard) {
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
            } else {
              // Invalid touch drop - trigger shake animation
              triggerInvalidMove(dropLocation, 'Cannot move card here');
            }
          }
        }
      } else {
        // No dragging occurred - this was a tap
        // Treat as click-to-select
        handleCardClick(touchStartLocation);
      }

      // Clear touch state
      setTouchDragging(false);
      setDraggingCard(null);
      setTouchPosition(null);
      setTouchStartLocation(null);
      setTouchStartPosition(null);
    },
    [touchDragging, draggingCard, touchStartLocation, validateMove, executeMove, handleCardClick]
  );

  /**
   * Touch cancel handler (mobile)
   */
  const handleTouchCancel = useCallback(() => {
    setTouchDragging(false);
    setDraggingCard(null);
    setTouchPosition(null);
    setTouchStartLocation(null);
    setTouchStartPosition(null);
  }, []);

  // Return state and handlers
  return {
    state: {
      selectedCard,
      draggingCard,
      touchDragging,
      touchPosition,
      highlightedCells,
      invalidMoveAttempt,
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
