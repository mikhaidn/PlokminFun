import React from 'react';
import { type Card as CardType } from '../core/types';
import { Card, EmptyCell } from '@cardgames/shared';

interface SelectedCard {
  type: 'foundation';
  index: number;
}

interface DraggingCard {
  type: string;
  index?: number;
  column?: number;
  cardIndex?: number;
}

interface FoundationAreaProps {
  foundations: CardType[][];
  selectedCard?: SelectedCard | null;
  draggingCard?: DraggingCard | null;
  onFoundationClick: (index: number) => void;
  onDragStart?: (index: number) => (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (index: number) => (e: React.DragEvent) => void;
  onTouchStart?: (index: number) => (e: React.TouchEvent) => void;
  onTouchMove?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
  onTouchCancel?: () => void;
  // Responsive sizing
  cardWidth?: number;
  cardHeight?: number;
  cardGap?: number;
  fontSize?: {
    large: number;
    medium: number;
    small: number;
  };
  // Accessibility
  highContrastMode?: boolean;
}

const SUIT_LABELS = ['♠', '♥', '♦', '♣'];

export const FoundationArea: React.FC<FoundationAreaProps> = ({
  foundations,
  selectedCard,
  draggingCard,
  onFoundationClick,
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
  fontSize = { large: 26, medium: 24, small: 14 },
  highContrastMode = false,
}) => {
  return (
    <div style={{ display: 'flex', gap: `${cardGap}px` }}>
      {foundations.map((foundation, index) => {
        const topCard = foundation.length > 0 ? foundation[foundation.length - 1] : null;
        const isSelected = selectedCard?.index === index;
        const isDragging = draggingCard?.type === 'foundation' && draggingCard?.index === index;

        return (
          <div
            key={`foundation-${index}`}
            data-drop-target-type="foundation"
            data-drop-target-index={index}
            onDragOver={onDragOver}
            onDrop={onDrop ? onDrop(index) : undefined}
            onTouchEnd={onTouchEnd}
          >
            {topCard ? (
              <Card
                card={topCard}
                onClick={() => onFoundationClick(index)}
                draggable={true}
                onDragStart={onDragStart ? onDragStart(index) : undefined}
                onDragEnd={onDragEnd}
                onDragOver={onDragOver}
                onTouchStart={onTouchStart ? onTouchStart(index) : undefined}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onTouchCancel={onTouchCancel}
                isSelected={isSelected}
                isDragging={isDragging}
                cardWidth={cardWidth}
                cardHeight={cardHeight}
                fontSize={fontSize}
                highContrastMode={highContrastMode}
                data-drop-target-type="foundation"
                data-drop-target-index={index}
              />
            ) : (
              <EmptyCell
                onClick={() => onFoundationClick(index)}
                label={SUIT_LABELS[index]}
                cardWidth={cardWidth}
                cardHeight={cardHeight}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
