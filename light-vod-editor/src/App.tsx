import { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <header className="header">
        <h1>Light Vod Editor</h1>
        <p className="subtitle">Part of the Plokmin Consortium</p>
      </header>

      <main className="main">
        <div className="card">
          <h2>Welcome! 👋</h2>
          <p>This is your new experience scaffold.</p>
          <button onClick={() => setCount(count + 1)}>
            Count: {count}
          </button>
          <p className="hint">
            Edit <code>src/App.tsx</code> to customize this page.
          </p>
        </div>
      </main>

      <footer className="footer">
        <a href="/CardGames/">← Back to Plokmin Consortium</a>
      </footer>
    </div>
  );
}

export default App;
