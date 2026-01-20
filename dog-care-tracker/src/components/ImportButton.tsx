import { useState } from 'react';
import { DayLog } from '../types';
import { parseShareText, getSharedLogFromUrl } from '../utils/sharing';

interface ImportButtonProps {
  onImport: (log: DayLog) => void;
}

export function ImportButton({ onImport }: ImportButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Check if URL has shared data on mount
  useState(() => {
    const sharedLog = getSharedLogFromUrl();
    if (sharedLog) {
      // Auto-show import modal if viewing shared link
      setShowModal(true);
      setImportText(window.location.href);
    }
  });

  const handleImport = () => {
    setError(null);

    // Try parsing as URL first
    const parsed = parseShareText(importText);
    if (parsed) {
      onImport(parsed);
      setShowModal(false);
      setImportText('');
      // Clear URL params after import
      window.history.replaceState({}, '', window.location.pathname);
    } else {
      setError('Could not parse the shared data. Please paste a valid share URL or text.');
    }
  };

  if (!showModal) {
    return (
      <button className="btn btn-secondary" onClick={() => setShowModal(true)}>
        📥 Import
      </button>
    );
  }

  return (
    <>
      <div className="modal-backdrop" onClick={() => setShowModal(false)} />
      <div className="modal">
        <div className="modal-header">
          <h2>Import Shared Log</h2>
          <button className="close-btn" onClick={() => setShowModal(false)}>
            ×
          </button>
        </div>

        <div className="modal-content">
          <p className="help-text">Paste a shared URL or text to import today's log data.</p>

          <textarea
            className="import-textarea"
            placeholder="Paste shared URL or text here..."
            value={importText}
            onChange={(e) => {
              setImportText(e.target.value);
              setError(null);
            }}
            rows={6}
          />

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleImport}
              disabled={!importText.trim()}
            >
              Import
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
