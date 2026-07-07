/**
 * App-level wiring: modes, preset selection, and help content. Mirrors the
 * `*.config.ts` convention of the other games. All tuning still lives in the
 * engine presets (placeholder values until the tuning pass).
 */
import type { HelpContent } from '@plokmin/shared';
import { CLASSIC, MINI, FRANTIC, type MechanicsConfig } from './engine';

export type Mode = 'marathon' | 'sprint';

export interface ModeDef {
  readonly id: Mode;
  readonly label: string;
  readonly blurb: string;
  readonly config: MechanicsConfig;
  /** Sprint goal: clear this many balls as fast as possible. */
  readonly clearGoal?: number;
}

export const MODES: Record<Mode, ModeDef> = {
  marathon: {
    id: 'marathon',
    label: 'Marathon',
    blurb: 'Survive as the drop speed ramps up. Chase a high score.',
    config: CLASSIC,
  },
  sprint: {
    id: 'sprint',
    label: 'Sprint',
    blurb: 'Clear 40 balls as fast as you can.',
    config: { ...MINI, gravity: { ...MINI.gravity, hardDrop: true } },
    clearGoal: 40,
  },
};

/** Extra presets selectable in settings (Marathon speed variants). */
export const SPEED_PRESETS: Record<string, MechanicsConfig> = {
  classic: CLASSIC,
  frantic: FRANTIC,
};

export const HELP_CONTENT: HelpContent = {
  gameName: '6 Ball Monty',
  objective:
    'Drop pairs of colored balls into the well. Connect 4 or more of the same color to pop them. Pops make balls above fall, which can trigger chain reactions. Keep the well from filling to the top.',
  rules: [
    'Balls arrive in pairs and fall from the top.',
    'A group of 4+ same-colored balls touching side-to-side or top-to-bottom pops.',
    'Popping makes the balls above fall — new groups pop as a chain for bonus points.',
    'The game ends when a new pair can no longer enter the well.',
  ],
  validMoves: [
    'Move the pair left or right.',
    'Rotate the pair around its pivot ball.',
    'Soft drop to speed the fall; hard drop (when enabled) to slam it down.',
  ],
  tips: [
    'Set up chains: bury a color so popping one group drops balls into another.',
    'Keep the well flat — tall single columns leave no room to recover.',
  ],
  keyboardShortcuts: [
    { key: '← →', action: 'Move left / right' },
    { key: '↑ / X', action: 'Rotate clockwise' },
    { key: 'Z', action: 'Rotate counter-clockwise' },
    { key: '↓', action: 'Soft drop' },
    { key: 'Space', action: 'Hard drop' },
    { key: 'P', action: 'Pause' },
  ],
};
