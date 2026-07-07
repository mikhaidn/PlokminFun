/**
 * Live keyboard device source. It maintains "what's held" and "what was
 * pressed" refs from real DOM events; the game loop drains them once per
 * simulation tick through `readFrame`. All timing stays in the pure adapter —
 * this file only translates key codes to `Control`s via the active profile.
 */
import { useEffect, useMemo, useRef } from 'react';
import type { BindingProfile } from './bindings';
import { ALL_CONTROLS, type Control } from './controls';
import type { FrameInput } from './adapter';

/** Reverse index: key code → controls it triggers, from a keyboard profile. */
function codeToControls(profile: BindingProfile): Map<string, Control[]> {
  const map = new Map<string, Control[]>();
  for (const control of ALL_CONTROLS) {
    for (const code of profile.bindings[control]) {
      const list = map.get(code) ?? [];
      list.push(control);
      map.set(code, list);
    }
  }
  return map;
}

export interface KeyboardSource {
  /** Snapshot the current frame's input and clear the pressed-since buffer. */
  readFrame(): FrameInput;
}

export function useKeyboardSource(profile: BindingProfile, enabled: boolean): KeyboardSource {
  const held = useRef<Set<Control>>(new Set());
  const pressedBuffer = useRef<Control[]>([]);
  const codeMap = useMemo(() => codeToControls(profile), [profile]);

  useEffect(() => {
    if (!enabled || profile.device !== 'keyboard') return;
    const heldSet = held.current;
    const pressed = pressedBuffer.current;

    const onKeyDown = (e: KeyboardEvent): void => {
      const controls = codeMap.get(e.code);
      if (!controls) return;
      e.preventDefault();
      if (e.repeat) return; // OS key-repeat is ignored; DAS/ARR owns repeats
      for (const control of controls) {
        heldSet.add(control);
        pressed.push(control);
      }
    };
    const onKeyUp = (e: KeyboardEvent): void => {
      const controls = codeMap.get(e.code);
      if (!controls) return;
      for (const control of controls) heldSet.delete(control);
    };
    // Losing focus mid-hold would otherwise strand a key as "down" forever.
    const onBlur = (): void => heldSet.clear();

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      heldSet.clear();
      pressed.length = 0;
    };
  }, [enabled, profile.device, codeMap]);

  return useMemo(
    () => ({
      readFrame(): FrameInput {
        const pressed = pressedBuffer.current;
        pressedBuffer.current = [];
        return { held: new Set(held.current), pressed };
      },
    }),
    []
  );
}
