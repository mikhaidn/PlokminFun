/**
 * Top-level app: menu → game, plus the settings (bindings + speed preset) and
 * help modals. Kept deliberately thin; all gameplay lives under GameScreen.
 */
import { useMemo, useState } from 'react';
import { HelpModal } from '@plokmin/shared';
import { MODES, SPEED_PRESETS, HELP_CONTENT, type Mode } from './sixballmonty.config';
import { buildSandboxConfig, DEFAULT_SANDBOX_OPTIONS, type SandboxOptions } from './sandbox';
import { loadBindings, type BindingProfile } from './input';
import { GameScreen } from './components/GameScreen';
import { BindingsEditor } from './components/BindingsEditor';
import { SandboxPanel } from './components/SandboxPanel';
import './index.css';

type Screen = 'menu' | 'playing';

export default function App(): React.JSX.Element {
  const [screen, setScreen] = useState<Screen>('menu');
  const [mode, setMode] = useState<Mode>('marathon');
  const [speedPreset, setSpeedPreset] = useState<string>('classic');
  const [sandboxOptions, setSandboxOptions] = useState<SandboxOptions>(DEFAULT_SANDBOX_OPTIONS);
  const [profile, setProfile] = useState<BindingProfile>(() => loadBindings('p1'));
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Marathon honors the chosen speed preset; Sprint is fixed; Sandbox is
  // rebuilt live from its knobs.
  const config = useMemo(() => {
    if (mode === 'marathon') return SPEED_PRESETS[speedPreset] ?? MODES.marathon.config;
    if (mode === 'sandbox') return buildSandboxConfig(sandboxOptions);
    return MODES[mode].config;
  }, [mode, speedPreset, sandboxOptions]);

  // Changing a sandbox knob remounts the game with the new mechanics.
  const gameKey =
    mode === 'sandbox'
      ? `sandbox-${sandboxOptions.gravity}-${sandboxOptions.colors}-${sandboxOptions.matchSize}`
      : mode;

  return (
    <div className="sbm-app">
      {screen === 'menu' && (
        <div className="sbm-menu">
          <h1 className="sbm-menu__title">
            <span className="sbm-menu__ball">🎱</span> 6 Ball Monty
          </h1>
          <p className="sbm-menu__tagline">Drop, match, chain.</p>

          <div className="sbm-menu__modes">
            {Object.values(MODES).map((m) => (
              <button
                key={m.id}
                type="button"
                className="sbm-modecard"
                onClick={() => {
                  setMode(m.id);
                  setScreen('playing');
                }}
              >
                <span className="sbm-modecard__label">{m.label}</span>
                <span className="sbm-modecard__blurb">{m.blurb}</span>
              </button>
            ))}
          </div>

          <div className="sbm-menu__links">
            <button type="button" className="sbm-btn" onClick={() => setShowSettings(true)}>
              Controls & settings
            </button>
            <button type="button" className="sbm-btn" onClick={() => setShowHelp(true)}>
              How to play
            </button>
          </div>
        </div>
      )}

      {screen === 'playing' && (
        <GameScreen
          key={gameKey}
          mode={MODES[mode]}
          config={config}
          profile={profile}
          onExit={() => setScreen('menu')}
          onOpenSettings={() => setShowSettings(true)}
          onOpenHelp={() => setShowHelp(true)}
          renderExtras={
            mode === 'sandbox'
              ? (game) => (
                  <SandboxPanel
                    options={sandboxOptions}
                    onChange={setSandboxOptions}
                    seed={game.seed}
                    onReplaySeed={() => game.restart(game.seed)}
                    onNewSeed={() => game.restart()}
                  />
                )
              : undefined
          }
        />
      )}

      {showSettings && (
        <div className="sbm-modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="sbm-panel sbm-panel--wide" onClick={(e) => e.stopPropagation()}>
            <h2>Controls & settings</h2>

            <label className="sbm-field">
              <span>Marathon speed</span>
              <select value={speedPreset} onChange={(e) => setSpeedPreset(e.target.value)}>
                {Object.keys(SPEED_PRESETS).map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            </label>
            <p className="sbm-field__note">Tuning values are placeholders pending playtesting.</p>

            <BindingsEditor slot="p1" profile={profile} onChange={setProfile} />

            <button
              type="button"
              className="sbm-btn sbm-btn--primary"
              onClick={() => setShowSettings(false)}
            >
              Done
            </button>
          </div>
        </div>
      )}

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} content={HELP_CONTENT} />
    </div>
  );
}
