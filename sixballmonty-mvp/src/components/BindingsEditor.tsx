/**
 * Keyboard rebinding UI. Click a control, press a key, done — the new key is
 * bound and stolen from whatever else held it (see `rebind`). This is the
 * visible surface of the input-config system: every control is remappable and
 * persisted, and the same profile shape would drive a controller.
 */
import { useEffect, useState } from 'react';
import {
  ALL_CONTROLS,
  CONTROL_LABELS,
  rebind,
  resetBindings,
  saveBindings,
  type BindingProfile,
  type Control,
  type PlayerSlot,
} from '../input';

interface BindingsEditorProps {
  slot: PlayerSlot;
  profile: BindingProfile;
  onChange(profile: BindingProfile): void;
}

/** Friendly label for a KeyboardEvent.code. */
function keyLabel(code: string): string {
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  if (code.startsWith('Arrow'))
    return code.slice(5) === 'Up'
      ? '↑'
      : code.slice(5) === 'Down'
        ? '↓'
        : code.slice(5) === 'Left'
          ? '←'
          : '→';
  return code;
}

export function BindingsEditor({
  slot,
  profile,
  onChange,
}: BindingsEditorProps): React.JSX.Element {
  const [capturing, setCapturing] = useState<Control | null>(null);

  useEffect(() => {
    if (capturing === null) return;
    const onKey = (e: KeyboardEvent): void => {
      e.preventDefault();
      if (e.code === 'Escape') {
        setCapturing(null);
        return;
      }
      const next = rebind(profile, capturing, e.code);
      saveBindings(slot, next);
      onChange(next);
      setCapturing(null);
    };
    window.addEventListener('keydown', onKey, { capture: true });
    return () => window.removeEventListener('keydown', onKey, { capture: true });
  }, [capturing, profile, slot, onChange]);

  return (
    <div className="sbm-bindings">
      <h3 className="sbm-bindings__title">Keyboard controls</h3>
      <ul className="sbm-bindings__list">
        {ALL_CONTROLS.map((control) => (
          <li className="sbm-bindings__row" key={control}>
            <span className="sbm-bindings__control">{CONTROL_LABELS[control]}</span>
            <button
              type="button"
              className={`sbm-bindings__key ${capturing === control ? 'is-capturing' : ''}`}
              onClick={() => setCapturing(control)}
            >
              {capturing === control
                ? 'Press a key…'
                : profile.bindings[control].map(keyLabel).join(' / ') || '—'}
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="sbm-bindings__reset"
        onClick={() => onChange(resetBindings(slot))}
      >
        Reset to defaults
      </button>
    </div>
  );
}
