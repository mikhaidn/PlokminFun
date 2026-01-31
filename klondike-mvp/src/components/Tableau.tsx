import React from 'react';
import { Card, EmptyCell, type LayoutSizes, type GameLocation } from '@plokmin/shared';
import { type TableauColumn, type KlondikeGameState } from '../state/gameState';
import { isCardFaceUp } from '../state/cardDisplay';

interface TableauProps {
  tableau: TableauColumn[];
  onClick: (columnIndex: number, cardIndex: number) => void;
  selectedColumn: { columnIndex: number; cardCount: number } | null;
  layoutSizes: LayoutSizes;
  gameState: KlondikeGameState;
  draggingCard?: { type: string; index: number; cardCount?: number } | null;
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
}

export const Tableau: React.FC<TableauProps> = ({
  tableau,
  onClick,
  selectedColumn,
  layoutSizes,
  gameState,
  draggingCard,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onTouchCancel,
}) => {
  const { cardWidth, cardHeight, cardOverlap, fontSize } = layoutSizes;

  return (
    <div
      style={{
        display: 'flex',
        gap: `${layoutSizes.cardGap}px`,
        justifyContent: 'center',
        flexWrap: 'nowrap',
      }}
    >
      {tableau.map((column, columnIndex) => {
        // Calculate column height based on number of cards and overlap
        // Add extra space below for easier mobile drop targeting
        const baseColumnHeight =
          column.cards.length === 0
            ? cardHeight
            : cardHeight + (column.cards.length - 1) * cardOverlap;
        const columnHeight = baseColumnHeight + 300; // Add 300px drop zone below cards

        return (
          <div
            key={columnIndex}
            style={{
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              minHeight: `${columnHeight}px`, // Expanded hitbox for easier mobile dropping
              width: `${cardWidth}px`,
              flex: 1, // Fill available vertical space
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
                label="K"
                onClick={() => onClick(columnIndex, 0)}
              />
            ) : (
              column.cards.map((card, cardIndex) => {
                // RFC-005 compatible: uses GameLocation from @plokmin/shared
                const location: GameLocation = { type: 'tableau', index: columnIndex };
                const faceUp = isCardFaceUp(gameState, location, cardIndex);

                // Check if this card is part of selection or dragging
                const isSelected =
                  selectedColumn?.columnIndex === columnIndex &&
                  cardIndex >= column.cards.length - selectedColumn.cardCount;

                const isDragging =
                  draggingCard?.type === 'tableau' &&
                  draggingCard?.index === columnIndex &&
                  cardIndex >= column.cards.length - (draggingCard?.cardCount ?? 1);

                const cardCount = column.cards.length - cardIndex;
                const canDrag = faceUp; // Only face-up cards can be dragged

                return (
                  <div
                    key={card.id}
                    style={{
                      position: cardIndex === 0 ? 'relative' : 'absolute',
                      top: cardIndex === 0 ? 0 : `${cardIndex * cardOverlap}px`,
                      cursor: 'pointer',
                      zIndex: cardIndex,
                    }}
                    onClick={() => onClick(columnIndex, cardIndex)}
                  >
                    <Card
                      card={card}
                      faceUp={faceUp}
                      cardWidth={cardWidth}
                      cardHeight={cardHeight}
                      fontSize={fontSize}
                      isSelected={isSelected}
                      isDragging={isDragging}
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
                    />
                  </div>
                );
              })
            )}
          </div>
        );
      })}
    </div>
  );
};
