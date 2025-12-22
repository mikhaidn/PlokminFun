import React, { useState, useEffect, useMemo } from 'react';
import { initializeGame, checkWinCondition, type GameState } from '../state/gameState';
import {
  moveCardToFreeCell,
  moveCardFromFreeCell,
  moveCardToFoundation,
  moveCardsToTableau,
} from '../state/gameActions';
import { findSafeAutoMove } from '../rules/autoComplete';
import { getLowestPlayableCards } from '../rules/hints';
import { FreeCellArea } from './FreeCellArea';
import { FoundationArea } from './FoundationArea';
import { Tableau } from './Tableau';
import { version } from '../../package.json';

type SelectedCard =
  | { type: 'tableau'; column: number; cardIndex: number }
  | { type: 'freeCell'; index: number }
  | null;

export const GameBoard: React.FC = () => {
  const [seed, setSeed] = useState<number>(() => Date.now());
  const [prevSeed, setPrevSeed] = useState(seed);
  const [gameState, setGameState] = useState<GameState>(() => initializeGame(seed));
  const [selectedCard, setSelectedCard] = useState<SelectedCard>(null);
  const [draggingCard, setDraggingCard] = useState<SelectedCard>(null);
  const [showSeedInput, setShowSeedInput] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [inputSeed, setInputSeed] = useState('');

  // Touch drag-and-drop state
  const [touchDragging, setTouchDragging] = useState(false);
  const [touchPosition, setTouchPosition] = useState<{ x: number; y: number } | null>(null);

  // Reset game when seed changes (recommended pattern for derived state)
  if (prevSeed !== seed) {
    setPrevSeed(seed);
    setGameState(initializeGame(seed));
    setSelectedCard(null);
  }

  // Derive win condition from game state
  const showWin = useMemo(() => checkWinCondition(gameState), [gameState]);

  // Auto-move cards to foundations
  useEffect(() => {
    if (draggingCard || selectedCard) return;

    const timer = setTimeout(() => {
      const autoMove = findSafeAutoMove(gameState);
      if (autoMove) {
        let newState: GameState | null = null;

        if (autoMove.source.type === 'freeCell') {
          newState = moveCardToFoundation(
            gameState,
            'freeCell',
            autoMove.source.index,
            autoMove.foundationIndex
          );
        } else if (autoMove.source.type === 'tableau') {
          newState = moveCardToFoundation(
            gameState,
            'tableau',
            autoMove.source.column,
            autoMove.foundationIndex
          );
        }

        if (newState) {
          setGameState(newState);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [gameState, draggingCard, selectedCard]);

  // Calculate highlighted cards for hints
  const highlightedCardIds = showHints ? getLowestPlayableCards(gameState) : [];

  const handleTableauClick = (columnIndex: number, cardIndex: number) => {
    if (selectedCard) {
      // Try to move selected card to tableau
      let newState: GameState | null = null;

      if (selectedCard.type === 'freeCell') {
        newState = moveCardFromFreeCell(gameState, selectedCard.index, columnIndex);
      } else if (selectedCard.type === 'tableau') {
        const numCards = gameState.tableau[selectedCard.column].length - selectedCard.cardIndex;
        newState = moveCardsToTableau(gameState, selectedCard.column, numCards, columnIndex);
      }

      if (newState) {
        setGameState(newState);
        setSelectedCard(null);
      } else {
        setSelectedCard(null);
      }
    } else {
      // Select this card/stack
      setSelectedCard({ type: 'tableau', column: columnIndex, cardIndex });
    }
  };

  const handleEmptyColumnClick = (columnIndex: number) => {
    if (selectedCard) {
      let newState: GameState | null = null;

      if (selectedCard.type === 'freeCell') {
        newState = moveCardFromFreeCell(gameState, selectedCard.index, columnIndex);
      } else if (selectedCard.type === 'tableau') {
        const numCards = gameState.tableau[selectedCard.column].length - selectedCard.cardIndex;
        newState = moveCardsToTableau(gameState, selectedCard.column, numCards, columnIndex);
      }

      if (newState) {
        setGameState(newState);
      }
      setSelectedCard(null);
    }
  };

  const handleFreeCellClick = (index: number) => {
    if (selectedCard) {
      // Try to move to free cell
      if (selectedCard.type === 'tableau') {
        const column = gameState.tableau[selectedCard.column];
        // Only single cards can go to free cells
        if (selectedCard.cardIndex === column.length - 1) {
          const newState = moveCardToFreeCell(gameState, selectedCard.column, index);
          if (newState) {
            setGameState(newState);
          }
        }
      }
      setSelectedCard(null);
    } else if (gameState.freeCells[index]) {
      // Select from free cell
      setSelectedCard({ type: 'freeCell', index });
    }
  };

  const handleFoundationClick = (foundationIndex: number) => {
    if (selectedCard) {
      let newState: GameState | null = null;

      if (selectedCard.type === 'freeCell') {
        newState = moveCardToFoundation(gameState, 'freeCell', selectedCard.index, foundationIndex);
      } else if (selectedCard.type === 'tableau') {
        const column = gameState.tableau[selectedCard.column];
        // Only single cards can go to foundations
        if (selectedCard.cardIndex === column.length - 1) {
          newState = moveCardToFoundation(gameState, 'tableau', selectedCard.column, foundationIndex);
        }
      }

      if (newState) {
        setGameState(newState);
      }
      setSelectedCard(null);
    }
  };

  const handleNewGame = () => {
    setSeed(Date.now());
  };

  const handleResetGame = () => {
    setGameState(initializeGame(seed));
    setSelectedCard(null);
  };

  const handleSeedSubmit = () => {
    const parsedSeed = parseInt(inputSeed);
    if (!isNaN(parsedSeed)) {
      setSeed(parsedSeed);
      setShowSeedInput(false);
      setInputSeed('');
    }
  };

  // Drag-and-drop handlers
  const handleDragStart = (source: SelectedCard) => (e: React.DragEvent) => {
    if (!source) return;
    setDraggingCard(source);
    setSelectedCard(source);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify(source));
  };

  const handleDragEnd = () => {
    setDraggingCard(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleTableauDrop = (columnIndex: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggingCard) return;

    let newState: GameState | null = null;

    if (draggingCard.type === 'freeCell') {
      newState = moveCardFromFreeCell(gameState, draggingCard.index, columnIndex);
    } else if (draggingCard.type === 'tableau') {
      const numCards = gameState.tableau[draggingCard.column].length - draggingCard.cardIndex;
      newState = moveCardsToTableau(gameState, draggingCard.column, numCards, columnIndex);
    }

    if (newState) {
      setGameState(newState);
    }
    setDraggingCard(null);
    setSelectedCard(null);
  };

  const handleFreeCellDrop = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggingCard) return;

    if (draggingCard.type === 'tableau') {
      const column = gameState.tableau[draggingCard.column];
      // Only single cards can go to free cells
      if (draggingCard.cardIndex === column.length - 1) {
        const newState = moveCardToFreeCell(gameState, draggingCard.column, index);
        if (newState) {
          setGameState(newState);
        }
      }
    }
    setDraggingCard(null);
    setSelectedCard(null);
  };

  const handleFoundationDrop = (foundationIndex: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggingCard) return;

    let newState: GameState | null = null;

    if (draggingCard.type === 'freeCell') {
      newState = moveCardToFoundation(gameState, 'freeCell', draggingCard.index, foundationIndex);
    } else if (draggingCard.type === 'tableau') {
      const column = gameState.tableau[draggingCard.column];
      // Only single cards can go to foundations
      if (draggingCard.cardIndex === column.length - 1) {
        newState = moveCardToFoundation(gameState, 'tableau', draggingCard.column, foundationIndex);
      }
    }

    if (newState) {
      setGameState(newState);
    }
    setDraggingCard(null);
    setSelectedCard(null);
  };

  // Touch handlers
  const handleTouchStart = (source: SelectedCard) => (e: React.TouchEvent) => {
    if (!source) return;
    e.preventDefault(); // Prevent scrolling
    setTouchDragging(true);
    setDraggingCard(source);
    setSelectedCard(source);
    const touch = e.touches[0];
    setTouchPosition({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchDragging) return;
    e.preventDefault(); // Prevent scrolling
    const touch = e.touches[0];
    setTouchPosition({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchDragging || !draggingCard) {
      setTouchDragging(false);
      setTouchPosition(null);
      return;
    }

    const touch = e.changedTouches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);

    if (element) {
      // Find the drop target by checking data attributes
      const dropTarget = element.closest('[data-drop-target]');
      if (dropTarget) {
        const targetType = dropTarget.getAttribute('data-drop-type');
        const targetIndex = parseInt(dropTarget.getAttribute('data-drop-index') || '0');

        let newState: GameState | null = null;

        if (targetType === 'tableau') {
          if (draggingCard.type === 'freeCell') {
            newState = moveCardFromFreeCell(gameState, draggingCard.index, targetIndex);
          } else if (draggingCard.type === 'tableau') {
            const numCards = gameState.tableau[draggingCard.column].length - draggingCard.cardIndex;
            newState = moveCardsToTableau(gameState, draggingCard.column, numCards, targetIndex);
          }
        } else if (targetType === 'freeCell') {
          if (draggingCard.type === 'tableau') {
            const column = gameState.tableau[draggingCard.column];
            if (draggingCard.cardIndex === column.length - 1) {
              newState = moveCardToFreeCell(gameState, draggingCard.column, targetIndex);
            }
          }
        } else if (targetType === 'foundation') {
          if (draggingCard.type === 'freeCell') {
            newState = moveCardToFoundation(gameState, 'freeCell', draggingCard.index, targetIndex);
          } else if (draggingCard.type === 'tableau') {
            const column = gameState.tableau[draggingCard.column];
            if (draggingCard.cardIndex === column.length - 1) {
              newState = moveCardToFoundation(gameState, 'tableau', draggingCard.column, targetIndex);
            }
          }
        }

        if (newState) {
          setGameState(newState);
        }
      }
    }

    setTouchDragging(false);
    setDraggingCard(null);
    setSelectedCard(null);
    setTouchPosition(null);
  };

  const handleTouchCancel = () => {
    setTouchDragging(false);
    setDraggingCard(null);
    setSelectedCard(null);
    setTouchPosition(null);
  };

  return (
    <div
      style={{
        padding: '24px',
        backgroundColor: '#2c5f2d',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
      onTouchMove={handleTouchMove}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        color: 'white',
      }}>
        <h1 style={{ margin: 0 }}>FreeCell</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span>Moves: {gameState.moves}</span>
          <span>Seed: {gameState.seed}</span>
          <button
            onClick={() => setShowHints(!showHints)}
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              backgroundColor: showHints ? '#4caf50' : 'white',
              color: showHints ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              fontWeight: showHints ? 'bold' : 'normal',
            }}
            title="Toggle hints to highlight next playable cards"
          >
            💡 Hints
          </button>
          <button
            onClick={handleResetGame}
            style={{ padding: '8px 16px', cursor: 'pointer' }}
            title="Restart the current game from the beginning"
          >
            ↺ Reset
          </button>
          <button
            onClick={() => setShowSeedInput(!showSeedInput)}
            style={{ padding: '8px 16px', cursor: 'pointer' }}
          >
            Change Seed
          </button>
          <button
            onClick={handleNewGame}
            style={{ padding: '8px 16px', cursor: 'pointer' }}
          >
            New Game
          </button>
        </div>
      </div>

      {/* Seed Input */}
      {showSeedInput && (
        <div style={{
          marginBottom: '16px',
          padding: '12px',
          backgroundColor: 'white',
          borderRadius: '8px',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
        }}>
          <input
            type="number"
            value={inputSeed}
            onChange={(e) => setInputSeed(e.target.value)}
            placeholder="Enter seed number"
            style={{ padding: '8px', flex: 1 }}
            onKeyPress={(e) => e.key === 'Enter' && handleSeedSubmit()}
          />
          <button onClick={handleSeedSubmit} style={{ padding: '8px 16px' }}>
            Start Game
          </button>
          <button onClick={() => setShowSeedInput(false)} style={{ padding: '8px 16px' }}>
            Cancel
          </button>
        </div>
      )}

      {/* Top Area: Free Cells and Foundations */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '24px',
      }}>
        <FreeCellArea
          freeCells={gameState.freeCells}
          selectedCard={selectedCard?.type === 'freeCell' ? selectedCard : null}
          draggingCard={draggingCard}
          highlightedCardIds={highlightedCardIds}
          onFreeCellClick={handleFreeCellClick}
          onDragStart={(index) => handleDragStart({ type: 'freeCell', index })}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDrop={handleFreeCellDrop}
          onTouchStart={(index) => handleTouchStart({ type: 'freeCell', index })}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
        />
        <FoundationArea
          foundations={gameState.foundations}
          onFoundationClick={handleFoundationClick}
          onDragOver={handleDragOver}
          onDrop={handleFoundationDrop}
          onTouchEnd={handleTouchEnd}
        />
      </div>

      {/* Tableau */}
      <Tableau
        tableau={gameState.tableau}
        selectedCard={selectedCard?.type === 'tableau' ? selectedCard : null}
        draggingCard={draggingCard}
        highlightedCardIds={highlightedCardIds}
        onCardClick={handleTableauClick}
        onEmptyColumnClick={handleEmptyColumnClick}
        onDragStart={(columnIndex, cardIndex) => handleDragStart({ type: 'tableau', column: columnIndex, cardIndex })}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDrop={handleTableauDrop}
        onTouchStart={(columnIndex, cardIndex) => handleTouchStart({ type: 'tableau', column: columnIndex, cardIndex })}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
      />

      {/* Win Modal */}
      {showWin && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '32px',
            borderRadius: '12px',
            textAlign: 'center',
          }}>
            <h2>Congratulations!</h2>
            <p>You won in {gameState.moves} moves!</p>
            <p>Seed: {gameState.seed}</p>
            <button
              onClick={handleNewGame}
              style={{ padding: '12px 24px', fontSize: '16px', cursor: 'pointer' }}
            >
              New Game
            </button>
          </div>
        </div>
      )}

      {/* Footer with Version */}
      <div style={{
        marginTop: '24px',
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '12px',
      }}>
        v{version}
      </div>

      {/* Touch drag preview */}
      {touchDragging && touchPosition && draggingCard && (() => {
        let card = null;
        if (draggingCard.type === 'freeCell') {
          card = gameState.freeCells[draggingCard.index];
        } else if (draggingCard.type === 'tableau') {
          const column = gameState.tableau[draggingCard.column];
          card = column[draggingCard.cardIndex];
        }

        if (!card) return null;

        return (
          <div
            style={{
              position: 'fixed',
              left: touchPosition.x - 30,
              top: touchPosition.y - 42,
              pointerEvents: 'none',
              zIndex: 1000,
              opacity: 0.8,
            }}
          >
            <div
              style={{
                width: '60px',
                height: '84px',
                borderRadius: '6px',
                backgroundColor: 'white',
                border: '2px solid #4caf50',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 'bold',
                color: card.suit === '♥' || card.suit === '♦' ? '#c41e3a' : '#1a1a2e',
                position: 'relative',
              }}
            >
              <div style={{ position: 'absolute', top: '4px', left: '6px', fontSize: '14px', lineHeight: '1' }}>
                <div>{card.value}{card.suit}</div>
              </div>
              <div style={{ fontSize: '26px' }}>{card.suit}</div>
              <div style={{ position: 'absolute', bottom: '4px', right: '6px', fontSize: '14px', lineHeight: '1', transform: 'rotate(180deg)' }}>
                <div>{card.value}{card.suit}</div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
