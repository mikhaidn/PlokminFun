/**
 * A single ball. Color always carries a distinct symbol (see ballStyles) so
 * the game reads without color vision.
 */
import { ballStyle } from './ballStyles';

interface BallProps {
  color: number | 'garbage';
  /** 'settled' | 'active' | 'clearing' | 'garbage' */
  visual: string;
  size: number;
}

export function Ball({ color, visual, size }: BallProps): React.JSX.Element {
  const style = ballStyle(color);
  return (
    <div
      className={`sbm-ball sbm-ball--${visual}`}
      style={{
        width: size,
        height: size,
        background: style.fill,
        fontSize: size * 0.5,
      }}
      aria-label={style.name}
    >
      <span className="sbm-ball__symbol">{style.symbol}</span>
    </div>
  );
}
