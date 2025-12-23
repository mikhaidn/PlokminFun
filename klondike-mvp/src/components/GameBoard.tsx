import React, { useState, useEffect, useCallback } from 'react';
import { type KlondikeGameState, type Location, isGameWon } from '../state/gameState';
import { drawFromStock, moveCards, autoMoveToFoundations } from '../state/gameActions';
import { Tableau } from './Tableau';
import { StockWaste } from './StockWaste';
import { FoundationArea } from './FoundationArea';
import { calculateLayoutSizes, type LayoutSizes } from '../utils/responsiveLayout';
import { GameControls } from '@cardgames/shared';
import { useGameHistory } from '@cardgames/shared';
import { version } from '../../package.json';

interface GameBoardProps {
  initialState: KlondikeGameState;
  onNewGame: () => void;
}

type SelectedCard =
  | { type: 'waste' }
  | { type: 'tableau'; columnIndex: number; cardCount: number }
  | { type: 'foundation'; index: number }
  | null;

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

  const [selectedCard, setSelectedCard] = useState<SelectedCard>(null);

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
      setSelectedCard(null);
    }
  };

  // Handle waste click (select card)
  const handleWasteClick = () => {
    if (gameState.waste.length === 0) return;

    if (selectedCard?.type === 'waste') {
      setSelectedCard(null);
    } else {
      setSelectedCard({ type: 'waste' });
    }
  };

  // Handle tableau column click
  const handleTableauClick = (columnIndex: number, cardIndex: number) => {
    const column = gameState.tableau[columnIndex];
    const faceDownCount = column.cards.length - column.faceUpCount;

    // Can't select face-down cards
    if (cardIndex < faceDownCount) return;

    // If clicking same card, deselect
    if (
      selectedCard?.type === 'tableau' &&
      selectedCard.columnIndex === columnIndex &&
      cardIndex === column.cards.length - selectedCard.cardCount
    ) {
      setSelectedCard(null);
      return;
    }

    // If a card is selected, try to move it here
    if (selectedCard) {
      const destination: Location = { type: 'tableau', index: columnIndex };

      if (selectedCard.type === 'waste') {
        const newState = moveCards(gameState, { type: 'waste' }, destination, 1);
        if (newState) {
          pushState(newState);
          setSelectedCard(null);
        }
      } else if (selectedCard.type === 'tableau') {
        const source: Location = { type: 'tableau', index: selectedCard.columnIndex };
        const newState = moveCards(gameState, source, destination, selectedCard.cardCount);
        if (newState) {
          pushState(newState);
          setSelectedCard(null);
        }
      } else if (selectedCard.type === 'foundation') {
        const source: Location = { type: 'foundation', index: selectedCard.index };
        const newState = moveCards(gameState, source, destination, 1);
        if (newState) {
          pushState(newState);
          setSelectedCard(null);
        }
      }
    } else {
      // Select cards from this position to end
      const cardCount = column.cards.length - cardIndex;
      setSelectedCard({ type: 'tableau', columnIndex, cardCount });
    }
  };

  // Handle foundation click
  const handleFoundationClick = (foundationIndex: number) => {
    // If a card is selected, try to move it to foundation
    if (selectedCard) {
      const destination: Location = { type: 'foundation', index: foundationIndex };

      if (selectedCard.type === 'waste') {
        const newState = moveCards(gameState, { type: 'waste' }, destination, 1);
        if (newState) {
          pushState(newState);
          setSelectedCard(null);
        }
      } else if (selectedCard.type === 'tableau') {
        // Only single cards to foundation
        if (selectedCard.cardCount === 1) {
          const source: Location = { type: 'tableau', index: selectedCard.columnIndex };
          const newState = moveCards(gameState, source, destination, 1);
          if (newState) {
            pushState(newState);
            setSelectedCard(null);
          }
        }
      }
    } else {
      // Select top card from foundation
      const foundation = gameState.foundations[foundationIndex];
      if (foundation.length > 0) {
        setSelectedCard({ type: 'foundation', index: foundationIndex });
      }
    }
  };

  // Auto-complete (move all safe cards to foundations)
  const handleAutoComplete = () => {
    const newState = autoMoveToFoundations(gameState);
    if (newState !== gameState) {
      pushState(newState);
      setSelectedCard(null);
    }
  };

  // Reset game to initial state
  const handleResetGame = useCallback(() => {
    resetHistory();
    setSelectedCard(null);
  }, [resetHistory]);

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
          isWasteSelected={selectedCard?.type === 'waste'}
          layoutSizes={layoutSizes}
        />

        <FoundationArea
          foundations={gameState.foundations}
          onClick={handleFoundationClick}
          selectedFoundation={
            selectedCard?.type === 'foundation' ? selectedCard.index : null
          }
          layoutSizes={layoutSizes}
        />
      </div>

      {/* Tableau */}
      <Tableau
        tableau={gameState.tableau}
        onClick={handleTableauClick}
        selectedColumn={
          selectedCard?.type === 'tableau'
            ? {
                columnIndex: selectedCard.columnIndex,
                cardCount: selectedCard.cardCount,
              }
            : null
        }
        layoutSizes={layoutSizes}
        gameState={gameState}
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
