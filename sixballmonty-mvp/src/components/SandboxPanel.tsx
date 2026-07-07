/**
 * The sandbox's live-tweak strip: gravity / colors / pop-threshold selectors
 * plus the reproducibility row (visible seed, same-seed restart, new seed).
 * Changing a knob rebuilds the game with the new mechanics — instant, no
 * menu round-trip, which is the whole point for user-testing sessions.
 */
import { SANDBOX_GRAVITY_LABELS, type SandboxGravity, type SandboxOptions } from '../sandbox';

interface SandboxPanelProps {
  options: SandboxOptions;
  onChange(options: SandboxOptions): void;
  seed: number;
  onReplaySeed(): void;
  onNewSeed(): void;
}

export function SandboxPanel({
  options,
  onChange,
  seed,
  onReplaySeed,
  onNewSeed,
}: SandboxPanelProps): React.JSX.Element {
  return (
    <div className="sbm-sandbox" role="group" aria-label="Sandbox options">
      <label className="sbm-sandbox__field">
        <span>Gravity</span>
        <select
          value={options.gravity}
          onChange={(e) => onChange({ ...options, gravity: e.target.value as SandboxGravity })}
        >
          {Object.entries(SANDBOX_GRAVITY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="sbm-sandbox__field">
        <span>Colors</span>
        <select
          value={options.colors}
          onChange={(e) => onChange({ ...options, colors: Number(e.target.value) as 3 | 4 | 5 })}
        >
          {[3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>
      <label className="sbm-sandbox__field">
        <span>Pop at</span>
        <select
          value={options.matchSize}
          onChange={(e) => onChange({ ...options, matchSize: Number(e.target.value) as 3 | 4 | 5 })}
        >
          {[3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}+
            </option>
          ))}
        </select>
      </label>
      <div className="sbm-sandbox__seed">
        <span className="sbm-sandbox__seedvalue" title="Game seed — same seed, same pieces">
          #{seed}
        </span>
        <button type="button" className="sbm-topbar__btn" onClick={onReplaySeed}>
          ↻ Same seed
        </button>
        <button type="button" className="sbm-topbar__btn" onClick={onNewSeed}>
          🎲 New
        </button>
      </div>
    </div>
  );
}
