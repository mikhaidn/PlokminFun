import React from 'react';

interface EmptyCellProps {
  onClick?: () => void;
  label?: string;
  style?: React.CSSProperties;
  cardWidth?: number;
  cardHeight?: number;
  isHighlighted?: boolean;
  title?: string;
  // Support for drop target attributes (for touch drag on mobile)
  'data-drop-target-type'?: string;
  'data-drop-target-index'?: number;
  'data-drop-target-card-index'?: number;
  'data-drop-target-card-count'?: number;
}

export const EmptyCell: React.FC<EmptyCellProps> = ({
  onClick,
  label,
  style = {},
  cardWidth = 60,
  cardHeight = 84,
  isHighlighted = false,
  title,
  ...dataAttributes
}) => {
  const borderRadius = cardWidth * 0.1;
  const fontSize = cardWidth * 0.2;

  const cellStyle: React.CSSProperties = {
    width: `${cardWidth}px`,
    height: `${cardHeight}px`,
    borderRadius: `${borderRadius}px`,
    backgroundColor: isHighlighted ? '#ffeb3b' : '#f5f5f5',
    border: isHighlighted ? '3px solid #fbc02d' : '2px dashed #ccc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: `${fontSize}px`,
    color: '#999',
    cursor: onClick ? 'pointer' : 'default',
    userSelect: 'none',
    transition: 'all 0.15s ease',
    boxShadow: isHighlighted ? '0 0 12px rgba(251, 192, 45, 0.8)' : 'none',
    ...style,
  };

  return (
    <div style={cellStyle} onClick={onClick} title={title} {...dataAttributes}>
      {label && <span>{label}</span>}
    </div>
  );
};
