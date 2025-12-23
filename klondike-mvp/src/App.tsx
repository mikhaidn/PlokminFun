import { useState } from 'react';
import { GameBoard } from './components/GameBoard';
import { createInitialState } from './state/gameState';

function App() {
  const [seed] = useState(() => Math.floor(Math.random() * 1000000));
  const [gameKey, setGameKey] = useState(0);

  const handleNewGame = () => {
    setGameKey((prev) => prev + 1);
  };

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <GameBoard
        key={gameKey}
        initialState={createInitialState(seed)}
        onNewGame={handleNewGame}
      />
    </div>
  );
}

export default App;
