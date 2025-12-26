/**
 * Win celebration component
 * Displays confetti and visual celebration effects when a game is won
 * Integrates with useGameAnimations hook and AnimationConfig
 */

import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';

interface WinCelebrationProps {
  /** Whether the celebration is active */
  isActive: boolean;

  /** Callback when celebration completes */
  onComplete?: () => void;

  /** Duration in milliseconds (defaults to 3000) */
  duration?: number;

  /** Window width for confetti bounds (defaults to window.innerWidth) */
  width?: number;

  /** Window height for confetti bounds (defaults to window.innerHeight) */
  height?: number;

  /** Number of confetti pieces (defaults to 200) */
  numberOfPieces?: number;

  /** Confetti colors (defaults to colorful mix) */
  colors?: string[];

  /** Whether to use gravity (defaults to true) */
  gravity?: number;

  /** Confetti recycle behavior (defaults to false after initial burst) */
  recycle?: boolean;
}

/**
 * Celebration component for game wins
 *
 * @example
 * ```tsx
 * const { state, handlers } = useGameAnimations(config.animations);
 *
 * <WinCelebration
 *   isActive={state.celebrationActive}
 *   onComplete={() => console.log('Celebration finished!')}
 *   duration={3000}
 * />
 * ```
 */
export const WinCelebration: React.FC<WinCelebrationProps> = ({
  isActive,
  onComplete,
  duration = 3000,
  width = typeof window !== 'undefined' ? window.innerWidth : 800,
  height = typeof window !== 'undefined' ? window.innerHeight : 600,
  numberOfPieces = 200,
  colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'],
  gravity = 0.3,
  recycle = false,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isActive) {
      // Start confetti
      setShowConfetti(true);

      // Stop confetti after duration
      const timer = setTimeout(() => {
        setShowConfetti(false);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setShowConfetti(false);
    }
  }, [isActive, duration, onComplete]);

  if (!showConfetti) {
    return null;
  }

  return (
    <Confetti
      width={width}
      height={height}
      numberOfPieces={numberOfPieces}
      colors={colors}
      gravity={gravity}
      recycle={recycle}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    />
  );
};
