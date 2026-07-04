import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { type SpiderGameState, isGameWon, type SuitCount } from '../state/gameState';
import { dealFromStock, canDeal, getValidMoves } from '../state/gameActions';
import {
  GameControls,
  useGameHistory,
  useCardInteraction,
  DraggingCardPreview,
  Card,
  type LayoutSizes,
  type GameLocation,
  SettingsModal,
  GenericTableau,
  WinCelebration,
  VictoryModal,
  useSettings,
  HelpModal,
} from '@plokmin/shared';
import { validateMove } from '../rules/moveValidation';
import { executeMove } from '../state/moveExecution';
import { convertTableauToGeneric } from '../utils/tableauAdapter';
import { calculateSpiderLayout } from '../utils/spiderLayout';
import { spiderHelpContent } from '../utils/helpContent';
import { updateSpiderSetting } from '../utils/spiderSettings';
import { SpiderTopBar } from './SpiderTopBar';

interface GameBoardProps {
  initialState: SpiderGameState;
  onNewGame: () => void;
}

const SUIT_OPTIONS: { value: SuitCount; label: string }[] = [
  { value: 1, label: '1 Suit' },
  { value: 2, label: '2 Suits' },
  { value: 4, label: '4 Suits' },
];

export const GameBoard: React.FC<GameBoardProps> = ({ initialState, onNewGame }) => {
  // Undo/redo history
  const {
    currentState: gameState,
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    reset: resetHistory,
  } = useGameHistory<SpiderGameState>({
    initialState,
    maxHistorySize: 100,
    persistKey: 'spider-game-history',
  });

  // Shared interaction hook (Spider only moves cards tableau → tableau)
  const sharedHookConfig = useMemo(
    () => ({
      validateMove: (from: GameLocation, to: GameLocation) => validateMove(gameState, from, to),
      executeMove: (from: GameLocation, to: GameLocation) => {
        const newState = executeMove(gameState, from, to);
        if (newState) {
          pushState(newState);
        }
      },
      getValidMoves: (from: GameLocation) => {
        const validMoves = getValidMoves(
          gameState,
          { type: 'tableau', index: from.index },
          from.cardCount ?? 1
        );
        return validMoves.map((loc) => ({
          type: loc.type as GameLocation['type'],
          index: loc.index ?? 0,
        }));
      },
    }),
    [gameState, pushState]
  );

  const { state: sharedInteractionState, handlers: sharedHandlers } =
    useCardInteraction<GameLocation>(sharedHookConfig);

  // Responsive layout sizing (scaled to fit Spider's 10 columns)
  const [layoutSizes, setLayoutSizes] = useState<LayoutSizes>(() =>
    calculateSpiderLayout(window.innerWidth, window.innerHeight)
  );

  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const { settings } = useSettings();

  const isWon = isGameWon(gameState);
  const dealAllowed = canDeal(gameState);

  // Change difficulty (suit count). Applies to the next game.
  const handleSuitCountChange = useCallback(
    (suitCount: SuitCount) => {
      if (gameState.suitCount === suitCount) return;
      updateSpiderSetting('suitCount', suitCount);
      onNewGame();
    },
    [gameState.suitCount, onNewGame]
  );

  // Update layout sizes on window resize / orientation change
  useEffect(() => {
    const handleResize = () => {
      setLayoutSizes(calculateSpiderLayout(window.innerWidth, window.innerHeight));
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Deal a row from the stock
  const handleDeal = useCallback(() => {
    const newState = dealFromStock(gameState);
    if (newState !== gameState) {
      pushState(newState);
    }
  }, [gameState, pushState]);

  const handleResetGame = useCallback(() => {
    resetHistory();
  }, [resetHistory]);

  // =============================================================================
  // Tableau interaction handlers
  // =============================================================================

  const handleTableauClick = useCallback(
    (columnIndex: number, cardIndex: number) => {
      const column = gameState.tableau[columnIndex];
      const faceDownCount = column.cards.length - column.faceUpCount;

      // Can't select face-down cards
      if (cardIndex < faceDownCount) return;

      const cardCount = column.cards.length - cardIndex;
      sharedHandlers.handleCardClick({ type: 'tableau', index: columnIndex, cardCount });
    },
    [gameState.tableau, sharedHandlers]
  );

  const handleEmptyColumnClick = useCallback(
    (columnIndex: number) => {
      sharedHandlers.handleCardClick({ type: 'tableau', index: columnIndex, cardCount: 0 });
    },
    [sharedHandlers]
  );

  const handleDragStart = useCallback(
    (location: GameLocation) => (e: React.DragEvent) => {
      sharedHandlers.handleDragStart(location)(e);
    },
    [sharedHandlers]
  );

  const handleDragEnd = useCallback(() => sharedHandlers.handleDragEnd(), [sharedHandlers]);
  const handleDragOver = useCallback(
    (e: React.DragEvent) => sharedHandlers.handleDragOver(e),
    [sharedHandlers]
  );
  const handleDrop = useCallback(
    (location: GameLocation) => (e: React.DragEvent) => {
      sharedHandlers.handleDrop(location)(e);
    },
    [sharedHandlers]
  );

  const handleTouchStart = useCallback(
    (location: GameLocation) => (e: React.TouchEvent) => {
      sharedHandlers.handleTouchStart(location)(e);
    },
    [sharedHandlers]
  );
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => sharedHandlers.handleTouchMove(e),
    [sharedHandlers]
  );
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => sharedHandlers.handleTouchEnd(e),
    [sharedHandlers]
  );
  const handleTouchCancel = useCallback(() => sharedHandlers.handleTouchCancel(), [sharedHandlers]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey && canUndo) {
        e.preventDefault();
        undo();
      } else if (
        ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')
      ) {
        if (canRedo) {
          e.preventDefault();
          redo();
        }
      } else if (e.key === 'u' && !e.ctrlKey && !e.metaKey && !e.altKey && canUndo) {
        e.preventDefault();
        undo();
      } else if (e.key === 'r' && !e.ctrlKey && !e.metaKey && !e.altKey && canRedo) {
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
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
      onTouchMove={handleTouchMove}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: isMobile ? '8px' : '16px',
          color: 'white',
          flexWrap: 'wrap',
          gap: isMobile ? '8px' : '12px',
        }}
      >
        <h1 style={{ fontSize: isMobile ? '1.15rem' : '1.5rem', fontWeight: 'bold' }}>
          Spider Solitaire
        </h1>

        <GameControls
          moves={gameState.moves}
          seed={gameState.seed}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
          onReset={handleResetGame}
          onNewGame={onNewGame}
          showHome={true}
          onHome={() => (window.location.href = '/')}
          showSettings={true}
          onSettings={() => setShowSettings(true)}
          showHelp={true}
          onHelp={() => setShowHelp(true)}
          isMobile={isMobile}
          minButtonHeight={buttonHeight}
          buttonPadding={isMobile ? '8px 12px' : '8px 16px'}
          fontSize={isMobile ? 0.8 : 0.875}
        />

        {/* Difficulty (suit count) selector - applies to next game */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: isMobile ? '0.8em' : '0.875em', color: '#cbd5e1' }}>
            Difficulty:
          </span>
          <div
            style={{
              display: 'inline-flex',
              border: '2px solid #4caf50',
              borderRadius: '6px',
              overflow: 'hidden',
            }}
            role="group"
            aria-label="Suit count selection"
          >
            {SUIT_OPTIONS.map((option, idx) => {
              const active = gameState.suitCount === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => handleSuitCountChange(option.value)}
                  style={{
                    padding: isMobile ? '6px 12px' : '8px 16px',
                    minHeight: `${buttonHeight}px`,
                    cursor: active ? 'default' : 'pointer',
                    backgroundColor: active ? '#4caf50' : 'white',
                    color: active ? 'white' : '#333',
                    border: 'none',
                    borderRight: idx < SUIT_OPTIONS.length - 1 ? '1px solid #e0e0e0' : 'none',
                    fontSize: isMobile ? '0.8em' : '0.875em',
                    fontWeight: active ? 'bold' : 'normal',
                    transition: 'all 0.2s ease',
                  }}
                  aria-pressed={active}
                >
                  {option.label} {active ? '✓' : ''}
                </button>
              );
            })}
          </div>
          {!isMobile && (
            <span style={{ fontSize: '0.7em', color: '#94a3b8', fontStyle: 'italic' }}>
              (applies to next game)
            </span>
          )}
        </div>
      </div>

      {/* Stock + completed runs */}
      <SpiderTopBar
        stock={gameState.stock}
        foundations={gameState.foundations}
        canDeal={dealAllowed}
        onDeal={handleDeal}
        layoutSizes={layoutSizes}
      />

      {/* Tableau */}
      <GenericTableau
        columns={convertTableauToGeneric(gameState)}
        layoutSizes={layoutSizes}
        selectedCard={sharedInteractionState.selectedCard}
        draggingCard={sharedInteractionState.draggingCard}
        highlightedCells={sharedInteractionState.highlightedCells}
        emptyColumnTooltip="Any card or run can start an empty column"
        onClick={handleTableauClick}
        onEmptyColumnClick={handleEmptyColumnClick}
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
        positioningStrategy="absolute"
        dropZoneHeight={Math.round(layoutSizes.cardHeight * 1.5)}
      />

      {/* Win celebration + modal */}
      <WinCelebration
        isActive={isWon && settings.winCelebration && settings.animationLevel !== 'none'}
        duration={3000}
      />
      <VictoryModal
        isOpen={isWon}
        moves={gameState.moves}
        onNewGame={onNewGame}
        title="🎉 You Won!"
      />

      {/* Settings + help */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} content={spiderHelpContent} />

      {/* Touch drag preview */}
      <DraggingCardPreview
        position={sharedInteractionState.touchPosition}
        isActive={sharedInteractionState.touchDragging}
        cardWidth={layoutSizes.cardWidth}
        cardHeight={layoutSizes.cardHeight}
      >
        {sharedInteractionState.draggingCard &&
          (() => {
            const { index, cardCount } = sharedInteractionState.draggingCard;
            const column = gameState.tableau[index];
            if (!column) return null;
            const startIndex = column.cards.length - (cardCount ?? 1);
            const card = column.cards[startIndex];
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
        v{__BUILD_VERSION__}
      </div>
    </div>
  );
};
