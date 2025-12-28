import React from 'react';
import type { GameControlsProps } from '../types/GameControls';

/**
 * Reusable game controls component for card games.
 * Provides standard buttons: Undo, Redo, Reset, Settings, Hints, New Game.
 *
 * Used by FreeCell and Klondike solitaire games.
 */
export const GameControls: React.FC<GameControlsProps> = ({
  moves,
  seed,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  onNewGame,
  showSettings = false,
  onSettings,
  showHelp = false,
  onHelp,
  showHints = false,
  hintsEnabled = false,
  onToggleHints,
  showAutoComplete = false,
  onAutoComplete,
  isMobile = false,
  minButtonHeight = 44,
  buttonPadding = '10px 18px',
  fontSize = 1.0,
}) => {
  const buttonStyle = (
    disabled: boolean = false,
    highlighted: boolean = false
  ): React.CSSProperties => ({
    padding: buttonPadding,
    minHeight: `${minButtonHeight}px`,
    cursor: disabled ? 'not-allowed' : 'pointer',
    backgroundColor: highlighted ? '#4caf50' : 'white',
    color: highlighted ? 'white' : 'black',
    border: highlighted ? 'none' : '1px solid #ccc',
    borderRadius: '4px',
    fontSize: `${fontSize}em`,
    fontWeight: highlighted ? 'bold' : 'normal',
    opacity: disabled ? 0.5 : 1,
  });

  const primaryButtonStyle = (): React.CSSProperties => ({
    padding: isMobile ? '10px 24px' : '12px 32px',
    minHeight: `${minButtonHeight}px`,
    cursor: 'pointer',
    backgroundColor: '#4caf50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontWeight: 'bold',
    fontSize: `${fontSize}em`,
  });

  return (
    <div
      style={{
        display: 'flex',
        gap: isMobile ? '8px' : '12px',
        alignItems: 'center',
        flexWrap: 'wrap',
        fontSize: `${fontSize}em`,
      }}
    >
      {/* Move counter */}
      <span>
        Moves: {moves}
        {seed !== undefined && ` • Seed: ${seed}`}
      </span>

      {/* Undo button */}
      <button
        onClick={onUndo}
        disabled={!canUndo}
        style={buttonStyle(!canUndo)}
        title="Undo last move (U or Ctrl+Z)"
        aria-label="Undo last move"
      >
        ↶ Undo
      </button>

      {/* Redo button */}
      <button
        onClick={onRedo}
        disabled={!canRedo}
        style={buttonStyle(!canRedo)}
        title="Redo move (R or Ctrl+Y)"
        aria-label="Redo move"
      >
        ↷ Redo
      </button>

      {/* Settings button (optional) */}
      {showSettings && onSettings && (
        <button
          onClick={onSettings}
          style={buttonStyle()}
          title="Game Settings"
          aria-label="Game Settings"
        >
          ⚙️ Settings
        </button>
      )}

      {/* Help button (optional) */}
      {showHelp && onHelp && (
        <button
          onClick={onHelp}
          style={buttonStyle()}
          title="How to Play - Rules and Keyboard Shortcuts"
          aria-label="Help and Rules"
        >
          ❓ Help
        </button>
      )}

      {/* Hints button (optional) */}
      {showHints && onToggleHints && (
        <button
          onClick={onToggleHints}
          style={buttonStyle(false, hintsEnabled)}
          title="Toggle hints to highlight next playable cards"
        >
          💡 Hints
        </button>
      )}

      {/* Auto-Complete button (optional, for Klondike) */}
      {showAutoComplete && onAutoComplete && (
        <button
          onClick={onAutoComplete}
          style={buttonStyle()}
          title="Automatically move all remaining cards to foundations (works when all tableau cards are face-up and stock/waste are empty)"
          aria-label="Auto-complete game by moving all remaining cards to foundations"
        >
          ⚡ Auto-Complete
        </button>
      )}

      {/* Reset button */}
      <button
        onClick={onReset}
        style={buttonStyle()}
        title="Restart the current game from the beginning"
      >
        ↺ Reset
      </button>

      {/* New Game button */}
      <button onClick={onNewGame} style={primaryButtonStyle()} title="Start a new game">
        New Game
      </button>
    </div>
  );
};
