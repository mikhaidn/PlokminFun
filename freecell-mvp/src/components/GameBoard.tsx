import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { initializeGame, checkWinCondition, type GameState } from '../state/gameState';
import { moveCardToFoundation } from '../state/gameActions';
import { findSafeAutoMove } from '../rules/autoComplete';
import { getLowestPlayableCards } from '../rules/hints';
import { FreeCellArea } from './FreeCellArea';
import {
  useGameHistory,
  useCardInteraction,
  DraggingCardPreview,
  Card,
  calculateLayoutSizes,
  type LayoutSizes,
  type GameLocation,
  SettingsModal,
  useSettings,
  FoundationArea,
  GenericTableau,
} from '@cardgames/shared';
import { getMinButtonHeight } from '../config/accessibilitySettings';
import { validateMove } from '../rules/moveValidation';
import { executeMove } from '../state/moveExecution';
import { convertTableauToGeneric } from '../utils/tableauAdapter';

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

  const [showHints, setShowHints] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Use shared settings (will be used for future features)
  useSettings();

  // Temporary: Map old accessibility settings to defaults until full migration
  const accessibilityDefaults = {
    touchTargetSize: 'normal' as 'normal' | 'large',
    fontSizeMultiplier: 1.0,
    buttonPosition: 'top' as 'top' | 'bottom',
    highContrastMode: false,
  };

  // Responsive layout sizing
  const [layoutSizes, setLayoutSizes] = useState<LayoutSizes>(() =>
    calculateLayoutSizes(window.innerWidth, window.innerHeight)
  );

  // Update layout sizes on window resize
  useEffect(() => {
    const handleResize = () => {
      setLayoutSizes(
        calculateLayoutSizes(window.innerWidth, window.innerHeight)
      );
    };

    window.addEventListener('resize', handleResize);
    // Also handle orientation change
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Derive win condition from game state
  const showWin = useMemo(() => checkWinCondition(gameState), [gameState]);

  // Auto-move cards to foundations
  useEffect(() => {
    if (sharedInteractionState.draggingCard || sharedInteractionState.selectedCard) return;

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
  }, [gameState, sharedInteractionState.draggingCard, sharedInteractionState.selectedCard, pushState]);

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

  const handleNewGame = useCallback(() => {
    const newSeed = Date.now();
    setSeed(newSeed);
    resetHistory(initializeGame(newSeed));
  }, [resetHistory]);

  const handleResetGame = useCallback(() => {
    resetHistory();
  }, [resetHistory]);

  // =============================================================================
  // Card interaction handlers
  // =============================================================================

  /**
   * Tableau click handler
   */
  const handleTableauClick = useCallback((columnIndex: number, cardIndex: number) => {
    const cardCount = gameState.tableau[columnIndex].length - cardIndex;
    sharedHandlers.handleCardClick({
      type: 'tableau',
      index: columnIndex,
      cardCount,
      cardIndex, // FreeCell uses cardIndex
    });
  }, [gameState.tableau, sharedHandlers]);

  /**
   * Empty column click handler
   */
  const handleEmptyColumnClick = useCallback((columnIndex: number) => {
    sharedHandlers.handleCardClick({
      type: 'tableau',
      index: columnIndex,
      cardCount: 0,
    });
  }, [sharedHandlers]);

  /**
   * Free cell click handler
   */
  const handleFreeCellClick = useCallback((index: number) => {
    sharedHandlers.handleCardClick({
      type: 'freeCell',
      index,
      cardCount: 1,
    });
  }, [sharedHandlers]);

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

  // Convert GameLocation to SelectedCard for child components
  // Convert GameLocation to SelectedCard format for display
  const convertLocationToSelected = useCallback((loc: GameLocation | null): SelectedCard => {
    if (!loc) return null;

    if (loc.type === 'tableau') {
      return {
        type: 'tableau',
        column: loc.index,
        cardIndex: loc.cardIndex ?? (gameState.tableau[loc.index].length - (loc.cardCount ?? 1)),
      };
    } else if (loc.type === 'freeCell') {
      return { type: 'freeCell', index: loc.index };
    } else if (loc.type === 'foundation') {
      return { type: 'foundation', index: loc.index };
    }
    return null;
  }, [gameState.tableau]);

  const displaySelectedCard: SelectedCard = React.useMemo(() =>
    convertLocationToSelected(sharedInteractionState.selectedCard),
    [sharedInteractionState.selectedCard, convertLocationToSelected]
  );

  const displayDraggingCard: SelectedCard = React.useMemo(() =>
    convertLocationToSelected(sharedInteractionState.draggingCard),
    [sharedInteractionState.draggingCard, convertLocationToSelected]
  );

  // Wrapper functions to convert SelectedCard to GameLocation and call shared handlers
  const handleDragStart = (source: SelectedCard) => (e: React.DragEvent) => {
    if (!source) return;
    const location: GameLocation = source.type === 'tableau'
      ? { type: 'tableau', index: source.column, cardIndex: source.cardIndex }
      : { type: source.type, index: source.index };
    sharedHandlers.handleDragStart(location)(e);
  };

  const handleDragEnd = () => {
    sharedHandlers.handleDragEnd();
  };

  const handleDragOver = (e: React.DragEvent) => {
    sharedHandlers.handleDragOver(e);
  };

  const handleTableauDrop = (columnIndex: number) => (e: React.DragEvent) => {
    const location: GameLocation = { type: 'tableau', index: columnIndex };
    sharedHandlers.handleDrop(location)(e);
  };

  const handleFreeCellDrop = (index: number) => (e: React.DragEvent) => {
    const location: GameLocation = { type: 'freeCell', index };
    sharedHandlers.handleDrop(location)(e);
  };

  const handleFoundationDrop = (foundationIndex: number) => (e: React.DragEvent) => {
    const location: GameLocation = { type: 'foundation', index: foundationIndex };
    sharedHandlers.handleDrop(location)(e);
  };

  // Touch handlers
  const handleTouchStart = (source: SelectedCard) => (e: React.TouchEvent) => {
    if (!source) return;
    const location: GameLocation = source.type === 'tableau'
      ? { type: 'tableau', index: source.column, cardIndex: source.cardIndex }
      : { type: source.type, index: source.index };
    sharedHandlers.handleTouchStart(location)(e);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    sharedHandlers.handleTouchMove(e);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    sharedHandlers.handleTouchEnd(e);
  };

  const handleTouchCancel = () => {
    sharedHandlers.handleTouchCancel();
  };

  // Responsive sizing for UI elements (with accessibility overrides)
  const isMobile = window.innerWidth < 600;
  const isTablet = window.innerWidth >= 600 && window.innerWidth < 900;
  const padding = isMobile ? 12 : 24;
  const minButtonHeight = getMinButtonHeight(accessibilityDefaults.touchTargetSize);
  const buttonPadding = isMobile ? '8px 12px' : '10px 18px';
  const fontSize = (isMobile ? 0.8 : 1.0) * accessibilityDefaults.fontSizeMultiplier;
  const titleSize = isMobile ? '1.5em' : isTablet ? '2em' : '2.5em';
  const buttonsAtBottom = accessibilityDefaults.buttonPosition === 'bottom';

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

  // Version indicator (auto-generated from git at build time)
  const BUILD_VERSION = __BUILD_VERSION__;

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
          <div>
            <h1 style={{ margin: 0, fontSize: titleSize }}>FreeCell</h1>
            <div style={{
              fontSize: '0.7em',
              opacity: 0.6,
              marginTop: '4px',
              fontFamily: 'monospace'
            }}>
              v{BUILD_VERSION}
            </div>
          </div>
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
          selectedCard={displaySelectedCard?.type === 'freeCell' ? displaySelectedCard : null}
          draggingCard={displayDraggingCard}
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
          highContrastMode={accessibilityDefaults.highContrastMode}
        />
        <FoundationArea
          foundations={gameState.foundations}
          selectedFoundation={displaySelectedCard?.type === 'foundation' ? displaySelectedCard.index : null}
          draggingCard={displayDraggingCard?.type === 'foundation' ? { type: 'foundation', index: displayDraggingCard.index } : null}
          onClick={handleFoundationClick}
          onDragStart={(index) => handleDragStart({ type: 'foundation', index })}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDrop={handleFoundationDrop}
          onTouchStart={(index) => handleTouchStart({ type: 'foundation', index })}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
          layoutSizes={layoutSizes}
          highContrastMode={accessibilityDefaults.highContrastMode}
        />
        </div>

        {/* Tableau - RFC-005: Using GenericTableau */}
        <GenericTableau
          columns={convertTableauToGeneric(gameState)}
          layoutSizes={layoutSizes}
          selectedCard={sharedInteractionState.selectedCard}
          draggingCard={sharedInteractionState.draggingCard}
          highlightedCardIds={highlightedCardIds}
          onClick={handleTableauClick}
          onEmptyColumnClick={handleEmptyColumnClick}
          onDragStart={(columnIndex, cardIndex) => {
            const location: GameLocation = {
              type: 'tableau',
              index: columnIndex,
              cardIndex,
              cardCount: gameState.tableau[columnIndex].length - cardIndex,
            };
            return sharedHandlers.handleDragStart(location);
          }}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDrop={handleTableauDrop}
          onTouchStart={(columnIndex, cardIndex) => {
            const location: GameLocation = {
              type: 'tableau',
              index: columnIndex,
              cardIndex,
              cardCount: gameState.tableau[columnIndex].length - cardIndex,
            };
            return sharedHandlers.handleTouchStart(location);
          }}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
          positioningStrategy="margin"
          highContrastMode={accessibilityDefaults.highContrastMode}
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
        onClose={() => setShowSettings(false)}
      />

      {/* Touch drag preview */}
      <DraggingCardPreview
        position={sharedInteractionState.touchPosition}
        isActive={sharedInteractionState.touchDragging}
        cardWidth={layoutSizes.cardWidth}
        cardHeight={layoutSizes.cardHeight}
      >
        {displayDraggingCard && (() => {
          let card = null;
          if (displayDraggingCard.type === 'freeCell') {
            card = gameState.freeCells[displayDraggingCard.index];
          } else if (displayDraggingCard.type === 'tableau') {
            const column = gameState.tableau[displayDraggingCard.column];
            card = column[displayDraggingCard.cardIndex];
          } else if (displayDraggingCard.type === 'foundation') {
            const foundation = gameState.foundations[displayDraggingCard.index];
            card = foundation.length > 0 ? foundation[foundation.length - 1] : null;
          }

          if (!card) return null;

          return (
            <Card
              card={card}
              isSelected={true}
              cardWidth={layoutSizes.cardWidth}
              cardHeight={layoutSizes.cardHeight}
              fontSize={layoutSizes.fontSize}
              highContrastMode={accessibilityDefaults.highContrastMode}
            />
          );
        })()}
      </DraggingCardPreview>
    </div>
  );
};
