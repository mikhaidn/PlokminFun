/**
 * The active game: well + HUD + preview + controls, with pause / game-over /
 * sprint-complete overlays. Owns nothing about *rules* — it reads engine
 * snapshots from useGame and paints them.
 */
import { useEffect, useRef } from 'react';
import type { BindingProfile } from '../input';
import type { MechanicsConfig } from '../engine';
import type { ModeDef } from '../sixballmonty.config';
import { useGame } from '../hooks/useGame';
import { useResponsiveCell } from '../hooks/useResponsiveCell';
import { Well } from './Well';
import { GameHud } from './GameHud';
import { PiecePreview } from './PiecePreview';
import { TouchControls } from './TouchControls';

interface GameScreenProps {
  mode: ModeDef;
  config: MechanicsConfig;
  profile: BindingProfile;
  onExit(): void;
  onOpenSettings(): void;
  onOpenHelp(): void;
}

export function GameScreen({
  mode,
  config,
  profile,
  onExit,
  onOpenSettings,
  onOpenHelp,
}: GameScreenProps): React.JSX.Element {
  const game = useGame(config, profile);
  const { state, running, touch, togglePause, restart, pause } = game;
  const { cellSize, isTouch } = useResponsiveCell(config.board.columns, config.board.rows);

  const goal = mode.clearGoal;
  const sprintWon = goal !== undefined && state.status === 'playing' && state.ballsCleared >= goal;
  const gameOver = state.status === 'toppedOut';

  // Stop the clock the instant a sprint goal is met.
  const wonRef = useRef(false);
  useEffect(() => {
    if (sprintWon && !wonRef.current) {
      wonRef.current = true;
      pause();
    }
    if (!sprintWon) wonRef.current = false;
  }, [sprintWon, pause]);

  // Pause on 'P'; the game's own key handling ignores it (not a bound control).
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.code === 'KeyP') togglePause();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePause]);

  const paused = !running && !gameOver && !sprintWon;

  return (
    <div className="sbm-game">
      <div className="sbm-topbar">
        <button
          type="button"
          className="sbm-topbar__btn"
          onClick={onExit}
          aria-label="Back to menu"
        >
          ‹ Menu
        </button>
        <span className="sbm-topbar__mode">{mode.label}</span>
        <div className="sbm-topbar__actions">
          {!gameOver && !sprintWon && (
            <button type="button" className="sbm-topbar__btn" onClick={togglePause}>
              {running ? 'Pause' : 'Resume'}
            </button>
          )}
          <button
            type="button"
            className="sbm-topbar__btn"
            onClick={onOpenSettings}
            aria-label="Settings"
          >
            ⚙
          </button>
          <button type="button" className="sbm-topbar__btn" onClick={onOpenHelp} aria-label="Help">
            ?
          </button>
        </div>
      </div>

      <div className="sbm-play">
        <div className="sbm-well-wrap">
          <Well state={state} config={config} cellSize={cellSize} />

          {paused && (
            <div className="sbm-modal-overlay">
              <div className="sbm-panel">
                <h2>Paused</h2>
                <button type="button" className="sbm-btn sbm-btn--primary" onClick={togglePause}>
                  Resume
                </button>
                <button type="button" className="sbm-btn" onClick={() => restart()}>
                  Restart
                </button>
              </div>
            </div>
          )}

          {gameOver && (
            <div className="sbm-modal-overlay">
              <div className="sbm-panel">
                <h2>Game over</h2>
                <p className="sbm-panel__stat">Score {state.score.toLocaleString()}</p>
                <p className="sbm-panel__stat">Balls cleared {state.ballsCleared}</p>
                <button
                  type="button"
                  className="sbm-btn sbm-btn--primary"
                  onClick={() => restart()}
                >
                  Play again
                </button>
                <button type="button" className="sbm-btn" onClick={onExit}>
                  Menu
                </button>
              </div>
            </div>
          )}

          {sprintWon && (
            <div className="sbm-modal-overlay">
              <div className="sbm-panel">
                <h2>Cleared! 🎉</h2>
                <p className="sbm-panel__stat">
                  {goal} balls in {Math.floor(state.elapsedTicks / 60)}s
                </p>
                <button
                  type="button"
                  className="sbm-btn sbm-btn--primary"
                  onClick={() => restart()}
                >
                  Try again
                </button>
                <button type="button" className="sbm-btn" onClick={onExit}>
                  Menu
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="sbm-side">
          <GameHud state={state} mode={mode} />
          <PiecePreview
            queue={state.queue}
            count={config.piece.previewCount}
            cellSize={Math.round(cellSize * 0.7)}
          />
        </div>
      </div>

      {isTouch && !gameOver && !sprintWon && (
        <TouchControls
          source={touch}
          hardDropEnabled={config.gravity.hardDrop}
          minButtonHeight={52}
        />
      )}
    </div>
  );
}
