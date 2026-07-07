/**
 * Ball palette + symbols. Color is always paired with a distinct shape so the
 * game is playable without color vision (RFC-008 accessibility requirement).
 * Kept separate from the Ball component so fast-refresh stays happy.
 */
export interface BallStyle {
  readonly fill: string;
  readonly symbol: string;
  readonly name: string;
}

export const BALL_STYLES: readonly BallStyle[] = [
  { fill: '#ef4444', symbol: '●', name: 'red' },
  { fill: '#22c55e', symbol: '▲', name: 'green' },
  { fill: '#3b82f6', symbol: '■', name: 'blue' },
  { fill: '#eab308', symbol: '◆', name: 'yellow' },
  { fill: '#a855f7', symbol: '★', name: 'purple' },
];

export const GARBAGE_STYLE: BallStyle = { fill: '#64748b', symbol: '✖', name: 'garbage' };

export function ballStyle(color: number | 'garbage'): BallStyle {
  return color === 'garbage' ? GARBAGE_STYLE : (BALL_STYLES[color] ?? GARBAGE_STYLE);
}
