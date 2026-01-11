import { Period, PeriodLog, PERIOD_EMOJIS, PERIOD_LABELS } from '../types';

interface PeriodCardProps {
  period: Period;
  log: PeriodLog;
  onChange: (updates: Partial<PeriodLog>) => void;
}

export function PeriodCard({ period, log, onChange }: PeriodCardProps) {
  return (
    <div className="period-card">
      <div className="period-header">
        <span className="period-emoji">{PERIOD_EMOJIS[period]}</span>
        <h2 className="period-title">{PERIOD_LABELS[period]}</h2>
      </div>

      <div className="activity-grid">
        <label className="activity-checkbox">
          <input
            type="checkbox"
            checked={log.pee}
            onChange={(e) => onChange({ pee: e.target.checked })}
          />
          <span className="activity-label">💧 Pee</span>
        </label>

        <label className="activity-checkbox">
          <input
            type="checkbox"
            checked={log.poop}
            onChange={(e) => onChange({ poop: e.target.checked })}
          />
          <span className="activity-label">💩 Poop</span>
        </label>

        <label className="activity-checkbox">
          <input
            type="checkbox"
            checked={log.walk}
            onChange={(e) => onChange({ walk: e.target.checked })}
          />
          <span className="activity-label">🚶 Walk</span>
        </label>
      </div>

      <div className="notes-section">
        <textarea
          className="notes-input"
          placeholder="Notes (optional)..."
          value={log.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          rows={2}
        />
      </div>
    </div>
  );
}
