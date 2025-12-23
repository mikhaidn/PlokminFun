/**
 * Dragging card preview component
 * Renders a card following the cursor/touch during drag operations
 * Used by both FreeCell and Klondike
 */

import React from 'react';

interface DraggingCardPreviewProps {
  /** Current touch/mouse position (null if not dragging) */
  position: { x: number; y: number } | null;

  /** Whether dragging is active */
  isActive: boolean;

  /** Card width for centering the preview */
  cardWidth: number;

  /** Card height for centering the preview */
  cardHeight: number;

  /** Card element to render (provided by parent game) */
  children: React.ReactNode;

  /** Optional z-index (defaults to 1000) */
  zIndex?: number;

  /** Optional opacity (defaults to 0.8) */
  opacity?: number;
}

/**
 * Preview component for dragging cards
 *
 * @example
 * ```tsx
 * <DraggingCardPreview
 *   position={touchPosition}
 *   isActive={touchDragging}
 *   cardWidth={layoutSizes.cardWidth}
 *   cardHeight={layoutSizes.cardHeight}
 * >
 *   {draggingCard && (
 *     <Card
 *       card={getCardAtLocation(draggingCard)}
 *       cardWidth={layoutSizes.cardWidth}
 *       cardHeight={layoutSizes.cardHeight}
 *       fontSize={layoutSizes.fontSize}
 *       isSelected={true}
 *     />
 *   )}
 * </DraggingCardPreview>
 * ```
 */
export const DraggingCardPreview: React.FC<DraggingCardPreviewProps> = ({
  position,
  isActive,
  cardWidth,
  cardHeight,
  children,
  zIndex = 1000,
  opacity = 0.8,
}) => {
  // Don't render if not dragging or no position
  if (!isActive || !position || !children) {
    return null;
  }

  const previewStyle: React.CSSProperties = {
    position: 'fixed',
    left: position.x - cardWidth / 2,
    top: position.y - cardHeight / 2,
    pointerEvents: 'none', // Don't block drop targets
    zIndex,
    opacity,
    transition: 'none', // Instant position updates for smooth dragging
  };

  return <div style={previewStyle}>{children}</div>;
};
