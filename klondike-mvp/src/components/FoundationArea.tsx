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
}

const FOUNDATION_SUITS: Suit[] = ['♠', '♥', '♦', '♣'];

export const FoundationArea: React.FC<FoundationAreaProps> = ({
  foundations,
  onClick,
  selectedFoundation,
  layoutSizes,
}) => {
  const { cardWidth, cardHeight, cardGap, fontSize } = layoutSizes;

  return (
    <div style={{ display: 'flex', gap: `${cardGap}px` }}>
      {foundations.map((foundation, index) => (
        <div
          key={index}
          style={{
            width: `${cardWidth}px`,
            height: `${cardHeight}px`,
            cursor: 'pointer',
          }}
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
      ))}
    </div>
  );
};
