/**
 * The "next" queue: the upcoming pairs, pivot ball on the bottom.
 */
import type { BallPair } from '../engine';
import { Ball } from './Ball';

interface PiecePreviewProps {
  queue: readonly BallPair[];
  count: number;
  cellSize: number;
}

export function PiecePreview({ queue, count, cellSize }: PiecePreviewProps): React.JSX.Element {
  return (
    <div className="sbm-preview" aria-label="Next pieces">
      <span className="sbm-preview__label">Next</span>
      {queue.slice(0, count).map((pair, i) => (
        <div className="sbm-preview__piece" key={i}>
          <Ball color={pair[1]} visual="settled" size={cellSize} />
          <Ball color={pair[0]} visual="settled" size={cellSize} />
        </div>
      ))}
    </div>
  );
}
