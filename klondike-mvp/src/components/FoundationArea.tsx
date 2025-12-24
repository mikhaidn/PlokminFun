import React from 'react';
import { Card } from './Card';
import { EmptyCell } from './EmptyCell';
import type { Card as CardType, Suit } from '../core/types';
import type { LayoutSizes } from '../utils/responsiveLayout';

interface FoundationAreaProps {
  foundations: CardType[][];
  onClick: (index: number) => void;
  selectedFoundation: number | null;
  layoutSizes: LayoutSizes;
  draggingCard?: { type: string; index: number } | null;
  onDragStart?: (index: number) => (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (index: number) => (e: React.DragEvent) => void;
  onTouchStart?: (index: number) => (e: React.TouchEvent) => void;
  onTouchMove?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
  onTouchCancel?: () => void;
}

const FOUNDATION_SUITS: Suit[] = ['♠', '♥', '♦', '♣'];

export const FoundationArea: React.FC<FoundationAreaProps> = ({
  foundations,
  onClick,
  selectedFoundation,
  layoutSizes,
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
  const { cardWidth, cardHeight, cardGap, fontSize } = layoutSizes;

  return (
    <div style={{ display: 'flex', gap: `${cardGap}px` }}>
      {foundations.map((foundation, index) => {
        const isDragging = draggingCard?.type === 'foundation' && draggingCard?.index === index;

        return (
          <div
            key={index}
            style={{
              width: `${cardWidth}px`,
              height: `${cardHeight}px`,
              cursor: 'pointer',
            }}
            data-drop-target-type="foundation"
            data-drop-target-index={index}
            onDragOver={onDragOver}
            onDrop={onDrop ? onDrop(index) : undefined}
            onClick={() => onClick(index)}
          >
            {foundation.length > 0 ? (
              <Card
                card={foundation[foundation.length - 1]}
                faceUp={true}
                cardWidth={cardWidth}
                cardHeight={cardHeight}
                fontSize={fontSize}
                isSelected={selectedFoundation === index}
                isDragging={isDragging}
                draggable={true}
                onDragStart={onDragStart ? onDragStart(index) : undefined}
                onDragEnd={onDragEnd}
                onTouchStart={onTouchStart ? onTouchStart(index) : undefined}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onTouchCancel={onTouchCancel}
              />
            ) : (
              <EmptyCell
                cardWidth={cardWidth}
                cardHeight={cardHeight}
                label={FOUNDATION_SUITS[index]}
                onClick={() => onClick(index)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
