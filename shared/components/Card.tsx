import React, { useEffect } from 'react';
import { type Card as CardType } from '../types/Card';
import { getCardColors, getCardBoxShadow } from '../utils/highContrastStyles';
import { CardBack } from './CardBack';

// Inject shake animation CSS once
let shakeAnimationInjected = false;
function injectShakeAnimation() {
  if (shakeAnimationInjected) return;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
      20%, 40%, 60%, 80% { transform: translateX(8px); }
    }
  `;
  document.head.appendChild(style);
  shakeAnimationInjected = true;
}

interface CardProps {
  card: CardType;
  faceUp?: boolean; // NEW: Whether card is face-up (defaults to true for backwards compatibility)
  cardBackTheme?: 'blue' | 'red' | 'custom'; // NEW: Theme for card back
  onClick?: () => void;
  isSelected?: boolean;
  isHighlighted?: boolean;
  isDragging?: boolean;
  isInvalidMove?: boolean; // NEW: Trigger shake animation for invalid move feedback
  style?: React.CSSProperties;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
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
  // Drop target data attributes (for touch drag-and-drop)
  'data-drop-target-type'?: string;
  'data-drop-target-index'?: number;
  'data-drop-target-card-index'?: number;
  'data-drop-target-card-count'?: number;
}

export const Card: React.FC<CardProps> = ({
  card,
  faceUp = true, // Default to face-up (FreeCell behavior, backwards compatible)
  cardBackTheme = 'blue',
  onClick,
  isSelected = false,
  isHighlighted = false,
  isDragging = false,
  isInvalidMove = false,
  style = {},
  onDragStart,
  onDragEnd,
  onDragOver,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onTouchCancel,
  draggable = true,
  cardWidth = 60,
  cardHeight = 84,
  fontSize = { large: 26, medium: 24, small: 14 },
  highContrastMode = false,
  'data-drop-target-type': dropTargetType,
  'data-drop-target-index': dropTargetIndex,
  'data-drop-target-card-index': dropTargetCardIndex,
  'data-drop-target-card-count': dropTargetCardCount,
}) => {
  // Inject shake animation CSS on first render
  useEffect(() => {
    injectShakeAnimation();
  }, []);

  // If face-down, render CardBack component
  if (!faceUp) {
    return (
      <CardBack
        cardWidth={cardWidth}
        cardHeight={cardHeight}
        theme={cardBackTheme}
        className={isDragging ? 'dragging' : ''}
        onClick={onClick}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        draggable={draggable && onClick !== undefined}
        isInvalidMove={isInvalidMove}
      />
    );
  }

  // Face-up rendering (existing logic)
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
    animation: isInvalidMove ? 'shake 0.4s cubic-bezier(.36,.07,.19,.97) both' : 'none',
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
      onDragOver={onDragOver}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchCancel}
      draggable={draggable && onClick !== undefined}
      title={`${card.value}${card.suit}`}
      data-drop-target-type={dropTargetType}
      data-drop-target-index={dropTargetIndex}
      data-drop-target-card-index={dropTargetCardIndex}
      data-drop-target-card-count={dropTargetCardCount}
    >
      <div
        style={{
          position: 'absolute',
          top: `${cardHeight * 0.05}px`,
          left: `${cardWidth * 0.1}px`,
          fontSize: `${fontSize.small}px`,
          lineHeight: '1',
        }}
      >
        <div>
          {card.value}
          {card.suit}
        </div>
      </div>
      <div style={{ fontSize: `${fontSize.large}px` }}>{card.suit}</div>
      <div
        style={{
          position: 'absolute',
          bottom: `${cardHeight * 0.05}px`,
          right: `${cardWidth * 0.1}px`,
          fontSize: `${fontSize.small}px`,
          lineHeight: '1',
          transform: 'rotate(180deg)',
        }}
      >
        <div>
          {card.value}
          {card.suit}
        </div>
      </div>
    </div>
  );
};
