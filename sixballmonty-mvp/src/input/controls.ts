/**
 * The layer between physical devices and the engine (RFC-008 04).
 *
 * Devices never speak to the engine directly. Every device — keyboard,
 * gamepad, touch, and later the network — is reduced to the same six logical
 * `Control`s, which an adapter turns into engine `InputEvent`s. This is the
 * load-bearing seam: swap the device, keep everything downstream.
 *
 *   device raw events → Control up/down → adapter → InputEvent[] → engine.tick
 */

/** The six logical buttons the game understands, independent of any device. */
export type Control = 'moveLeft' | 'moveRight' | 'rotateCW' | 'rotateCCW' | 'softDrop' | 'hardDrop';

export const ALL_CONTROLS: readonly Control[] = [
  'moveLeft',
  'moveRight',
  'rotateCW',
  'rotateCCW',
  'softDrop',
  'hardDrop',
];

/**
 * How each control behaves over time — this, not the device, decides the
 * translation to engine events:
 *  - `repeat`  held, auto-shifts via DAS/ARR (horizontal movement)
 *  - `toggle`  held, emits a start on press and an end on release (soft drop)
 *  - `edge`    one action per press, ignores holding (rotations, hard drop)
 */
export const CONTROL_KIND: Record<Control, 'repeat' | 'toggle' | 'edge'> = {
  moveLeft: 'repeat',
  moveRight: 'repeat',
  softDrop: 'toggle',
  rotateCW: 'edge',
  rotateCCW: 'edge',
  hardDrop: 'edge',
};

/** Human-readable names for the settings/binding UI. */
export const CONTROL_LABELS: Record<Control, string> = {
  moveLeft: 'Move left',
  moveRight: 'Move right',
  rotateCW: 'Rotate ↻',
  rotateCCW: 'Rotate ↺',
  softDrop: 'Soft drop',
  hardDrop: 'Hard drop',
};
