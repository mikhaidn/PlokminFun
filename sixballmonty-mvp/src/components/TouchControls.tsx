/**
 * On-screen button pad — the primary mobile scheme (RFC-008 lists a button pad
 * as the accessible touch option). Each button drives the same `Control`s as
 * the keyboard through a shared virtual source, so the engine can't tell touch
 * from keys. Hold-to-repeat "just works" because DAS/ARR lives in the adapter.
 */
import type { Control, VirtualSource } from '../input';

interface TouchControlsProps {
  source: VirtualSource;
  hardDropEnabled: boolean;
  minButtonHeight: number;
}

interface PadButtonProps {
  source: VirtualSource;
  control: Control;
  label: string;
  minHeight: number;
  /** Edge controls release immediately; held controls stay down until pointerup. */
  hold: boolean;
}

function PadButton({ source, control, label, minHeight, hold }: PadButtonProps): React.JSX.Element {
  const press = (e: React.PointerEvent): void => {
    e.preventDefault();
    source.press(control);
    if (!hold) {
      // Edge action: register the press, then release so it fires exactly once.
      source.release(control);
    }
  };
  const release = (): void => {
    if (hold) source.release(control);
  };
  return (
    <button
      type="button"
      className="sbm-pad__btn"
      style={{ minHeight, minWidth: minHeight }}
      onPointerDown={press}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
      aria-label={label}
    >
      {label}
    </button>
  );
}

export function TouchControls({
  source,
  hardDropEnabled,
  minButtonHeight,
}: TouchControlsProps): React.JSX.Element {
  return (
    <div className="sbm-pad" role="group" aria-label="Touch controls">
      <div className="sbm-pad__cluster">
        <PadButton source={source} control="moveLeft" label="◀" minHeight={minButtonHeight} hold />
        <PadButton source={source} control="softDrop" label="▼" minHeight={minButtonHeight} hold />
        <PadButton source={source} control="moveRight" label="▶" minHeight={minButtonHeight} hold />
      </div>
      <div className="sbm-pad__cluster">
        <PadButton
          source={source}
          control="rotateCCW"
          label="↺"
          minHeight={minButtonHeight}
          hold={false}
        />
        <PadButton
          source={source}
          control="rotateCW"
          label="↻"
          minHeight={minButtonHeight}
          hold={false}
        />
        {hardDropEnabled && (
          <PadButton
            source={source}
            control="hardDrop"
            label="⤓"
            minHeight={minButtonHeight}
            hold={false}
          />
        )}
      </div>
    </div>
  );
}
