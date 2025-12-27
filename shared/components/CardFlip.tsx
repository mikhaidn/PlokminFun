/**
 * CardFlip component with 3D CSS transforms
 * RFC-005 Phase 3: Smooth card flip animations for Klondike stock pile
 *
 * Features:
 * - 3D CSS transforms (hardware-accelerated)
 * - Configurable duration (300ms default)
 * - Respects prefers-reduced-motion
 * - Mobile-optimized
 */

import React, { useEffect, useState } from 'react';
import { Card } from './Card';
import { CardBack } from './CardBack';
import type { Card as CardType } from '../types/Card';

export interface CardFlipProps {
  /** The card to display */
  card: CardType;

  /** Whether the card is face-up */
  faceUp: boolean;

  /** Card dimensions */
  cardWidth?: number;
  cardHeight?: number;

  /** Font sizes for card values */
  fontSize?: {
    large: number;
    medium: number;
    small: number;
  };

  /** Flip animation duration in milliseconds (default: 300) */
  flipDuration?: number;

  /** Card back theme (blue, red, custom) */
  cardBackTheme?: 'blue' | 'red' | 'custom';

  /** High contrast mode */
  highContrastMode?: boolean;

  /** Click handler */
  onClick?: () => void;

  /** Selection state */
  isSelected?: boolean;
  isHighlighted?: boolean;

  /** Drag handlers */
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  draggable?: boolean;

  /** Touch handlers */
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;

  /** Accessibility */
  'aria-label'?: string;

  /** Additional styles */
  style?: React.CSSProperties;
}

/**
 * Check if user prefers reduced motion
 */
const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  return mediaQuery?.matches ?? false;
};

/**
 * CardFlip component
 *
 * Renders a card with 3D flip animation between face-up and face-down states.
 * Uses CSS transforms for smooth, hardware-accelerated animations.
 *
 * @example
 * ```tsx
 * <CardFlip
 *   card={card}
 *   faceUp={isFlipped}
 *   cardWidth={60}
 *   cardHeight={84}
 *   flipDuration={300}
 *   onClick={() => handleFlip()}
 * />
 * ```
 */
export const CardFlip: React.FC<CardFlipProps> = ({
  card,
  faceUp,
  cardWidth = 60,
  cardHeight = 84,
  fontSize = { large: 26, medium: 24, small: 14 },
  flipDuration = 300,
  cardBackTheme = 'blue',
  highContrastMode = false,
  onClick,
  isSelected = false,
  isHighlighted = false,
  onDragStart,
  onDragEnd,
  draggable = true,
  onTouchStart,
  onTouchEnd,
  'aria-label': ariaLabel,
  style = {},
}) => {
  const [isFlipped, setIsFlipped] = useState(faceUp);
  const reducedMotion = prefersReducedMotion();

  // Update flipped state when faceUp prop changes
  useEffect(() => {
    setIsFlipped(faceUp);
  }, [faceUp]);

  // Container styles (3D perspective)
  const containerStyle: React.CSSProperties = {
    width: `${cardWidth}px`,
    height: `${cardHeight}px`,
    perspective: '1000px',
    position: 'relative',
    ...style,
  };

  // Inner flip container styles
  const innerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    transformStyle: 'preserve-3d',
    transition: reducedMotion ? 'none' : `transform ${flipDuration}ms ease-in-out`,
    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
  };

  // Front and back face styles
  const faceStyle: React.CSSProperties = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden', // Safari support
  };

  const frontStyle: React.CSSProperties = {
    ...faceStyle,
    transform: 'rotateY(180deg)',
  };

  const backStyle: React.CSSProperties = {
    ...faceStyle,
    transform: 'rotateY(0deg)',
  };

  return (
    <div
      className="card-flip-container"
      style={containerStyle}
      aria-label={ariaLabel}
    >
      <div className={`card-flip-inner ${isFlipped ? 'flipped' : ''}`} style={innerStyle}>
        {/* Front face (card face) */}
        <div className="card-flip-front" style={frontStyle}>
          <Card
            card={card}
            faceUp={true}
            cardWidth={cardWidth}
            cardHeight={cardHeight}
            fontSize={fontSize}
            highContrastMode={highContrastMode}
            onClick={onClick}
            isSelected={isSelected}
            isHighlighted={isHighlighted}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            draggable={draggable}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          />
        </div>

        {/* Back face (card back) */}
        <div className="card-flip-back" style={backStyle}>
          <CardBack
            cardWidth={cardWidth}
            cardHeight={cardHeight}
            theme={cardBackTheme}
            onClick={onClick}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            draggable={draggable}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            data-testid="card-back"
            className={`theme-${cardBackTheme}`}
          />
        </div>
      </div>
    </div>
  );
};
