/**
 * The playfield: a fixed grid of cells with balls positioned by row/col. A
 * top-out overlay covers it when the game ends.
 */
import type { GameState, MechanicsConfig } from '../engine';
import { getDisplayCells } from './displayGrid';
import { Ball } from './Ball';

interface WellProps {
  state: GameState;
  config: MechanicsConfig;
  cellSize: number;
}

export function Well({ state, config, cellSize }: WellProps): React.JSX.Element {
  const cells = getDisplayCells(state, config);
  const gap = 2;
  const width = config.board.columns * cellSize + (config.board.columns + 1) * gap;
  const height = config.board.rows * cellSize + (config.board.rows + 1) * gap;

  return (
    <div
      className="sbm-well"
      style={{ width, height, padding: gap }}
      role="grid"
      aria-label="Playfield"
    >
      {cells.map((cell) => (
        <div
          key={`${cell.row}-${cell.col}-${cell.visual}`}
          className="sbm-well__cell"
          style={{
            width: cellSize,
            height: cellSize,
            left: cell.col * (cellSize + gap) + gap,
            top: cell.row * (cellSize + gap) + gap,
          }}
        >
          <Ball color={cell.color} visual={cell.visual} size={cellSize} />
        </div>
      ))}
      {state.status === 'toppedOut' && (
        <div className="sbm-well__overlay">
          <span>Topped out</span>
        </div>
      )}
    </div>
  );
}
