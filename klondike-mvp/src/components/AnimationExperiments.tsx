/**
 * RFC-005 Phase 1 - Day 1: Animation Experiments
 *
 * This component tests three animation patterns for the unified game builder:
 * 1. Card drag with spring physics (natural, bouncy feel)
 * 2. Card flip animation (3D rotateY effect for revealing cards)
 * 3. Win celebration (confetti effect + card cascade)
 *
 * Library choice: framer-motion
 * Reasoning: Better DX for rapid prototyping, excellent built-in drag support,
 * easier to iterate on feel. Bundle size optimization can come later.
 */

import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import Confetti from 'react-confetti';
import { Card, type Suit, type Value } from '@plokmin/shared';

// Card type matching shared library structure
interface CardType {
  suit: Suit;
  value: Value;
  rank: number;
  id: string;
}

export const AnimationExperiments: React.FC = () => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeExperiment, setActiveExperiment] = useState<'drag' | 'flip' | 'win'>('drag');

  // Sample cards for testing
  const sampleCard: CardType = { suit: '♥', value: 'A', rank: 1, id: 'A♥' };
  const hiddenCard: CardType = { suit: '♠', value: 'K', rank: 13, id: 'K♠' };

  // =============================================================================
  // Experiment 1: Card Drag with Spring Physics
  // =============================================================================

  const cardX = useMotionValue(0);
  const cardY = useMotionValue(0);

  // Add subtle rotation based on drag position for more natural feel
  const rotateX = useTransform(cardY, [-100, 100], [5, -5]);
  const rotateY = useTransform(cardX, [-100, 100], [-5, 5]);

  // =============================================================================
  // Experiment 2: Card Flip Animation
  // =============================================================================

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  // =============================================================================
  // Experiment 3: Win Celebration
  // =============================================================================

  const triggerWinCelebration = () => {
    setShowConfetti(true);

    // Stop confetti after 5 seconds
    setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
  };

  // Card cascade animation - stagger multiple cards
  const suits: Suit[] = ['♥', '♦', '♣', '♠'];
  const values: Value[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const cascadeCards: CardType[] = Array.from({ length: 13 }, (_, i) => {
    const suit = suits[i % 4];
    const value = values[i];
    return {
      suit,
      value,
      rank: i + 1,
      id: `${value}${suit}`,
    };
  });

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#1e40af',
        padding: '24px',
        color: 'white',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '8px' }}>
          RFC-005 Animation Experiments
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
          Testing animation patterns for the unified game builder
        </p>
      </div>

      {/* Experiment selector */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '48px',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => setActiveExperiment('drag')}
          style={{
            padding: '12px 24px',
            backgroundColor: activeExperiment === 'drag' ? '#3b82f6' : 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: activeExperiment === 'drag' ? 'bold' : 'normal',
          }}
        >
          1. Spring Drag
        </button>
        <button
          onClick={() => setActiveExperiment('flip')}
          style={{
            padding: '12px 24px',
            backgroundColor: activeExperiment === 'flip' ? '#3b82f6' : 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: activeExperiment === 'flip' ? 'bold' : 'normal',
          }}
        >
          2. Card Flip
        </button>
        <button
          onClick={() => setActiveExperiment('win')}
          style={{
            padding: '12px 24px',
            backgroundColor: activeExperiment === 'win' ? '#3b82f6' : 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: activeExperiment === 'win' ? 'bold' : 'normal',
          }}
        >
          3. Win Celebration
        </button>
      </div>

      {/* Experiment containers */}
      <div
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '12px',
          padding: '48px',
          minHeight: '500px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Experiment 1: Spring Drag */}
        {activeExperiment === 'drag' && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Spring Physics Drag</h2>
            <p style={{ marginBottom: '32px', color: 'rgba(255, 255, 255, 0.8)' }}>
              Drag the card and release. Notice the spring bounce and subtle rotation.
            </p>

            <motion.div
              drag
              dragConstraints={{ left: -200, right: 200, top: -200, bottom: 200 }}
              dragElastic={0.1}
              dragTransition={{
                bounceStiffness: 300,
                bounceDamping: 20,
                power: 0.2,
              }}
              style={{
                x: cardX,
                y: cardY,
                rotateX,
                rotateY,
                cursor: 'grab',
                display: 'inline-block',
              }}
              whileDrag={{
                cursor: 'grabbing',
                scale: 1.05,
                zIndex: 10,
              }}
              whileHover={{ scale: 1.02 }}
            >
              <Card
                card={sampleCard}
                faceUp={true}
                cardWidth={100}
                cardHeight={140}
                fontSize={{ large: 32, medium: 24, small: 16 }}
              />
            </motion.div>

            <div
              style={{ marginTop: '32px', fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}
            >
              <p>Parameters:</p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li>bounceStiffness: 300</li>
                <li>bounceDamping: 20</li>
                <li>dragElastic: 0.1</li>
                <li>Subtle 3D rotation on drag</li>
              </ul>
            </div>
          </div>
        )}

        {/* Experiment 2: Card Flip */}
        {activeExperiment === 'flip' && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>3D Card Flip</h2>
            <p style={{ marginBottom: '32px', color: 'rgba(255, 255, 255, 0.8)' }}>
              Click the card to flip it and reveal the face.
            </p>

            <motion.div
              onClick={flipCard}
              style={{
                cursor: 'pointer',
                perspective: '1000px',
                display: 'inline-block',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{
                  duration: 0.4,
                  ease: [0.4, 0, 0.2, 1], // Custom easing for smooth flip
                }}
                style={{
                  transformStyle: 'preserve-3d',
                  position: 'relative',
                }}
              >
                {/* Back of card */}
                <motion.div
                  style={{
                    backfaceVisibility: 'hidden',
                    position: isFlipped ? 'absolute' : 'relative',
                    top: 0,
                    left: 0,
                  }}
                >
                  <Card
                    card={hiddenCard}
                    faceUp={false}
                    cardWidth={100}
                    cardHeight={140}
                    fontSize={{ large: 32, medium: 24, small: 16 }}
                  />
                </motion.div>

                {/* Front of card */}
                <motion.div
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    position: !isFlipped ? 'absolute' : 'relative',
                    top: 0,
                    left: 0,
                  }}
                >
                  <Card
                    card={sampleCard}
                    faceUp={true}
                    cardWidth={100}
                    cardHeight={140}
                    fontSize={{ large: 32, medium: 24, small: 16 }}
                  />
                </motion.div>
              </motion.div>
            </motion.div>

            <div
              style={{ marginTop: '32px', fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}
            >
              <p>Parameters:</p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li>duration: 0.4s</li>
                <li>easing: cubic-bezier(0.4, 0, 0.2, 1)</li>
                <li>3D perspective: 1000px</li>
                <li>backfaceVisibility: hidden</li>
              </ul>
            </div>
          </div>
        )}

        {/* Experiment 3: Win Celebration */}
        {activeExperiment === 'win' && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Win Celebration</h2>
            <p style={{ marginBottom: '32px', color: 'rgba(255, 255, 255, 0.8)' }}>
              Confetti explosion + card cascade animation
            </p>

            <button
              onClick={triggerWinCelebration}
              style={{
                padding: '16px 32px',
                fontSize: '1.25rem',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                marginBottom: '48px',
              }}
            >
              🎉 Trigger Celebration
            </button>

            {/* Confetti */}
            {showConfetti && (
              <Confetti
                width={window.innerWidth}
                height={window.innerHeight}
                numberOfPieces={300}
                recycle={false}
                gravity={0.3}
              />
            )}

            {/* Card cascade */}
            {showConfetti && (
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  maxWidth: '600px',
                }}
              >
                {cascadeCards.map((card, index) => (
                  <motion.div
                    key={`${card.suit}-${card.rank}`}
                    initial={{
                      opacity: 0,
                      y: -100,
                      rotate: -180,
                      scale: 0,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      rotate: 0,
                      scale: 1,
                    }}
                    transition={{
                      delay: index * 0.05, // Stagger effect
                      duration: 0.6,
                      ease: [0.34, 1.56, 0.64, 1], // Bounce easing
                    }}
                  >
                    <Card
                      card={card}
                      faceUp={true}
                      cardWidth={60}
                      cardHeight={84}
                      fontSize={{ large: 20, medium: 16, small: 10 }}
                    />
                  </motion.div>
                ))}
              </div>
            )}

            <div
              style={{ marginTop: '32px', fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}
            >
              <p>Parameters:</p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li>Confetti: 300 pieces, 5s duration</li>
                <li>Card cascade: 13 cards staggered by 50ms</li>
                <li>Bounce easing: cubic-bezier(0.34, 1.56, 0.64, 1)</li>
                <li>Combined rotation + scale + position animation</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Performance notes */}
      <div
        style={{
          marginTop: '32px',
          padding: '16px',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ fontSize: '1rem', marginBottom: '8px' }}>Performance Notes:</h3>
        <ul style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6 }}>
          <li>All animations use GPU-accelerated transforms (translateX/Y, rotate, scale)</li>
          <li>No layout recalculations during animations</li>
          <li>framer-motion automatically optimizes with will-change</li>
          <li>Open DevTools → Performance → Record to measure 60fps</li>
        </ul>
      </div>

      {/* Observations section */}
      <div
        style={{
          marginTop: '32px',
          padding: '16px',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ fontSize: '1rem', marginBottom: '8px' }}>Observations:</h3>
        <ul style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6 }}>
          <li>✅ Spring drag feels natural and responsive</li>
          <li>✅ Card flip is smooth with good 3D perspective</li>
          <li>✅ Win celebration is delightful without being overwhelming</li>
          <li>⚠️ Confetti could be optimized (consider reducing particles on mobile)</li>
          <li>💡 Drag rotation adds polish - consider for actual game</li>
          <li>💡 Flip duration (0.4s) feels right - not too fast or slow</li>
        </ul>
      </div>

      {/* Back to game link */}
      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <a
          href="/?game=klondike"
          style={{
            color: '#3b82f6',
            textDecoration: 'underline',
            fontSize: '0.875rem',
          }}
        >
          ← Back to Game
        </a>
      </div>
    </div>
  );
};
