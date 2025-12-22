import React from 'react';
import { type Card as CardType } from '../core/types';
import { Card } from './Card';
import { EmptyCell } from './EmptyCell';

interface FreeCellAreaProps {
  freeCells: (CardType | null)[];
  selectedCard: { type: 'freeCell'; index: number } | null;
  draggingCard: { type: 'tableau'; column: number; cardIndex: number } | { type: 'freeCell'; index: number } | null;
  highlightedCardIds?: string[];
  onFreeCellClick: (index: number) => void;
  onDragStart?: (index: number) => (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (index: number) => (e: React.DragEvent) => void;
  onTouchStart?: (index: number) => (e: React.TouchEvent) => void;
  onTouchMove?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
  onTouchCancel?: () => void;
}

export const FreeCellArea: React.FC<FreeCellAreaProps> = ({
  freeCells,
  selectedCard,
  draggingCard,
  highlightedCardIds = [],
  onFreeCellClick,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onTouchCancel,
}) => {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      {freeCells.map((card, index) => {
        const isDragging = draggingCard?.type === 'freeCell' && draggingCard.index === index;
        const isHighlighted = card ? highlightedCardIds.includes(card.id) : false;

        return (
          <div
            key={`freecell-${index}`}
            data-drop-target="true"
            data-drop-type="freeCell"
            data-drop-index={index}
            onDragOver={onDragOver}
            onDrop={onDrop ? onDrop(index) : undefined}
          >
            {card ? (
              <Card
                card={card}
                onClick={() => onFreeCellClick(index)}
                isSelected={selectedCard?.type === 'freeCell' && selectedCard.index === index}
                isHighlighted={isHighlighted}
                isDragging={isDragging}
                onDragStart={onDragStart ? onDragStart(index) : undefined}
                onDragEnd={onDragEnd}
                onTouchStart={onTouchStart ? onTouchStart(index) : undefined}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onTouchCancel={onTouchCancel}
              />
            ) : (
              <EmptyCell onClick={() => onFreeCellClick(index)} />
            )}
          </div>
        );
      })}
    </div>
  );
};
