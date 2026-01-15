import { useState } from 'react';
import { useInstructions } from './hooks/useInstructions';
import { OwnerView } from './components/OwnerView';
import { CaretakerView } from './components/CaretakerView';
import './App.css';

type ViewMode = 'owner' | 'caretaker';

function App() {
  const { instructions } = useInstructions();
  const [viewMode, setViewMode] = useState<ViewMode>('caretaker');

  return (
    <div className="app">
      <header className="app-header">
        <h1>🐾 Pet Care Instructions</h1>
        <div className="mode-switcher">
          <button
            className={viewMode === 'owner' ? 'active' : ''}
            onClick={() => setViewMode('owner')}
          >
            👤 Owner
          </button>
          <button
            className={viewMode === 'caretaker' ? 'active' : ''}
            onClick={() => setViewMode('caretaker')}
            disabled={!instructions}
          >
            🤝 Caretaker
          </button>
        </div>
      </header>

      <main className="app-main">
        {viewMode === 'owner' ? (
          <OwnerView />
        ) : instructions ? (
          <CaretakerView />
        ) : (
          <div className="empty-state">
            <p>No instructions set up yet.</p>
            <button onClick={() => setViewMode('owner')}>
              Create Instructions
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
