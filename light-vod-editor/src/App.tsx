import { useEffect } from 'react';
import './App.css';

function App() {
  useEffect(() => {
    // Redirect to the working video editor
    window.location.href = './trimmer-multi.html';
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>Light Vod Editor</h1>
        <p className="subtitle">Redirecting to video editor...</p>
      </header>

      <main className="main">
        <div className="card">
          <p>If you are not redirected automatically, click below:</p>
          <a href="./trimmer-multi.html" className="redirect-link">
            Open Video Editor
          </a>
        </div>
      </main>

      <footer className="footer">
        <a href="/PlokminFun/">← Back to Plokmin Consortium</a>
      </footer>
    </div>
  );
}

export default App;
