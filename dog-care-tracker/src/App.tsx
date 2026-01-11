import { PeriodCard } from './components/PeriodCard';
import { ShareButton } from './components/ShareButton';
import { ImportButton } from './components/ImportButton';
import { useDayLog } from './hooks/useDayLog';
import { Period } from './types';
import './App.css';

function App() {
  const { dayLog, updatePeriod, importLog, clearLog } = useDayLog();

  const todayFormatted = new Date(dayLog.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const periods: Period[] = ['morning', 'afternoon', 'night'];

  const handleClear = () => {
    if (window.confirm('Clear all entries for today? This cannot be undone.')) {
      clearLog();
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🐕 Dog Care Tracker</h1>
        <p className="date">{todayFormatted}</p>
      </header>

      <main className="app-main">
        {periods.map((period) => (
          <PeriodCard
            key={period}
            period={period}
            log={dayLog.periods[period]}
            onChange={(updates) => updatePeriod(period, updates)}
          />
        ))}
      </main>

      <footer className="app-footer">
        <div className="button-group">
          <button className="btn btn-danger" onClick={handleClear}>
            🗑️ Clear
          </button>
          <ImportButton onImport={importLog} />
          <ShareButton dayLog={dayLog} />
        </div>
      </footer>
    </div>
  );
}

export default App;
