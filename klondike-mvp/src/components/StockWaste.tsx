import React from 'react';
import { CardFlip, EmptyCell, type LayoutSizes } from '@cardgames/shared';
import type { Card as CardType } from '../core/types';

interface StockWasteProps {
  stock: CardType[];
  waste: CardType[];
  onStockClick: () => void;
  onWasteClick: () => void;
  isWasteSelected: boolean;
  layoutSizes: LayoutSizes;
  onDragStart?: () => (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: () => (e: React.DragEvent) => void;
  onTouchStart?: () => (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
  flipDuration?: number;
}

export const StockWaste: React.FC<StockWasteProps> = ({
  stock,
  waste,
  onStockClick,
  onWasteClick,
  isWasteSelected,
  layoutSizes,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onTouchStart,
  onTouchEnd,
  flipDuration = 300,
}) => {
  const { cardWidth, cardHeight, cardGap, fontSize } = layoutSizes;

  return (
    <div style={{ display: 'flex', gap: `${cardGap}px` }}>
      {/* Stock Pile */}
      <div
        style={{
          width: `${cardWidth}px`,
          height: `${cardHeight}px`,
          cursor: 'pointer',
        }}
      >
        {stock.length > 0 ? (
          <CardFlip
            card={stock[stock.length - 1]}
            faceUp={false}
            cardWidth={cardWidth}
            cardHeight={cardHeight}
            fontSize={fontSize}
            flipDuration={flipDuration}
            cardBackTheme="blue"
            onClick={onStockClick}
          />
        ) : (
          <EmptyCell
            cardWidth={cardWidth}
            cardHeight={cardHeight}
            label="↻"
            onClick={onStockClick}
          />
        )}
      </div>

      {/* Waste Pile */}
      <div
        style={{
          width: `${cardWidth}px`,
          height: `${cardHeight}px`,
          cursor: waste.length > 0 ? 'pointer' : 'default',
        }}
        data-drop-target-type="waste"
        data-drop-target-index={0}
        onDragOver={onDragOver}
        onDrop={onDrop ? onDrop() : undefined}
        onClick={onWasteClick}
      >
        {waste.length > 0 ? (
          <CardFlip
            card={waste[waste.length - 1]}
            faceUp={true}
            cardWidth={cardWidth}
            cardHeight={cardHeight}
            fontSize={fontSize}
            flipDuration={flipDuration}
            isSelected={isWasteSelected}
            draggable={true}
            onDragStart={onDragStart ? onDragStart() : undefined}
            onDragEnd={onDragEnd}
            onTouchStart={onTouchStart ? onTouchStart() : undefined}
            onTouchEnd={onTouchEnd}
          />
        ) : (
          <EmptyCell
            cardWidth={cardWidth}
            cardHeight={cardHeight}
            label=""
          />
        )}
      </div>
    </div>
  );
};
