/**
 * The solo game controller: owns engine state, drives the fixed-timestep loop,
 * and pipes merged input sources through the pure adapter into `engine.tick`.
 *
 * React only sees a snapshot updated once per frame; the authoritative engine
 * state lives in a ref so the simulation never depends on render timing.
 */
import { useCallback, useMemo, useRef, useState } from 'react';
import { createInitialState, tick, type GameState, type MechanicsConfig } from '../engine';
import {
  INITIAL_ADAPTER_STATE,
  mergeFrames,
  stepAdapter,
  useKeyboardSource,
  useVirtualSource,
  type AdapterState,
  type BindingProfile,
  type InputSource,
  type VirtualSource,
} from '../input';
import { useGameLoop } from './useGameLoop';

export interface UseGameResult {
  state: GameState;
  running: boolean;
  /** Seed of the current game — display it so sessions are reproducible. */
  seed: number;
  /** On-screen touch pad drives this source. */
  touch: VirtualSource;
  pause(): void;
  resume(): void;
  togglePause(): void;
  restart(seed?: number): void;
}

function randomSeed(): number {
  return Math.floor(Math.random() * 0x7fffffff);
}

export function useGame(
  config: MechanicsConfig,
  profile: BindingProfile,
  initialSeed?: number
): UseGameResult {
  const [seed, setSeed] = useState(initialSeed ?? randomSeed());
  const [snapshot, setSnapshot] = useState<GameState>(() => createInitialState(seed, config));
  const engineRef = useRef<GameState>(snapshot);
  const [paused, setPaused] = useState(false);

  const adapterRef = useRef<AdapterState>(INITIAL_ADAPTER_STATE);
  const heldFrameRef = useRef(mergeFrames([]));

  const running = !paused && snapshot.status === 'playing';
  const keyboard = useKeyboardSource(profile, running);
  const touch = useVirtualSource();
  const sources = useMemo<InputSource[]>(() => [keyboard, touch], [keyboard, touch]);

  const autoShift = useMemo(
    () => ({ dasMs: config.input.dasMs, arrMs: config.input.arrMs }),
    [config.input.dasMs, config.input.arrMs]
  );

  const step = useCallback(
    (firstOfFrame: boolean) => {
      const engine = engineRef.current;
      if (engine.status !== 'playing') return;

      // Edge inputs fire once per frame; held state applies to every catch-up tick.
      const frame = firstOfFrame
        ? mergeFrames(sources.map((s) => s.readFrame()))
        : { held: heldFrameRef.current.held, pressed: [] };
      heldFrameRef.current = frame;

      const { state: nextAdapter, events } = stepAdapter(
        adapterRef.current,
        frame,
        autoShift,
        engine.elapsedTicks
      );
      adapterRef.current = nextAdapter;
      engineRef.current = tick(engine, events, config);
    },
    [sources, autoShift, config]
  );

  const render = useCallback(() => {
    setSnapshot(engineRef.current);
  }, []);

  useGameLoop(running, step, render);

  const restart = useCallback(
    (nextSeed?: number) => {
      const s = nextSeed ?? randomSeed();
      setSeed(s);
      engineRef.current = createInitialState(s, config);
      adapterRef.current = INITIAL_ADAPTER_STATE;
      heldFrameRef.current = mergeFrames([]);
      setSnapshot(engineRef.current);
      setPaused(false);
    },
    [config]
  );

  return {
    state: snapshot,
    running,
    seed,
    touch,
    pause: useCallback(() => setPaused(true), []),
    resume: useCallback(() => setPaused(false), []),
    togglePause: useCallback(() => setPaused((p) => !p), []),
    restart,
  };
}

export { randomSeed };
