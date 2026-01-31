import React from 'react';
import { type CardType } from '@plokmin/shared';
import { Card, EmptyCell } from '@plokmin/shared';

interface TableauProps {
  tableau: CardType[][];
  selectedCard: { type: 'tableau'; column: number; cardIndex: number } | null;
  draggingCard:
    | { type: 'tableau'; column: number; cardIndex: number }
    | { type: 'freeCell'; index: number }
    | { type: 'foundation'; index: number }
    | null;
  highlightedCardIds?: string[];
  onCardClick: (columnIndex: number, cardIndex: number) => void;
  onEmptyColumnClick: (columnIndex: number) => void;
  onDragStart?: (columnIndex: number, cardIndex: number) => (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (columnIndex: number) => (e: React.DragEvent) => void;
  onTouchStart?: (columnIndex: number, cardIndex: number) => (e: React.TouchEvent) => void;
  onTouchMove?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
  onTouchCancel?: () => void;
  // Responsive sizing
  cardWidth?: number;
  cardHeight?: number;
  cardGap?: number;
  cardOverlap?: number;
  fontSize?: {
    large: number;
    medium: number;
    small: number;
  };
  // Accessibility
  highContrastMode?: boolean;
}

export const Tableau: React.FC<TableauProps> = ({
  tableau,
  selectedCard,
  draggingCard,
  highlightedCardIds = [],
  onCardClick,
  onEmptyColumnClick,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onTouchCancel,
  cardWidth = 60,
  cardHeight = 84,
  cardGap = 8,
  cardOverlap = 64,
  fontSize = { large: 26, medium: 24, small: 14 },
  highContrastMode = false,
}) => {
  return (
    <div style={{ display: 'flex', gap: `${cardGap}px`, marginTop: `${cardGap * 3}px` }}>
      {tableau.map((column, columnIndex) => (
        <div
          key={`column-${columnIndex}`}
          style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '500px', // Expanded hitbox for easier mobile dropping
            flex: 1, // Fill available vertical space
          }}
          data-drop-target-type="tableau"
          data-drop-target-index={columnIndex}
          onDragOver={onDragOver}
          onDrop={onDrop ? onDrop(columnIndex) : undefined}
        >
          {column.length === 0 ? (
            <EmptyCell
              onClick={() => onEmptyColumnClick(columnIndex)}
              cardWidth={cardWidth}
              cardHeight={cardHeight}
            />
          ) : (
            column.map((card, cardIndex) => {
              const isSelected =
                selectedCard?.type === 'tableau' &&
                selectedCard.column === columnIndex &&
                cardIndex >= selectedCard.cardIndex;

              const isDragging =
                draggingCard?.type === 'tableau' &&
                draggingCard.column === columnIndex &&
                cardIndex >= draggingCard.cardIndex;

              const isHighlighted = highlightedCardIds.includes(card.id);

              return (
                <div
                  key={card.id}
                  style={{
                    marginTop: cardIndex === 0 ? '0' : `-${cardOverlap}px`,
                  }}
                >
                  <Card
                    card={card}
                    onClick={() => onCardClick(columnIndex, cardIndex)}
                    isSelected={isSelected}
                    isHighlighted={isHighlighted}
                    isDragging={isDragging}
                    cardWidth={cardWidth}
                    cardHeight={cardHeight}
                    fontSize={fontSize}
                    highContrastMode={highContrastMode}
                    onDragStart={onDragStart ? onDragStart(columnIndex, cardIndex) : undefined}
                    onDragEnd={onDragEnd}
                    onDragOver={onDragOver}
                    onTouchStart={onTouchStart ? onTouchStart(columnIndex, cardIndex) : undefined}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                    onTouchCancel={onTouchCancel}
                    data-drop-target-type="tableau"
                    data-drop-target-index={columnIndex}
                    data-drop-target-card-index={cardIndex}
                    data-drop-target-card-count={column.length - cardIndex}
                  />
                </div>
              );
            })
          )}
        </div>
      ))}
    </div>
  );
};
