import { DayLog } from '../types';

interface DaySummaryProps {
  dayLog: DayLog;
  onChange: (updates: Partial<Pick<DayLog, 'summary' | 'photoUrl'>>) => void;
}

export function DaySummary({ dayLog, onChange }: DaySummaryProps) {
  return (
    <div className="day-summary-card">
      <div className="day-summary-header">
        <span className="day-summary-icon">📝</span>
        <h3 className="day-summary-title">Day Summary</h3>
      </div>

      <div className="day-summary-content">
        <div className="summary-field">
          <label htmlFor="summary" className="field-label">
            Notes
          </label>
          <textarea
            id="summary"
            className="summary-textarea"
            placeholder="Overall notes for the day..."
            value={dayLog.summary || ''}
            onChange={(e) => onChange({ summary: e.target.value })}
            rows={3}
          />
        </div>

        <div className="summary-field">
          <label htmlFor="photoUrl" className="field-label">
            Photo Link <span className="field-hint">(optional)</span>
          </label>
          <input
            type="url"
            id="photoUrl"
            className="photo-input"
            placeholder="Paste photo URL from iCloud, Google Photos, etc."
            value={dayLog.photoUrl || ''}
            onChange={(e) => onChange({ photoUrl: e.target.value })}
          />
          {dayLog.photoUrl && (
            <div className="photo-preview">
              <img
                src={dayLog.photoUrl}
                alt="Day photo"
                className="photo-preview-img"
                onError={(e) => {
                  // Hide broken images
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
