/**
 * FoundationArea Component
 * RFC-005: Shared foundation area for solitaire games
 *
 * Renders 4 foundation piles with suit labels for empty slots.
 * Works for FreeCell, Klondike, and other solitaire variants.
 */

import React from 'react';
import { Card } from './Card';
import { EmptyCell } from './EmptyCell';
import type { LayoutSizes } from '../utils/responsiveLayout';
import type { Card as CardType } from '../types/Card';

interface FoundationAreaProps {
  foundations: CardType[][];
  onClick: (index: number) => void;
  selectedFoundation?: number | null;
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
  // Optional: for games that need to customize labels
  suitLabels?: string[];
  // Optional: for games with high contrast mode
  highContrastMode?: boolean;
}

const DEFAULT_SUIT_LABELS = ['♠', '♥', '♦', '♣'];

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
  suitLabels = DEFAULT_SUIT_LABELS,
  highContrastMode = false,
}) => {
  const { cardWidth, cardHeight, cardGap, fontSize } = layoutSizes;

  return (
    <div style={{ display: 'flex', gap: `${cardGap}px` }}>
      {foundations.map((foundation, index) => {
        const isDragging = draggingCard?.type === 'foundation' && draggingCard?.index === index;
        const isSelected = selectedFoundation === index;

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
                isSelected={isSelected}
                isDragging={isDragging}
                draggable={true}
                onDragStart={onDragStart ? onDragStart(index) : undefined}
                onDragEnd={onDragEnd}
                onTouchStart={onTouchStart ? onTouchStart(index) : undefined}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onTouchCancel={onTouchCancel}
                highContrastMode={highContrastMode}
                data-drop-target-type="foundation"
                data-drop-target-index={index}
              />
            ) : (
              <EmptyCell
                cardWidth={cardWidth}
                cardHeight={cardHeight}
                label={suitLabels[index]}
                onClick={() => onClick(index)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
