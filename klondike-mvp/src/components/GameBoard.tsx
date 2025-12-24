import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { type KlondikeGameState, isGameWon } from '../state/gameState';
import { drawFromStock, autoMoveToFoundations } from '../state/gameActions';
import { Tableau } from './Tableau';
import { StockWaste } from './StockWaste';
import { FoundationArea } from './FoundationArea';
import { calculateLayoutSizes, type LayoutSizes } from '../utils/responsiveLayout';
import {
  GameControls,
  useGameHistory,
  useCardInteraction,
  DraggingCardPreview,
  type GameLocation,
} from '@cardgames/shared';
import { Card } from './Card';
import { validateMove } from '../rules/moveValidation';
import { executeMove } from '../state/moveExecution';
import { version } from '../../package.json';

interface GameBoardProps {
  initialState: KlondikeGameState;
  onNewGame: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({ initialState, onNewGame }) => {
  // Use game history for undo/redo functionality
  const {
    currentState: gameState,
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    reset: resetHistory,
  } = useGameHistory<KlondikeGameState>({
    initialState,
    maxHistorySize: 100,
    persistKey: 'klondike-game-history',
  });

  // RFC-004 Phase 2: Shared interaction hook (feature-flagged)
  const sharedHookConfig = useMemo(() => ({
    validateMove: (from: GameLocation, to: GameLocation) => {
      return validateMove(gameState, from, to);
    },
    executeMove: (from: GameLocation, to: GameLocation) => {
      const newState = executeMove(gameState, from, to);
      if (newState) {
        pushState(newState);
      }
    },
  }), [gameState, pushState]);

  const {
    state: sharedInteractionState,
    handlers: sharedHandlers
  } = useCardInteraction<GameLocation>(sharedHookConfig);

  // Responsive layout sizing
  const [layoutSizes, setLayoutSizes] = useState<LayoutSizes>(() =>
    calculateLayoutSizes(window.innerWidth, window.innerHeight)
  );

  // Derive win state from game state
  const isWon = isGameWon(gameState);

  // Update layout sizes on window resize
  useEffect(() => {
    const handleResize = () => {
      setLayoutSizes(calculateLayoutSizes(window.innerWidth, window.innerHeight));
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Handle stock click (draw card)
  const handleStockClick = () => {
    const newState = drawFromStock(gameState);
    if (newState !== gameState) {
      pushState(newState);
    }
  };

  // Auto-complete (move all safe cards to foundations)
  const handleAutoComplete = () => {
    const newState = autoMoveToFoundations(gameState);
    if (newState !== gameState) {
      pushState(newState);
    }
  };

  // Reset game to initial state
  const handleResetGame = useCallback(() => {
    resetHistory();
  }, [resetHistory]);

  // =============================================================================
  // Card interaction handlers
  // =============================================================================

  /**
   * Waste pile click handler
   */
  const handleWasteClick = useCallback(() => {
    if (gameState.waste.length === 0) return;

    sharedHandlers.handleCardClick({
      type: 'waste',
      index: 0,
      cardCount: 1,
    });
  }, [gameState.waste.length, sharedHandlers]);

  /**
   * Tableau click handler
   */
  const handleTableauClick = useCallback((columnIndex: number, cardIndex: number) => {
    const column = gameState.tableau[columnIndex];
    const faceDownCount = column.cards.length - column.faceUpCount;

    // Can't select face-down cards
    if (cardIndex < faceDownCount) return;

    const cardCount = column.cards.length - cardIndex;
    sharedHandlers.handleCardClick({
      type: 'tableau',
      index: columnIndex,
      cardCount,
    });
  }, [gameState.tableau, sharedHandlers]);

  /**
   * Foundation click handler
   */
  const handleFoundationClick = useCallback((foundationIndex: number) => {
    sharedHandlers.handleCardClick({
      type: 'foundation',
      index: foundationIndex,
      cardCount: 1,
    });
  }, [sharedHandlers]);

  // =============================================================================
  // Drag and touch handlers
  // =============================================================================

  /**
   * Drag start handler - creates location and delegates to shared handler
   */
  const handleDragStart = useCallback((location: GameLocation) => (e: React.DragEvent) => {
    sharedHandlers.handleDragStart(location)(e);
  }, [sharedHandlers]);

  /**
   * Drag end handler
   */
  const handleDragEnd = useCallback(() => {
    sharedHandlers.handleDragEnd();
  }, [sharedHandlers]);

  /**
   * Drag over handler
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    sharedHandlers.handleDragOver(e);
  }, [sharedHandlers]);

  /**
   * Drop handler - creates location and delegates to shared handler
   */
  const handleDrop = useCallback((location: GameLocation) => (e: React.DragEvent) => {
    sharedHandlers.handleDrop(location)(e);
  }, [sharedHandlers]);

  /**
   * Touch start handler
   */
  const handleTouchStart = useCallback((location: GameLocation) => (e: React.TouchEvent) => {
    sharedHandlers.handleTouchStart(location)(e);
  }, [sharedHandlers]);

  /**
   * Touch move handler
   */
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    sharedHandlers.handleTouchMove(e);
  }, [sharedHandlers]);

  /**
   * Touch end handler
   */
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    sharedHandlers.handleTouchEnd(e);
  }, [sharedHandlers]);

  /**
   * Touch cancel handler
   */
  const handleTouchCancel = useCallback(() => {
    sharedHandlers.handleTouchCancel();
  }, [sharedHandlers]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z or Cmd+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey && canUndo) {
        e.preventDefault();
        undo();
      }
      // Ctrl+Y or Ctrl+Shift+Z or Cmd+Shift+Z for redo
      else if (
        ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')
      ) {
        if (canRedo) {
          e.preventDefault();
          redo();
        }
      }
      // U key for undo (single key shortcut)
      else if (e.key === 'u' && !e.ctrlKey && !e.metaKey && !e.altKey && canUndo) {
        e.preventDefault();
        undo();
      }
      // R key for redo (single key shortcut)
      else if (e.key === 'r' && !e.ctrlKey && !e.metaKey && !e.altKey && canRedo) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);

  const buttonHeight = 44; // WCAG AAA minimum touch target
  const isMobile = window.innerWidth < 600;

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#1e40af',
        display: 'flex',
        flexDirection: 'column',
        padding: '12px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          color: 'white',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '4px' }}>
            Klondike Solitaire
          </h1>
        </div>

        <GameControls
          moves={gameState.moves}
          seed={gameState.seed}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
          onReset={handleResetGame}
          onNewGame={onNewGame}
          showAutoComplete={true}
          onAutoComplete={handleAutoComplete}
          isMobile={isMobile}
          minButtonHeight={buttonHeight}
          buttonPadding={isMobile ? '8px 12px' : '8px 16px'}
          fontSize={isMobile ? 0.8 : 0.875}
        />
      </div>

      {/* Top Row: Stock/Waste and Foundations */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '24px',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <StockWaste
          stock={gameState.stock}
          waste={gameState.waste}
          onStockClick={handleStockClick}
          onWasteClick={handleWasteClick}
          isWasteSelected={sharedInteractionState.selectedCard?.type === 'waste'}
          layoutSizes={layoutSizes}
          draggingCard={sharedInteractionState.draggingCard}
          onDragStart={() => handleDragStart({ type: 'waste', index: 0, cardCount: 1 })}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDrop={() => handleDrop({ type: 'waste', index: 0 })}
          onTouchStart={() => handleTouchStart({ type: 'waste', index: 0, cardCount: 1 })}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
        />

        <FoundationArea
          foundations={gameState.foundations}
          onClick={handleFoundationClick}
          selectedFoundation={
            sharedInteractionState.selectedCard?.type === 'foundation'
              ? sharedInteractionState.selectedCard.index
              : null
          }
          layoutSizes={layoutSizes}
          draggingCard={sharedInteractionState.draggingCard}
          onDragStart={(index) => handleDragStart({ type: 'foundation', index, cardCount: 1 })}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDrop={(index) => handleDrop({ type: 'foundation', index })}
          onTouchStart={(index) => handleTouchStart({ type: 'foundation', index, cardCount: 1 })}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
        />
      </div>

      {/* Tableau */}
      <Tableau
        tableau={gameState.tableau}
        onClick={handleTableauClick}
        selectedColumn={
          sharedInteractionState.selectedCard?.type === 'tableau'
            ? {
                columnIndex: sharedInteractionState.selectedCard.index,
                cardCount: sharedInteractionState.selectedCard.cardCount ?? 1,
              }
            : null
        }
        layoutSizes={layoutSizes}
        gameState={gameState}
        draggingCard={sharedInteractionState.draggingCard}
        onDragStart={(columnIndex, _cardIndex, cardCount) =>
          handleDragStart({ type: 'tableau', index: columnIndex, cardCount })
        }
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDrop={(columnIndex) => handleDrop({ type: 'tableau', index: columnIndex })}
        onTouchStart={(columnIndex, _cardIndex, cardCount) =>
          handleTouchStart({ type: 'tableau', index: columnIndex, cardCount })
        }
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
      />

      {/* Win Modal */}
      {isWon && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '32px',
              borderRadius: '12px',
              textAlign: 'center',
              maxWidth: '400px',
            }}
          >
            <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: '#1e40af' }}>
              🎉 You Won!
            </h2>
            <p style={{ marginBottom: '24px', color: '#333' }}>
              Completed in {gameState.moves} moves
            </p>
            <button
              onClick={onNewGame}
              style={{
                minHeight: `${buttonHeight}px`,
                padding: '12px 24px',
                fontSize: '1rem',
              }}
            >
              New Game
            </button>
          </div>
        </div>
      )}

      {/* Touch drag preview */}
      <DraggingCardPreview
        position={sharedInteractionState.touchPosition}
        isActive={sharedInteractionState.touchDragging}
        cardWidth={layoutSizes.cardWidth}
        cardHeight={layoutSizes.cardHeight}
      >
        {sharedInteractionState.draggingCard && (() => {
          const { type, index, cardCount } = sharedInteractionState.draggingCard;
          let card = null;

          if (type === 'waste' && gameState.waste.length > 0) {
            card = gameState.waste[gameState.waste.length - 1];
          } else if (type === 'tableau' && gameState.tableau[index]) {
            const column = gameState.tableau[index];
            const startIndex = column.cards.length - (cardCount ?? 1);
            card = column.cards[startIndex];
          } else if (type === 'foundation' && gameState.foundations[index].length > 0) {
            const foundation = gameState.foundations[index];
            card = foundation[foundation.length - 1];
          }

          if (!card) return null;

          return (
            <Card
              card={card}
              faceUp={true}
              isSelected={true}
              cardWidth={layoutSizes.cardWidth}
              cardHeight={layoutSizes.cardHeight}
              fontSize={layoutSizes.fontSize}
            />
          );
        })()}
      </DraggingCardPreview>

      {/* Footer */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: '16px',
          fontSize: '0.75rem',
          color: 'rgba(255, 255, 255, 0.7)',
          textAlign: 'center',
        }}
      >
        v{version}
      </div>
    </div>
  );
};
