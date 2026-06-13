import React from 'react';
import { Card, CardBack, EmptyCell, type CardType, type LayoutSizes } from '@plokmin/shared';
import { NUM_FOUNDATIONS, RUN_LENGTH } from '../state/gameState';

interface SpiderTopBarProps {
  /** Remaining cards in the stock (dealt 10 at a time) */
  stock: CardType[];
  /** Completed King→Ace runs */
  foundations: CardType[][];
  /** Whether a deal is currently allowed */
  canDeal: boolean;
  /** Deal a row from the stock */
  onDeal: () => void;
  layoutSizes: LayoutSizes;
}

/**
 * Top bar for Spider: the stock pile (click to deal) on the left and the eight
 * completed-run foundations on the right.
 */
export const SpiderTopBar: React.FC<SpiderTopBarProps> = ({
  stock,
  foundations,
  canDeal,
  onDeal,
  layoutSizes,
}) => {
  const { cardWidth, cardHeight, fontSize } = layoutSizes;
  const dealsRemaining = Math.ceil(stock.length / 10);

  const stockTitle = canDeal
    ? 'Click to deal one card to every column'
    : stock.length === 0
      ? 'No more cards to deal'
      : 'Fill every column before dealing';

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '20px',
        gap: '12px',
        flexWrap: 'wrap',
      }}
    >
      {/* Stock pile */}
      <div style={{ position: 'relative', opacity: canDeal ? 1 : 0.55 }} title={stockTitle}>
        {stock.length > 0 ? (
          <CardBack
            cardWidth={cardWidth}
            cardHeight={cardHeight}
            onClick={canDeal ? onDeal : undefined}
          />
        ) : (
          <EmptyCell cardWidth={cardWidth} cardHeight={cardHeight} label="∅" />
        )}
        {dealsRemaining > 0 && (
          <div
            style={{
              position: 'absolute',
              bottom: '4px',
              right: '4px',
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              color: 'white',
              borderRadius: '12px',
              padding: '2px 8px',
              fontSize: `${Math.max(11, cardWidth * 0.2)}px`,
              fontWeight: 'bold',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
            title={`${dealsRemaining} deal${dealsRemaining > 1 ? 's' : ''} left`}
          >
            ×{dealsRemaining}
          </div>
        )}
      </div>

      {/* Completed runs (foundations) */}
      <div style={{ display: 'flex', gap: `${Math.max(2, layoutSizes.cardGap * 0.5)}px` }}>
        {Array.from({ length: NUM_FOUNDATIONS }, (_, i) => {
          const run = foundations[i];
          // The King (rank 13) sits at the bottom of a completed run.
          const topCard = run && run.length === RUN_LENGTH ? run[0] : null;
          return topCard ? (
            <Card
              key={i}
              card={topCard}
              faceUp={true}
              cardWidth={cardWidth}
              cardHeight={cardHeight}
              fontSize={fontSize}
            />
          ) : (
            <EmptyCell key={i} cardWidth={cardWidth} cardHeight={cardHeight} />
          );
        })}
      </div>
    </div>
  );
};
