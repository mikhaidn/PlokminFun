import React from 'react';
import { type Card as CardType } from '../core/types';
import { getCardColors, getCardBoxShadow } from '../utils/highContrastStyles';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  isSelected?: boolean;
  isHighlighted?: boolean;
  isDragging?: boolean;
  style?: React.CSSProperties;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchMove?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
  onTouchCancel?: (e: React.TouchEvent) => void;
  draggable?: boolean;
  // Responsive sizing
  cardWidth?: number;
  cardHeight?: number;
  fontSize?: {
    large: number;
    medium: number;
    small: number;
  };
  // Accessibility
  highContrastMode?: boolean;
}

export const Card: React.FC<CardProps> = ({
  card,
  onClick,
  isSelected = false,
  isHighlighted = false,
  isDragging = false,
  style = {},
  onDragStart,
  onDragEnd,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onTouchCancel,
  draggable = true,
  cardWidth = 60,
  cardHeight = 84,
  fontSize = { large: 26, medium: 24, small: 14 },
  highContrastMode = false,
}) => {
  const borderRadius = cardWidth * 0.1; // 10% of width
  const colors = getCardColors(card, highContrastMode, isSelected, isHighlighted);
  const boxShadow = getCardBoxShadow(isSelected, isHighlighted, highContrastMode);

  const cardStyle: React.CSSProperties = {
    width: `${cardWidth}px`,
    height: `${cardHeight}px`,
    boxSizing: 'border-box',
    borderRadius: `${borderRadius}px`,
    backgroundColor: colors.background,
    border: `${colors.borderWidth} solid ${colors.border}`,
    boxShadow,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: `${fontSize.medium}px`,
    fontWeight: 'bold',
    color: colors.text,
    cursor: onClick || draggable ? 'pointer' : 'default',
    userSelect: 'none',
    position: 'relative',
    transition: 'all 0.15s ease',
    opacity: isDragging ? 0.5 : 1,
    ...style,
  };

  const handleClick = () => { 
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      style={cardStyle}
      onClick={handleClick}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchCancel}
      draggable={draggable && onClick !== undefined}
      title={`${card.value}${card.suit}`}
    >
      <div style={{ position: 'absolute', top: `${cardHeight * 0.05}px`, left: `${cardWidth * 0.1}px`, fontSize: `${fontSize.small}px`, lineHeight: '1' }}>
        <div>{card.value}{card.suit}</div>
      </div>
      <div style={{ fontSize: `${fontSize.large}px` }}>{card.suit}</div>
      <div style={{ position: 'absolute', bottom: `${cardHeight * 0.05}px`, right: `${cardWidth * 0.1}px`, fontSize: `${fontSize.small}px`, lineHeight: '1', transform: 'rotate(180deg)' }}>
        <div>{card.value}{card.suit}</div>
      </div>
    </div>
  );
};
