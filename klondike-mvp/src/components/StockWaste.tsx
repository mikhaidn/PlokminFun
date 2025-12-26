import React from 'react';
import { Card, CardBack, EmptyCell, type LayoutSizes } from '@cardgames/shared';
import type { Card as CardType } from '../core/types';

interface StockWasteProps {
  stock: CardType[];
  waste: CardType[];
  onStockClick: () => void;
  onWasteClick: () => void;
  isWasteSelected: boolean;
  layoutSizes: LayoutSizes;
  draggingCard?: { type: string } | null;
  onDragStart?: () => (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: () => (e: React.DragEvent) => void;
  onTouchStart?: () => (e: React.TouchEvent) => void;
  onTouchMove?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
  onTouchCancel?: () => void;
}

export const StockWaste: React.FC<StockWasteProps> = ({
  stock,
  waste,
  onStockClick,
  onWasteClick,
  isWasteSelected,
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
      {/* Stock Pile */}
      <div
        style={{
          width: `${cardWidth}px`,
          height: `${cardHeight}px`,
          cursor: 'pointer',
        }}
        onClick={onStockClick}
      >
        {stock.length > 0 ? (
          <CardBack
            cardWidth={cardWidth}
            cardHeight={cardHeight}
            theme="blue"
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
          <Card
            card={waste[waste.length - 1]}
            faceUp={true}
            cardWidth={cardWidth}
            cardHeight={cardHeight}
            fontSize={fontSize}
            isSelected={isWasteSelected}
            isDragging={draggingCard?.type === 'waste'}
            draggable={true}
            onDragStart={onDragStart ? onDragStart() : undefined}
            onDragEnd={onDragEnd}
            onTouchStart={onTouchStart ? onTouchStart() : undefined}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onTouchCancel={onTouchCancel}
            data-drop-target-type="waste"
            data-drop-target-index={0}
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
