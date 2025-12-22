import React from 'react';
import { type Card as CardType } from '../core/types';
import { Card } from './Card';
import { EmptyCell } from './EmptyCell';

interface FoundationAreaProps {
  foundations: CardType[][];
  onFoundationClick: (index: number) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (index: number) => (e: React.DragEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
}

const SUIT_LABELS = ['♠', '♥', '♦', '♣'];

export const FoundationArea: React.FC<FoundationAreaProps> = ({
  foundations,
  onFoundationClick,
  onDragOver,
  onDrop,
  onTouchEnd,
}) => {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      {foundations.map((foundation, index) => {
        const topCard = foundation.length > 0 ? foundation[foundation.length - 1] : null;

        return (
          <div
            key={`foundation-${index}`}
            data-drop-target="true"
            data-drop-type="foundation"
            data-drop-index={index}
            onDragOver={onDragOver}
            onDrop={onDrop ? onDrop(index) : undefined}
            onTouchEnd={onTouchEnd}
          >
            {topCard ? (
              <Card
                card={topCard}
                onClick={() => onFoundationClick(index)}
                draggable={false}
              />
            ) : (
              <EmptyCell
                onClick={() => onFoundationClick(index)}
                label={SUIT_LABELS[index]}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
