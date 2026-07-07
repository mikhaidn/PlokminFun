/**
 * Fixed-timestep driver (RFC-008 03-engine.md). Real frame time is
 * accumulated and the simulation is advanced in whole 1/60s ticks, so gameplay
 * is frame-rate independent: a 144Hz screen and a stuttering phone run the
 * exact same simulation, they just render it more or less often.
 *
 * Rendering never feeds back into simulation — this only *drives* ticks.
 */
import { useEffect, useRef } from 'react';
import { TICKS_PER_SECOND } from '../engine';

const TICK_MS = 1000 / TICKS_PER_SECOND;
/** Cap ticks per frame so a background-tab pause can't trigger a catch-up spiral. */
const MAX_TICKS_PER_FRAME = 5;

export function useGameLoop(
  running: boolean,
  /** Advance one simulation tick. `firstOfFrame` marks the batch's first tick,
   *  so edge inputs (a key press) fire once rather than once per catch-up tick. */
  step: (firstOfFrame: boolean) => void,
  /** Called once after each frame's batch of ticks — the place to render. */
  onFrame?: () => void
): void {
  const stepRef = useRef(step);
  const onFrameRef = useRef(onFrame);
  // Keep the latest callbacks without restarting the rAF loop each render.
  useEffect(() => {
    stepRef.current = step;
    onFrameRef.current = onFrame;
  });

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    let accumulator = 0;

    const frame = (now: number): void => {
      accumulator += now - last;
      last = now;
      let ticks = 0;
      let first = true;
      while (accumulator >= TICK_MS && ticks < MAX_TICKS_PER_FRAME) {
        stepRef.current(first);
        accumulator -= TICK_MS;
        first = false;
        ticks++;
      }
      if (accumulator > TICK_MS) accumulator = 0; // fell behind: drop backlog
      if (ticks > 0) onFrameRef.current?.();
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [running]);
}
