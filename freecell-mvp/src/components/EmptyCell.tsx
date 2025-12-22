import React from 'react';

interface EmptyCellProps {
  onClick?: () => void;
  label?: string;
  style?: React.CSSProperties;
  cardWidth?: number;
  cardHeight?: number;
}

export const EmptyCell: React.FC<EmptyCellProps> = ({
  onClick,
  label,
  style = {},
  cardWidth = 60,
  cardHeight = 84,
}) => {
  const borderRadius = cardWidth * 0.1;
  const fontSize = cardWidth * 0.2;

  const cellStyle: React.CSSProperties = {
    width: `${cardWidth}px`,
    height: `${cardHeight}px`,
    borderRadius: `${borderRadius}px`,
    backgroundColor: '#f5f5f5',
    border: '2px dashed #ccc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: `${fontSize}px`,
    color: '#999',
    cursor: onClick ? 'pointer' : 'default',
    userSelect: 'none',
    transition: 'all 0.15s ease',
    ...style,
  };

  return (
    <div
      style={cellStyle}
      onClick={onClick}
    >
      {label && <span>{label}</span>}
    </div>
  );
};
