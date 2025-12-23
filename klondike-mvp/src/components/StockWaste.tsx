import React from 'react';
import { Card } from './Card';
import { CardBack } from './CardBack';
import { EmptyCell } from './EmptyCell';
import type { Card as CardType } from '../core/types';
import type { LayoutSizes } from '../utils/responsiveLayout';

interface StockWasteProps {
  stock: CardType[];
  waste: CardType[];
  onStockClick: () => void;
  onWasteClick: () => void;
  isWasteSelected: boolean;
  layoutSizes: LayoutSizes;
}

export const StockWaste: React.FC<StockWasteProps> = ({
  stock,
  waste,
  onStockClick,
  onWasteClick,
  isWasteSelected,
  layoutSizes,
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
