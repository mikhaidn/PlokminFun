import React from 'react';
import { Card } from './Card';
import { EmptyCell } from './EmptyCell';
import { type TableauColumn, type KlondikeGameState, isCardFaceUp } from '../state/gameState';
import type { LayoutSizes } from '../utils/responsiveLayout';

interface TableauProps {
  tableau: TableauColumn[];
  onClick: (columnIndex: number, cardIndex: number) => void;
  selectedColumn: { columnIndex: number; cardCount: number } | null;
  layoutSizes: LayoutSizes;
  gameState: KlondikeGameState;
}

export const Tableau: React.FC<TableauProps> = ({
  tableau,
  onClick,
  selectedColumn,
  layoutSizes,
  gameState,
}) => {
  const { cardWidth, cardHeight, cardOverlap, fontSize } = layoutSizes;

  return (
    <div
      style={{
        display: 'flex',
        gap: `${layoutSizes.cardGap}px`,
        justifyContent: 'center',
        flexWrap: 'nowrap',
        overflow: 'auto',
      }}
    >
      {tableau.map((column, columnIndex) => (
        <div
          key={columnIndex}
          style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            minHeight: `${cardHeight}px`,
            width: `${cardWidth}px`,
          }}
        >
          {column.cards.length === 0 ? (
            <EmptyCell
              cardWidth={cardWidth}
              cardHeight={cardHeight}
              label="K"
              onClick={() => onClick(columnIndex, 0)}
            />
          ) : (
            column.cards.map((card, cardIndex) => {
              const faceUp = isCardFaceUp(
                gameState,
                { type: 'tableau', index: columnIndex },
                cardIndex
              );

              // Check if this card is part of selection
              const isSelected =
                selectedColumn?.columnIndex === columnIndex &&
                cardIndex >= column.cards.length - selectedColumn.cardCount;

              return (
                <div
                  key={card.id}
                  style={{
                    position: cardIndex === 0 ? 'relative' : 'absolute',
                    top: cardIndex === 0 ? 0 : `${cardIndex * cardOverlap}px`,
                    cursor: 'pointer',
                    zIndex: cardIndex,
                  }}
                  onClick={() => onClick(columnIndex, cardIndex)}
                >
                  <Card
                    card={card}
                    faceUp={faceUp}
                    cardWidth={cardWidth}
                    cardHeight={cardHeight}
                    fontSize={fontSize}
                    isSelected={isSelected}
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
