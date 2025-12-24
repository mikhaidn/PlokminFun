import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { initializeGame, checkWinCondition, type GameState } from '../state/gameState';
import {
  moveCardToFreeCell,
  moveCardFromFreeCell,
  moveCardToFoundation,
  moveCardsToTableau,
  moveCardFromFoundationToTableau,
  moveCardFromFoundationToFreeCell,
} from '../state/gameActions';
import { findSafeAutoMove } from '../rules/autoComplete';
import { getLowestPlayableCards } from '../rules/hints';
import { FreeCellArea } from './FreeCellArea';
import { FoundationArea } from './FoundationArea';
import { Tableau } from './Tableau';
import { SettingsModal } from './SettingsModal';
import { calculateLayoutSizes, type LayoutSizes } from '../utils/responsiveLayout';
import {
  type AccessibilitySettings,
  loadAccessibilitySettings,
  saveAccessibilitySettings,
  getSettingsFromMode,
  getMinButtonHeight,
} from '../config/accessibilitySettings';
import { isRed } from '../rules/validation';
import {
  useGameHistory,
  useCardInteraction,
  FEATURE_FLAGS,
  type GameLocation,
} from '@cardgames/shared';
import { validateMove } from '../rules/moveValidation';
import { executeMove } from '../state/moveExecution';

type SelectedCard =
  | { type: 'tableau'; column: number; cardIndex: number }
  | { type: 'freeCell'; index: number }
  | { type: 'foundation'; index: number }
  | null;

export const GameBoard: React.FC = () => {
  const [seed, setSeed] = useState<number>(() => Date.now());

  // Use game history for undo/redo functionality
  const {
    currentState: gameState,
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    reset: resetHistory,
  } = useGameHistory<GameState>({
    initialState: initializeGame(seed),
    maxHistorySize: 100,
    persistKey: 'freecell-game-history',
  });

  // RFC-004 Phase 2: Shared interaction hook (feature-flagged)
  // Prepared for Phase 3 full integration (currently infrastructure only)
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

  // Note: FEATURE_FLAGS, sharedInteractionState, and sharedHandlers prepared for Phase 3
  // Full handler integration will be completed in follow-up work
  void sharedInteractionState; // Suppress unused warning
  void sharedHandlers; // Suppress unused warning
  void FEATURE_FLAGS; // Suppress unused warning

  // Legacy selection state (used when feature flag is OFF)
  const [selectedCard, setSelectedCard] = useState<SelectedCard>(null);
  const [draggingCard, setDraggingCard] = useState<SelectedCard>(null);
  const [showHints, setShowHints] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Touch drag-and-drop state
  const [touchDragging, setTouchDragging] = useState(false);
  const [touchPosition, setTouchPosition] = useState<{ x: number; y: number } | null>(null);

  // Accessibility settings
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>(() =>
    loadAccessibilitySettings()
  );

  // Derive actual settings from game mode
  const modeSettings = getSettingsFromMode(accessibilitySettings.gameMode);

  // Responsive layout sizing (with accessibility overrides)
  const [layoutSizes, setLayoutSizes] = useState<LayoutSizes>(() =>
    calculateLayoutSizes(
      window.innerWidth,
      window.innerHeight,
      modeSettings.maxCardWidth,
      modeSettings.fontSizeMultiplier
    )
  );

  // Update layout sizes on window resize or accessibility settings change
  useEffect(() => {
    const handleResize = () => {
      const settings = getSettingsFromMode(accessibilitySettings.gameMode);
      setLayoutSizes(
        calculateLayoutSizes(
          window.innerWidth,
          window.innerHeight,
          settings.maxCardWidth,
          settings.fontSizeMultiplier
        )
      );
    };

    handleResize(); // Recalculate immediately when settings change

    window.addEventListener('resize', handleResize);
    // Also handle orientation change
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [accessibilitySettings.gameMode]);

  // Save accessibility settings when they change
  const handleSaveSettings = (newSettings: AccessibilitySettings) => {
    setAccessibilitySettings(newSettings);
    saveAccessibilitySettings(newSettings);
  };

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
          pushState(newState);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [gameState, draggingCard, selectedCard, pushState]);

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

  // Calculate highlighted cards for hints
  const highlightedCardIds = showHints ? getLowestPlayableCards(gameState) : [];

  const handleTableauClick = useCallback((columnIndex: number, cardIndex: number) => {
    if (selectedCard) {
      // Try to move selected card to tableau
      let newState: GameState | null = null;

      if (selectedCard.type === 'freeCell') {
        newState = moveCardFromFreeCell(gameState, selectedCard.index, columnIndex);
      } else if (selectedCard.type === 'tableau') {
        const numCards = gameState.tableau[selectedCard.column].length - selectedCard.cardIndex;
        newState = moveCardsToTableau(gameState, selectedCard.column, numCards, columnIndex);
      } else if (selectedCard.type === 'foundation') {
        newState = moveCardFromFoundationToTableau(gameState, selectedCard.index, columnIndex);
      }

      if (newState) {
        pushState(newState);
        setSelectedCard(null);
      } else {
        setSelectedCard(null);
      }
    } else {
      // Select this card/stack
      setSelectedCard({ type: 'tableau', column: columnIndex, cardIndex });
    }
  }, [selectedCard, gameState, pushState]);

  const handleEmptyColumnClick = (columnIndex: number) => {
    if (selectedCard) {
      let newState: GameState | null = null;

      if (selectedCard.type === 'freeCell') {
        newState = moveCardFromFreeCell(gameState, selectedCard.index, columnIndex);
      } else if (selectedCard.type === 'tableau') {
        const numCards = gameState.tableau[selectedCard.column].length - selectedCard.cardIndex;
        newState = moveCardsToTableau(gameState, selectedCard.column, numCards, columnIndex);
      } else if (selectedCard.type === 'foundation') {
        newState = moveCardFromFoundationToTableau(gameState, selectedCard.index, columnIndex);
      }

      if (newState) {
        pushState(newState);
      }
      setSelectedCard(null);
    }
  };

  const handleFreeCellClick = (index: number) => {
    if (selectedCard) {
      // Try to move to free cell
      let newState: GameState | null = null;

      if (selectedCard.type === 'tableau') {
        const column = gameState.tableau[selectedCard.column];
        // Only single cards can go to free cells
        if (selectedCard.cardIndex === column.length - 1) {
          newState = moveCardToFreeCell(gameState, selectedCard.column, index);
        }
      } else if (selectedCard.type === 'foundation') {
        newState = moveCardFromFoundationToFreeCell(gameState, selectedCard.index, index);
      }

      if (newState) {
        pushState(newState);
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
        pushState(newState);
      }
      setSelectedCard(null);
    } else {
      // Select from foundation (if it has cards)
      const foundation = gameState.foundations[foundationIndex];
      if (foundation.length > 0) {
        setSelectedCard({ type: 'foundation', index: foundationIndex });
      }
    }
  };

  const handleNewGame = useCallback(() => {
    const newSeed = Date.now();
    setSeed(newSeed);
    resetHistory(initializeGame(newSeed));
    setSelectedCard(null);
  }, [resetHistory]);

  const handleResetGame = useCallback(() => {
    resetHistory();
    setSelectedCard(null);
  }, [resetHistory]);

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
    } else if (draggingCard.type === 'foundation') {
      newState = moveCardFromFoundationToTableau(gameState, draggingCard.index, columnIndex);
    }

    if (newState) {
      pushState(newState);
    }
    setDraggingCard(null);
    setSelectedCard(null);
  };

  const handleFreeCellDrop = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggingCard) return;

    let newState: GameState | null = null;

    if (draggingCard.type === 'tableau') {
      const column = gameState.tableau[draggingCard.column];
      // Only single cards can go to free cells
      if (draggingCard.cardIndex === column.length - 1) {
        newState = moveCardToFreeCell(gameState, draggingCard.column, index);
      }
    } else if (draggingCard.type === 'foundation') {
      newState = moveCardFromFoundationToFreeCell(gameState, draggingCard.index, index);
    }

    if (newState) {
      pushState(newState);
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
      pushState(newState);
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
          } else if (draggingCard.type === 'foundation') {
            newState = moveCardFromFoundationToTableau(gameState, draggingCard.index, targetIndex);
          }
        } else if (targetType === 'freeCell') {
          if (draggingCard.type === 'tableau') {
            const column = gameState.tableau[draggingCard.column];
            if (draggingCard.cardIndex === column.length - 1) {
              newState = moveCardToFreeCell(gameState, draggingCard.column, targetIndex);
            }
          } else if (draggingCard.type === 'foundation') {
            newState = moveCardFromFoundationToFreeCell(gameState, draggingCard.index, targetIndex);
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
          pushState(newState);
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

  // Responsive sizing for UI elements (with accessibility overrides)
  const isMobile = window.innerWidth < 600;
  const isTablet = window.innerWidth >= 600 && window.innerWidth < 900;
  const padding = isMobile ? 12 : 24;
  const minButtonHeight = getMinButtonHeight(modeSettings.touchTargetSize);
  const buttonPadding = isMobile ? '8px 12px' : '10px 18px';
  const fontSize = (isMobile ? 0.8 : 1.0) * modeSettings.fontSizeMultiplier;
  const titleSize = isMobile ? '1.5em' : isTablet ? '2em' : '2.5em';
  const buttonsAtBottom = modeSettings.buttonPosition === 'bottom';

  // Button controls JSX (reused for top/bottom positioning)
  const buttonControls = (
    <div
      style={{
        display: 'flex',
        gap: isMobile ? '8px' : '12px',
        alignItems: 'center',
        flexWrap: 'wrap',
        fontSize: `${fontSize}em`,
      }}
    >
      <span>Moves: {gameState.moves}</span>
      <button
        onClick={undo}
        disabled={!canUndo}
        style={{
          padding: buttonPadding,
          minHeight: `${minButtonHeight}px`,
          cursor: canUndo ? 'pointer' : 'not-allowed',
          backgroundColor: 'white',
          color: 'black',
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontSize: `${fontSize}em`,
          opacity: canUndo ? 1 : 0.5,
        }}
        title="Undo last move (U or Ctrl+Z)"
        aria-label="Undo last move"
      >
        ↶ Undo
      </button>
      <button
        onClick={redo}
        disabled={!canRedo}
        style={{
          padding: buttonPadding,
          minHeight: `${minButtonHeight}px`,
          cursor: canRedo ? 'pointer' : 'not-allowed',
          backgroundColor: 'white',
          color: 'black',
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontSize: `${fontSize}em`,
          opacity: canRedo ? 1 : 0.5,
        }}
        title="Redo move (R or Ctrl+Y)"
        aria-label="Redo move"
      >
        ↷ Redo
      </button>
      <button
        onClick={() => setShowSettings(true)}
        style={{
          padding: buttonPadding,
          minHeight: `${minButtonHeight}px`,
          cursor: 'pointer',
          backgroundColor: 'white',
          color: 'black',
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontSize: `${fontSize}em`,
        }}
        title="Game Settings"
        aria-label="Game Settings"
      >
        ⚙️ Settings
      </button>
      <button
        onClick={() => setShowHints(!showHints)}
        style={{
          padding: buttonPadding,
          minHeight: `${minButtonHeight}px`,
          cursor: 'pointer',
          backgroundColor: showHints ? '#4caf50' : 'white',
          color: showHints ? 'white' : 'black',
          border: showHints ? 'none' : '1px solid #ccc',
          borderRadius: '4px',
          fontWeight: showHints ? 'bold' : 'normal',
          fontSize: `${fontSize}em`,
        }}
        title="Toggle hints to highlight next playable cards"
      >
        💡 Hints
      </button>
      <button
        onClick={handleResetGame}
        style={{
          padding: buttonPadding,
          minHeight: `${minButtonHeight}px`,
          cursor: 'pointer',
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontSize: `${fontSize}em`,
        }}
        title="Restart the current game from the beginning"
      >
        ↺ Reset
      </button>
      <button
        onClick={handleNewGame}
        style={{
          padding: isMobile ? '10px 24px' : '12px 32px',
          minHeight: `${minButtonHeight}px`,
          cursor: 'pointer',
          backgroundColor: '#4caf50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontWeight: 'bold',
          fontSize: `${fontSize}em`,
        }}
        title="Start a new game"
      >
        New Game
      </button>
    </div>
  );

  return (
    <div
      style={{
        padding: `${padding}px`,
        backgroundColor: '#2c5f2d',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        paddingBottom: buttonsAtBottom ? '80px' : `${padding}px`, // Space for bottom bar
      }}
      onTouchMove={handleTouchMove}
    >
      {/* Header */}
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            marginBottom: `${padding}px`,
            color: 'white',
            gap: isMobile ? '12px' : '0',
          }}
        >
          <h1 style={{ margin: 0, fontSize: titleSize }}>FreeCell</h1>
          {!buttonsAtBottom && buttonControls}
        </div>

        {/* Top Area: Free Cells and Foundations */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: `${layoutSizes.cardGap * 3}px`,
          }}
        >
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
          cardWidth={layoutSizes.cardWidth}
          cardHeight={layoutSizes.cardHeight}
          cardGap={layoutSizes.cardGap}
          fontSize={layoutSizes.fontSize}
          highContrastMode={modeSettings.highContrastMode}
        />
        <FoundationArea
          foundations={gameState.foundations}
          selectedCard={selectedCard?.type === 'foundation' ? selectedCard : null}
          draggingCard={draggingCard}
          onFoundationClick={handleFoundationClick}
          onDragStart={(index) => handleDragStart({ type: 'foundation', index })}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDrop={handleFoundationDrop}
          onTouchStart={(index) => handleTouchStart({ type: 'foundation', index })}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
          cardWidth={layoutSizes.cardWidth}
          cardHeight={layoutSizes.cardHeight}
          cardGap={layoutSizes.cardGap}
          fontSize={layoutSizes.fontSize}
          highContrastMode={modeSettings.highContrastMode}
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
        cardWidth={layoutSizes.cardWidth}
        cardHeight={layoutSizes.cardHeight}
        cardGap={layoutSizes.cardGap}
        cardOverlap={layoutSizes.cardOverlap}
        fontSize={layoutSizes.fontSize}
        highContrastMode={modeSettings.highContrastMode}
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
          padding: `${padding}px`,
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: isMobile ? '24px' : '32px',
            borderRadius: '12px',
            textAlign: 'center',
            maxWidth: isMobile ? '90%' : '400px',
          }}>
            <h2 style={{ fontSize: isMobile ? '1.5em' : '2em' }}>Congratulations!</h2>
            <p style={{ fontSize: `${fontSize}em` }}>You won in {gameState.moves} moves!</p>
            <p style={{ fontSize: `${fontSize}em` }}>Seed: {gameState.seed}</p>
            <button
              onClick={handleNewGame}
              style={{
                padding: buttonPadding,
                minHeight: `${minButtonHeight}px`,
                fontSize: `${fontSize}em`,
                cursor: 'pointer',
              }}
            >
              New Game
            </button>
          </div>
        </div>
      )}

      {/* Bottom Button Bar (for one-handed mode) */}
      {buttonsAtBottom && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#2c5f2d',
            borderTop: '2px solid rgba(255, 255, 255, 0.2)',
            padding: `${padding}px`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            zIndex: 100,
          }}
        >
          {buttonControls}
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        settings={accessibilitySettings}
        onClose={() => setShowSettings(false)}
        onSave={handleSaveSettings}
      />

      {/* Touch drag preview */}
      {touchDragging && touchPosition && draggingCard && (() => {
        let card = null;
        if (draggingCard.type === 'freeCell') {
          card = gameState.freeCells[draggingCard.index];
        } else if (draggingCard.type === 'tableau') {
          const column = gameState.tableau[draggingCard.column];
          card = column[draggingCard.cardIndex];
        } else if (draggingCard.type === 'foundation') {
          const foundation = gameState.foundations[draggingCard.index];
          card = foundation.length > 0 ? foundation[foundation.length - 1] : null;
        }

        if (!card) return null;

        const red = isRed(card);
        const textColor = modeSettings.highContrastMode
          ? (red ? '#ff0000' : '#000000')
          : (red ? '#c41e3a' : '#1a1a2e');
        const borderWidth = modeSettings.highContrastMode ? '4px' : '2px';

        return (
          <div
            style={{
              position: 'fixed',
              left: touchPosition.x - (layoutSizes.cardWidth / 2),
              top: touchPosition.y - (layoutSizes.cardHeight / 2),
              pointerEvents: 'none',
              zIndex: 1000,
              opacity: 0.8,
            }}
          >
            <div
              style={{
                width: `${layoutSizes.cardWidth}px`,
                height: `${layoutSizes.cardHeight}px`,
                borderRadius: `${layoutSizes.cardWidth * 0.1}px`,
                backgroundColor: 'white',
                border: `${borderWidth} solid #4caf50`,
                boxShadow: modeSettings.highContrastMode
                  ? '0 4px 12px rgba(0,0,0,0.5)'
                  : '0 4px 8px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: `${layoutSizes.fontSize.medium}px`,
                fontWeight: 'bold',
                color: textColor,
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: `${layoutSizes.cardHeight * 0.05}px`,
                  left: `${layoutSizes.cardWidth * 0.1}px`,
                  fontSize: `${layoutSizes.fontSize.small}px`,
                  lineHeight: '1',
                }}
              >
                <div>{card.value}{card.suit}</div>
              </div>
              <div style={{ fontSize: `${layoutSizes.fontSize.large}px` }}>{card.suit}</div>
              <div
                style={{
                  position: 'absolute',
                  bottom: `${layoutSizes.cardHeight * 0.05}px`,
                  right: `${layoutSizes.cardWidth * 0.1}px`,
                  fontSize: `${layoutSizes.fontSize.small}px`,
                  lineHeight: '1',
                  transform: 'rotate(180deg)',
                }}
              >
                <div>{card.value}{card.suit}</div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
