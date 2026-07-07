/**
 * Binding profiles: the mapping from physical inputs to logical `Control`s.
 *
 * A binding token is device-namespaced so one profile shape covers every
 * device:
 *  - keyboard: a `KeyboardEvent.code`, e.g. `"ArrowLeft"`, `"KeyA"`, `"Space"`
 *  - gamepad:  `"btn<n>"` for a button, `"axis<n>-"` / `"axis<n>+"` for a
 *              stick/trigger past its deadzone, following the W3C Standard
 *              Gamepad layout (btn14=dpad-left, btn0=south/A, …)
 *
 * Stored custom bindings are a **wire contract** (localStorage; a save from an
 * old build must still load) — hence the version + validating loader below.
 * Registered in RFC-006 06-wire-contracts.md.
 */
import { ALL_CONTROLS, type Control } from './controls';

export type BindingDevice = 'keyboard' | 'gamepad';

export interface BindingProfile {
  readonly id: string;
  readonly label: string;
  readonly device: BindingDevice;
  /** Each control maps to one or more device tokens; any of them triggers it. */
  readonly bindings: Readonly<Record<Control, readonly string[]>>;
}

// --- Default profiles ------------------------------------------------------

/** Player 1 keyboard: arrows + Z/X/Space, the genre-standard layout. */
export const KEYBOARD_P1: BindingProfile = {
  id: 'keyboard-p1',
  label: 'Keyboard (Player 1)',
  device: 'keyboard',
  bindings: {
    moveLeft: ['ArrowLeft'],
    moveRight: ['ArrowRight'],
    softDrop: ['ArrowDown'],
    rotateCW: ['ArrowUp', 'KeyX'],
    rotateCCW: ['KeyZ'],
    hardDrop: ['Space'],
  },
};

/** Player 2 keyboard: left-hand WASD cluster, for same-device local versus. */
export const KEYBOARD_P2: BindingProfile = {
  id: 'keyboard-p2',
  label: 'Keyboard (Player 2)',
  device: 'keyboard',
  bindings: {
    moveLeft: ['KeyA'],
    moveRight: ['KeyD'],
    softDrop: ['KeyS'],
    rotateCW: ['KeyW'],
    rotateCCW: ['KeyQ'],
    hardDrop: ['KeyE'],
  },
};

/** Standard Gamepad layout. Live polling arrives in Phase 3; the mapping
 *  lives here now so the config story is complete and device-uniform. */
export const GAMEPAD_STANDARD: BindingProfile = {
  id: 'gamepad-standard',
  label: 'Controller',
  device: 'gamepad',
  bindings: {
    moveLeft: ['btn14', 'axis0-'], // dpad-left, left-stick left
    moveRight: ['btn15', 'axis0+'], // dpad-right, left-stick right
    softDrop: ['btn13', 'axis1+'], // dpad-down, left-stick down
    rotateCW: ['btn0', 'btn5'], // A / RB
    rotateCCW: ['btn2', 'btn4'], // X / LB
    hardDrop: ['btn12', 'btn3'], // dpad-up / Y
  },
};

export const DEFAULT_PROFILES: Readonly<Record<string, BindingProfile>> = {
  'keyboard-p1': KEYBOARD_P1,
  'keyboard-p2': KEYBOARD_P2,
  'gamepad-standard': GAMEPAD_STANDARD,
};

/** Player slots. Phase 2 uses only p1; p2 is wired for Phase 3 local versus. */
export type PlayerSlot = 'p1' | 'p2';

export const DEFAULT_SLOT_PROFILE: Record<PlayerSlot, string> = {
  p1: 'keyboard-p1',
  p2: 'keyboard-p2',
};

// --- Rebinding --------------------------------------------------------------

/** Returns a new profile with `token` bound to `control` (and removed from any
 *  other control in the same profile, so one physical input maps to one action). */
export function rebind(profile: BindingProfile, control: Control, token: string): BindingProfile {
  const bindings: Record<Control, string[]> = {} as Record<Control, string[]>;
  for (const c of ALL_CONTROLS) {
    const without = profile.bindings[c].filter((t) => t !== token);
    bindings[c] = c === control ? [...without, token] : without;
  }
  return { ...profile, bindings };
}

/** The control a token is currently bound to in a profile, if any. */
export function controlForToken(profile: BindingProfile, token: string): Control | null {
  for (const c of ALL_CONTROLS) {
    if (profile.bindings[c].includes(token)) return c;
  }
  return null;
}

// --- Storage (versioned wire contract) -------------------------------------

const STORAGE_KEY = 'sixballmonty.bindings';
export const BINDINGS_STORAGE_VERSION = 1;

interface StoredBindings {
  version: number;
  /** Only custom overrides are stored, keyed by slot. */
  slots: Partial<Record<PlayerSlot, BindingProfile>>;
}

function isProfile(value: unknown): value is BindingProfile {
  if (typeof value !== 'object' || value === null) return false;
  const p = value as Record<string, unknown>;
  if (typeof p.id !== 'string' || (p.device !== 'keyboard' && p.device !== 'gamepad')) {
    return false;
  }
  if (typeof p.bindings !== 'object' || p.bindings === null) return false;
  const b = p.bindings as Record<string, unknown>;
  return ALL_CONTROLS.every(
    (c) => Array.isArray(b[c]) && (b[c] as unknown[]).every((t) => typeof t === 'string')
  );
}

/** Load a slot's profile: a stored custom one if valid, else the default. */
export function loadBindings(slot: PlayerSlot): BindingProfile {
  const fallback = DEFAULT_PROFILES[DEFAULT_SLOT_PROFILE[slot]];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as StoredBindings;
    if (parsed.version !== BINDINGS_STORAGE_VERSION) return fallback; // future: migrate
    const stored = parsed.slots?.[slot];
    return stored && isProfile(stored) ? stored : fallback;
  } catch {
    return fallback;
  }
}

/** Persist a slot's custom profile, leaving other slots intact. */
export function saveBindings(slot: PlayerSlot, profile: BindingProfile): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const current: StoredBindings =
      raw && (JSON.parse(raw) as StoredBindings).version === BINDINGS_STORAGE_VERSION
        ? (JSON.parse(raw) as StoredBindings)
        : { version: BINDINGS_STORAGE_VERSION, slots: {} };
    current.slots[slot] = profile;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // localStorage unavailable (private mode, quota) — bindings stay in-memory
  }
}

export function resetBindings(slot: PlayerSlot): BindingProfile {
  const fallback = DEFAULT_PROFILES[DEFAULT_SLOT_PROFILE[slot]];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredBindings;
      delete parsed.slots?.[slot];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
  } catch {
    // ignore
  }
  return fallback;
}
