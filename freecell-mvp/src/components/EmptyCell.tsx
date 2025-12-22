import React from 'react';

interface EmptyCellProps {
  onClick?: () => void;
  label?: string;
  style?: React.CSSProperties;
}

export const EmptyCell: React.FC<EmptyCellProps> = ({
  onClick,
  label,
  style = {},
}) => {
  const cellStyle: React.CSSProperties = {
    width: '60px',
    height: '84px',
    borderRadius: '6px',
    backgroundColor: '#f5f5f5',
    border: '2px dashed #ccc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
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
