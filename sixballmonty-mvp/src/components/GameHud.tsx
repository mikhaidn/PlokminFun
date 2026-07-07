/**
 * Score / chain / progress readout beside the well.
 */
import type { GameState } from '../engine';
import type { ModeDef } from '../sixballmonty.config';

interface GameHudProps {
  state: GameState;
  mode: ModeDef;
}

function formatTime(ticks: number): string {
  const totalSeconds = Math.floor(ticks / 60);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function GameHud({ state, mode }: GameHudProps): React.JSX.Element {
  const goal = mode.clearGoal;
  return (
    <div className="sbm-hud">
      <div className="sbm-hud__stat">
        <span className="sbm-hud__label">Score</span>
        <span className="sbm-hud__value">{state.score.toLocaleString()}</span>
      </div>
      {goal !== undefined ? (
        <div className="sbm-hud__stat">
          <span className="sbm-hud__label">Cleared</span>
          <span className="sbm-hud__value">
            {Math.min(state.ballsCleared, goal)}/{goal}
          </span>
        </div>
      ) : (
        <div className="sbm-hud__stat">
          <span className="sbm-hud__label">Cleared</span>
          <span className="sbm-hud__value">{state.ballsCleared}</span>
        </div>
      )}
      <div className="sbm-hud__stat">
        <span className="sbm-hud__label">Time</span>
        <span className="sbm-hud__value">{formatTime(state.elapsedTicks)}</span>
      </div>
      {state.chainCount > 1 && <div className="sbm-hud__chain">Chain ×{state.chainCount}!</div>}
    </div>
  );
}
