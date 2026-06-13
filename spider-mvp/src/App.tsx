import { useState } from 'react';
import { SettingsProvider } from '@plokmin/shared';
import { GameBoard } from './components/GameBoard';
import { createInitialState } from './state/gameState';
import { loadSpiderSettings } from './utils/spiderSettings';

function App() {
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1000000));
  const [gameKey, setGameKey] = useState(0);

  const handleNewGame = () => {
    setSeed(Math.floor(Math.random() * 1000000));
    // Clear persisted history so a stale won state doesn't carry over.
    localStorage.removeItem('spider-game-history');
    setGameKey((prev) => prev + 1);
  };

  // Load Spider settings (suit count / difficulty)
  const spiderSettings = loadSpiderSettings();

  return (
    <SettingsProvider>
      <div style={{ width: '100%', height: '100vh' }}>
        <GameBoard
          key={gameKey}
          initialState={createInitialState(seed, spiderSettings.suitCount)}
          onNewGame={handleNewGame}
        />
      </div>
    </SettingsProvider>
  );
}

export default App;
