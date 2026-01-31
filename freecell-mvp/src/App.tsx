import { SettingsProvider } from '@plokmin/shared';
import { GameBoard } from './components/GameBoard';

function App() {
  return (
    <SettingsProvider>
      <GameBoard />
    </SettingsProvider>
  );
}

export default App;
