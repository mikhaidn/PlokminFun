import { useState } from 'react';
import { SettingsProvider } from '@cardgames/shared';
import { GameBoard } from './components/GameBoard';
import { AnimationExperiments } from './components/AnimationExperiments';
import { createInitialState } from './state/gameState';
import { loadKlondikeSettings } from './utils/klondikeSettings';

function App() {
  const [seed] = useState(() => Math.floor(Math.random() * 1000000));
  const [gameKey, setGameKey] = useState(0);

  const handleNewGame = () => {
    setGameKey((prev) => prev + 1);
  };

  // RFC-005 Phase 1: Animation experiments mode
  // Access via: ?experiments=true
  const showExperiments = new URLSearchParams(window.location.search).get('experiments') === 'true';

  if (showExperiments) {
    return <AnimationExperiments />;
  }

  // Load Klondike settings (draw mode)
  const klondikeSettings = loadKlondikeSettings();

  return (
    <SettingsProvider>
      <div style={{ width: '100%', height: '100vh' }}>
        <GameBoard
          key={gameKey}
          initialState={createInitialState(seed, klondikeSettings.drawMode)}
          onNewGame={handleNewGame}
        />
      </div>
    </SettingsProvider>
  );
}

export default App;
