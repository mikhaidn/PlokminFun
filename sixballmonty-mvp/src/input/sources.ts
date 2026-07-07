/**
 * Input sources beyond the keyboard, and frame merging.
 *
 * A "source" is anything that can report a `FrameInput` for the current tick.
 * The virtual source backs on-screen touch buttons; merging lets a player use
 * several at once (touch + keyboard), and is exactly where a network peer or a
 * replay would plug in later — all device-uniform.
 */
import { useMemo, useRef } from 'react';
import type { Control } from './controls';
import type { FrameInput } from './adapter';

export interface InputSource {
  readFrame(): FrameInput;
}

export interface VirtualSource extends InputSource {
  /** Begin holding a control (touch/mouse down on a button). */
  press(control: Control): void;
  /** Release a held control. */
  release(control: Control): void;
}

/** A source driven imperatively — used by the on-screen touch pad. */
export function useVirtualSource(): VirtualSource {
  const held = useRef<Set<Control>>(new Set());
  const pressedBuffer = useRef<Control[]>([]);

  return useMemo(
    () => ({
      press(control: Control): void {
        if (!held.current.has(control)) pressedBuffer.current.push(control);
        held.current.add(control);
      },
      release(control: Control): void {
        held.current.delete(control);
      },
      readFrame(): FrameInput {
        const pressed = pressedBuffer.current;
        pressedBuffer.current = [];
        return { held: new Set(held.current), pressed };
      },
    }),
    []
  );
}

/** Union of held controls, concatenation of pressed controls across sources. */
export function mergeFrames(frames: readonly FrameInput[]): FrameInput {
  const held = new Set<Control>();
  const pressed: Control[] = [];
  for (const frame of frames) {
    for (const control of frame.held) held.add(control);
    pressed.push(...frame.pressed);
  }
  return { held, pressed };
}
