import React from 'react';
import { type Card as CardType } from '../core/types';
import { isRed } from '../rules/validation';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  isSelected?: boolean;
  isHighlighted?: boolean;
  isDragging?: boolean;
  style?: React.CSSProperties;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  draggable?: boolean;
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
  draggable = true,
}) => {
  const red = isRed(card);

  const cardStyle: React.CSSProperties = {
    width: '60px',
    height: '84px',
    borderRadius: '6px',
    backgroundColor: isHighlighted ? '#e8f5e9' : 'white',
    border: isSelected ? '2px solid #4caf50' : isHighlighted ? '2px solid #4caf50' : '1px solid #ccc',
    boxShadow: isSelected ? '0 0 8px rgba(76, 175, 80, 0.5)' : isHighlighted ? '0 0 4px rgba(76, 175, 80, 0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    color: red ? '#c41e3a' : '#1a1a2e',
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
      draggable={draggable && onClick !== undefined}
      title={`${card.value}${card.suit}`}
    >
      <div style={{ position: 'absolute', top: '4px', left: '6px', fontSize: '14px', lineHeight: '1' }}>
        <div>{card.value}</div>
        <div style={{ fontSize: '12px' }}>{card.suit}</div>
      </div>
      <div style={{ fontSize: '26px' }}>{card.suit}</div>
      <div style={{ position: 'absolute', bottom: '4px', right: '6px', fontSize: '14px', lineHeight: '1', transform: 'rotate(180deg)' }}>
        <div>{card.value}</div>
        <div style={{ fontSize: '12px' }}>{card.suit}</div>
      </div>
    </div>
  );
};
