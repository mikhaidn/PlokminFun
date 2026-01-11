import { useState } from 'react';
import { PeriodCard } from './components/PeriodCard';
import { ShareButton } from './components/ShareButton';
import { ImportButton } from './components/ImportButton';
import { DaySummary } from './components/DaySummary';
import { useDayLog } from './hooks/useDayLog';
import { Period } from './types';
import './App.css';

function App() {
  // Get today's date in YYYY-MM-DD format
  const getTodayString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Add 1 because of 0-indexing!
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const { dayLog, updatePeriod, updateDayLog, importLog, clearLog } = useDayLog(selectedDate);

  const formatDate = (date: string) => new Date(date).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const periods: Period[] = ['morning', 'afternoon', 'night'];
  const isToday = selectedDate === getTodayString();

  const handleClear = () => {
    if (window.confirm('Clear all entries for this day? This cannot be undone.')) {
      clearLog();
    }
  };

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(getTodayString());
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🐕 Dog Care Tracker</h1>
        <div className="date-picker-container">
          <button
            className="date-nav-btn"
            onClick={() => {
              const prevDate = new Date(selectedDate);
              prevDate.setDate(prevDate.getDate() - 1);
              handleDateChange(prevDate.toISOString().split('T')[0]);
            }}
            aria-label="Previous day"
          >
            ←
          </button>
          <input
            type="date"
            className="date-picker"
            value={selectedDate}
            onChange={(e) => {
              const newDate = e.target.value;
              if (newDate) {
                handleDateChange(newDate);
              }
            }}
            onBlur={(e) => {
              // Fallback for browsers that don't fire onChange properly
              const newDate = e.target.value;
              if (newDate && newDate !== selectedDate) {
                handleDateChange(newDate);
              }
            }}
            aria-label="Select date"
          />
          <button
            className="date-nav-btn"
            onClick={() => {
              const nextDate = new Date(selectedDate);
              nextDate.setDate(nextDate.getDate() + 1);
              handleDateChange(nextDate.toISOString().split('T')[0]);
            }}
            aria-label="Next day"
          >
            →
          </button>
        </div>
        <p className="date-display">{formatDate(selectedDate)}</p>
        {!isToday && (
          <button className="today-btn" onClick={goToToday}>
            Jump to Today
          </button>
        )}
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
        <DaySummary dayLog={dayLog} onChange={updateDayLog} />
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
