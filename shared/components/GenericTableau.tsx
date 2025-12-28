/**
 * GenericTableau Component
 *
 * RFC-005 Phase 2 Weeks 4-5: Generic Components
 *
 * A flexible tableau component that works for multiple solitaire games
 * (Klondike, FreeCell, Spider, etc.)
 *
 * Key features:
 * - Supports face-up/face-down cards
 * - Configurable empty cell labels
 * - Flexible card positioning
 * - Integration with useCardInteraction hook
 */

import React from 'react';
import { Card as CardComponent, EmptyCell, type GameLocation } from '../index';
import type { Card } from '../types/Card';
import type { LayoutSizes } from '../utils/responsiveLayout';

/**
 * Enriched card data with display metadata
 */
export interface TableauCard {
  /** The card data */
  card: Card;
  /** Whether this card should be displayed face-up */
  faceUp: boolean;
  /** Whether this card can be dragged */
  draggable?: boolean;
}

/**
 * Column of cards with metadata
 */
export interface TableauColumnData {
  /** Cards in this column (bottom to top) */
  cards: TableauCard[];
  /** Optional label for empty column (e.g., "K" for King-only) */
  emptyLabel?: string;
  /** Optional face-down card count to display as badge (e.g., for Klondike) */
  faceDownCount?: number;
}

/**
 * Props for GenericTableau component
 */
export interface GenericTableauProps {
  /** Column data for the tableau */
  columns: TableauColumnData[];

  /** Layout sizing information */
  layoutSizes: LayoutSizes;

  /** Selected card location (from useCardInteraction) */
  selectedCard?: GameLocation | null;

  /** Dragging card location (from useCardInteraction) */
  draggingCard?: GameLocation | null;

  /** Highlighted card IDs (for hints) */
  highlightedCardIds?: string[];

  /** Highlighted cells (for smart tap destinations) */
  highlightedCells?: GameLocation[];

  // Event handlers
  onClick: (columnIndex: number, cardIndex: number) => void;
  onEmptyColumnClick: (columnIndex: number) => void;
  onDragStart?: (
    columnIndex: number,
    cardIndex: number,
    cardCount: number
  ) => (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (columnIndex: number) => (e: React.DragEvent) => void;
  onTouchStart?: (
    columnIndex: number,
    cardIndex: number,
    cardCount: number
  ) => (e: React.TouchEvent) => void;
  onTouchMove?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
  onTouchCancel?: () => void;

  /** Card positioning strategy */
  positioningStrategy?: 'absolute' | 'margin';

  /** Additional space below cards for drop zone (px) */
  dropZoneHeight?: number;

  /** High contrast mode */
  highContrastMode?: boolean;
}

/**
 * GenericTableau Component
 *
 * Renders a tableau that works for multiple solitaire variants.
 * Handles both absolute positioning (Klondike) and margin-based
 * positioning (FreeCell).
 *
 * @example
 * // Klondike usage
 * <GenericTableau
 *   columns={klondikeTableauColumns}
 *   layoutSizes={layoutSizes}
 *   selectedCard={interactionState.selectedCard}
 *   draggingCard={interactionState.draggingCard}
 *   onClick={handleTableauClick}
 *   onEmptyColumnClick={handleEmptyColumnClick}
 *   positioningStrategy="absolute"
 *   {...handlers}
 * />
 *
 * @example
 * // FreeCell usage
 * <GenericTableau
 *   columns={freecellTableauColumns}
 *   layoutSizes={layoutSizes}
 *   selectedCard={interactionState.selectedCard}
 *   draggingCard={interactionState.draggingCard}
 *   onClick={handleTableauClick}
 *   onEmptyColumnClick={handleEmptyColumnClick}
 *   positioningStrategy="margin"
 *   {...handlers}
 * />
 */
export const GenericTableau: React.FC<GenericTableauProps> = ({
  columns,
  layoutSizes,
  selectedCard,
  draggingCard,
  highlightedCardIds = [],
  highlightedCells = [],
  onClick,
  onEmptyColumnClick,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onTouchCancel,
  positioningStrategy = 'margin',
  dropZoneHeight = 300,
  highContrastMode = false,
}) => {
  const { cardWidth, cardHeight, cardOverlap, cardGap, fontSize } = layoutSizes;

  return (
    <div
      style={{
        display: 'flex',
        gap: `${cardGap}px`,
        justifyContent: 'center',
        flexWrap: 'nowrap',
        marginTop: positioningStrategy === 'margin' ? `${cardGap * 3}px` : 0,
      }}
    >
      {columns.map((column, columnIndex) => {
        // Calculate column height
        const baseColumnHeight =
          column.cards.length === 0
            ? cardHeight
            : cardHeight + (column.cards.length - 1) * cardOverlap;
        const columnHeight = baseColumnHeight + dropZoneHeight;

        // Check if this empty column is highlighted
        const isEmptyColumnHighlighted =
          column.cards.length === 0 &&
          highlightedCells.some((cell) => cell.type === 'tableau' && cell.index === columnIndex);

        return (
          <div
            key={columnIndex}
            style={{
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              minHeight: `${columnHeight}px`,
              width: positioningStrategy === 'absolute' ? `${cardWidth}px` : undefined,
              flex: 1,
            }}
            data-drop-target-type="tableau"
            data-drop-target-index={columnIndex}
            onDragOver={onDragOver}
            onDrop={onDrop ? onDrop(columnIndex) : undefined}
          >
            {column.cards.length === 0 ? (
              <EmptyCell
                cardWidth={cardWidth}
                cardHeight={cardHeight}
                label={column.emptyLabel}
                onClick={() => onEmptyColumnClick(columnIndex)}
                isHighlighted={isEmptyColumnHighlighted}
                data-drop-target-type="tableau"
                data-drop-target-index={columnIndex}
              />
            ) : (
              column.cards.map((tableauCard, cardIndex) => {
                const { card, faceUp, draggable = true } = tableauCard;

                // Check if this card is part of selection
                const isSelected =
                  selectedCard?.type === 'tableau' &&
                  selectedCard?.index === columnIndex &&
                  (selectedCard.cardCount === undefined ||
                    cardIndex >= column.cards.length - selectedCard.cardCount);

                // Check if this card is being dragged
                const isDragging =
                  draggingCard?.type === 'tableau' &&
                  draggingCard?.index === columnIndex &&
                  (draggingCard.cardCount === undefined ||
                    cardIndex >= column.cards.length - (draggingCard.cardCount ?? 1));

                const isHighlighted = highlightedCardIds.includes(card.id);
                const cardCount = column.cards.length - cardIndex;
                const canDrag = draggable && faceUp;

                // Card positioning styles
                const cardStyle =
                  positioningStrategy === 'absolute'
                    ? {
                        position: cardIndex === 0 ? ('relative' as const) : ('absolute' as const),
                        top: cardIndex === 0 ? 0 : `${cardIndex * cardOverlap}px`,
                        cursor: 'pointer',
                        zIndex: cardIndex,
                      }
                    : {
                        marginTop: cardIndex === 0 ? '0' : `-${cardOverlap}px`,
                      };

                return (
                  <div
                    key={card.id}
                    style={cardStyle}
                    onClick={() => onClick(columnIndex, cardIndex)}
                  >
                    <CardComponent
                      card={card}
                      faceUp={faceUp}
                      cardWidth={cardWidth}
                      cardHeight={cardHeight}
                      fontSize={fontSize}
                      isSelected={isSelected}
                      isDragging={isDragging}
                      isHighlighted={isHighlighted}
                      highContrastMode={highContrastMode}
                      draggable={canDrag}
                      onDragStart={
                        canDrag && onDragStart
                          ? onDragStart(columnIndex, cardIndex, cardCount)
                          : undefined
                      }
                      onDragEnd={onDragEnd}
                      onTouchStart={
                        canDrag && onTouchStart
                          ? onTouchStart(columnIndex, cardIndex, cardCount)
                          : undefined
                      }
                      onTouchMove={onTouchMove}
                      onTouchEnd={onTouchEnd}
                      onTouchCancel={onTouchCancel}
                      data-drop-target-type="tableau"
                      data-drop-target-index={columnIndex}
                      data-drop-target-card-index={cardIndex}
                      data-drop-target-card-count={cardCount}
                    />
                  </div>
                );
              })
            )}

            {/* Face-down card count badge (for Klondike) */}
            {column.faceDownCount !== undefined && column.faceDownCount > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  backgroundColor: 'rgba(0, 0, 0, 0.75)',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: `${Math.max(12, cardWidth * 0.18)}px`,
                  fontWeight: 'bold',
                  zIndex: 9999,
                  userSelect: 'none',
                  pointerEvents: 'none',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                }}
                title={`${column.faceDownCount} face-down card${column.faceDownCount > 1 ? 's' : ''}`}
              >
                {column.faceDownCount}↓
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
