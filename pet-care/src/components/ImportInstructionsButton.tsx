import { useState, useEffect } from 'react';
import { InstructionSet } from '../types';
import { instructionsFromURL } from '../utils/sharing';

interface ImportInstructionsButtonProps {
  onImport: (instructions: InstructionSet) => void;
}

export function ImportInstructionsButton({ onImport }: ImportInstructionsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasUrlParams, setHasUrlParams] = useState(false);

  useEffect(() => {
    // Check if there are URL parameters
    const params = new URLSearchParams(window.location.search);
    if (params.has('pet') && params.has('tasks')) {
      setHasUrlParams(true);
    }
  }, []);

  const handleImportFromURL = () => {
    try {
      const url = new URL(urlInput.trim());
      const params = url.searchParams;
      const instructions = instructionsFromURL(params);

      if (!instructions) {
        setError('Invalid URL format');
        return;
      }

      onImport(instructions);
      setIsOpen(false);
      setUrlInput('');
      setError(null);
    } catch (err) {
      setError('Invalid URL');
    }
  };

  const handleImportFromCurrentURL = () => {
    const params = new URLSearchParams(window.location.search);
    const instructions = instructionsFromURL(params);

    if (!instructions) {
      setError('No valid instructions in URL');
      return;
    }

    onImport(instructions);
    // Clear URL parameters
    window.history.replaceState({}, '', window.location.pathname);
    setHasUrlParams(false);
    setIsOpen(false);
  };

  if (!isOpen && !hasUrlParams) {
    return (
      <button onClick={() => setIsOpen(true)} className="import-button">
        📥 Import Instructions
      </button>
    );
  }

  if (!isOpen && hasUrlParams) {
    return (
      <div className="import-banner">
        <p>📥 Shared instructions detected in URL</p>
        <button onClick={handleImportFromCurrentURL}>Import Now</button>
        <button onClick={() => setHasUrlParams(false)} className="secondary">
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={() => setIsOpen(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📥 Import Instructions</h3>
          <button className="close-button" onClick={() => setIsOpen(false)}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="import-section">
            <h4>From URL</h4>
            <p className="hint">Paste a shared instructions URL</p>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                setError(null);
              }}
              placeholder="https://..."
              className="import-input"
            />
            {error && <div className="error-message">{error}</div>}
            <button onClick={handleImportFromURL} disabled={!urlInput.trim()}>
              Import
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
