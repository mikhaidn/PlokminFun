import React from 'react';
import { type Card as CardType } from '../core/types';
import { Card } from './Card';
import { EmptyCell } from './EmptyCell';

interface TableauProps {
  tableau: CardType[][];
  selectedCard: { type: 'tableau'; column: number; cardIndex: number } | null;
  draggingCard: { type: 'tableau'; column: number; cardIndex: number } | { type: 'freeCell'; index: number } | null;
  highlightedCardIds?: string[];
  onCardClick: (columnIndex: number, cardIndex: number) => void;
  onEmptyColumnClick: (columnIndex: number) => void;
  onDragStart?: (columnIndex: number, cardIndex: number) => (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (columnIndex: number) => (e: React.DragEvent) => void;
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
}) => {
  return (
    <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
      {tableau.map((column, columnIndex) => (
        <div
          key={`column-${columnIndex}`}
          style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100px',
          }}
          onDragOver={onDragOver}
          onDrop={onDrop ? onDrop(columnIndex) : undefined}
        >
          {column.length === 0 ? (
            <EmptyCell onClick={() => onEmptyColumnClick(columnIndex)} />
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
                    marginTop: cardIndex === 0 ? '0' : '-64px',
                  }}
                >
                  <Card
                    card={card}
                    onClick={() => onCardClick(columnIndex, cardIndex)}
                    isSelected={isSelected}
                    isHighlighted={isHighlighted}
                    isDragging={isDragging}
                    onDragStart={onDragStart ? onDragStart(columnIndex, cardIndex) : undefined}
                    onDragEnd={onDragEnd}
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
