/**
 * Dragging card preview component
 * Renders a card following the cursor/touch during drag operations
 * Used by both FreeCell and Klondike
 * Enhanced with framer-motion for smooth physics-based animations
 */

import React from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

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

  /** Optional spring physics configuration */
  springConfig?: {
    stiffness: number;
    damping: number;
  };

  /** Whether to use spring physics (defaults to true) */
  useSpring?: boolean;
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
  springConfig = { stiffness: 300, damping: 25 },
  useSpring: enableSpring = true,
}) => {
  // Don't render if not dragging or no position
  if (!isActive || !position || !children) {
    return null;
  }

  // Use framer-motion spring physics for smooth dragging
  const x = useMotionValue(position.x - cardWidth / 2);
  const y = useMotionValue(position.y - cardHeight / 2);

  // Apply spring physics if enabled
  const springX = useSpring(x, enableSpring ? springConfig : { stiffness: 1000, damping: 50 });
  const springY = useSpring(y, enableSpring ? springConfig : { stiffness: 1000, damping: 50 });

  // Update motion values when position changes
  React.useEffect(() => {
    if (position) {
      x.set(position.x - cardWidth / 2);
      y.set(position.y - cardHeight / 2);
    }
  }, [position, cardWidth, cardHeight, x, y]);

  return (
    <motion.div
      style={{
        position: 'fixed',
        left: enableSpring ? springX : x,
        top: enableSpring ? springY : y,
        pointerEvents: 'none', // Don't block drop targets
        zIndex,
        opacity,
      }}
    >
      {children}
    </motion.div>
  );
};
