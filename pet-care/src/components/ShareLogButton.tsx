import { useState } from 'react';
import { DailyLog, InstructionSet } from '../types';
import { dailyLogToText, copyToClipboard } from '../utils/sharing';

interface ShareLogButtonProps {
  log: DailyLog;
  instructions: InstructionSet;
}

export function ShareLogButton({ log, instructions }: ShareLogButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const handleCopyText = async () => {
    const text = dailyLogToText(log, instructions);
    const success = await copyToClipboard(text);
    setCopySuccess(success ? 'Copied!' : 'Failed to copy');
    setTimeout(() => setCopySuccess(null), 2000);
  };

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="share-button">
        📤 Share Log
      </button>
    );
  }

  return (
    <div className="modal-overlay" onClick={() => setIsOpen(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📤 Share Care Log</h3>
          <button className="close-button" onClick={() => setIsOpen(false)}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="share-section">
            <h4>Text Summary</h4>
            <p className="hint">Copy and share this summary with the pet owner</p>
            <textarea
              readOnly
              value={dailyLogToText(log, instructions)}
              rows={15}
              className="share-preview"
            />
            <button onClick={handleCopyText}>Copy to Clipboard</button>
          </div>

          {copySuccess && <div className="copy-success">{copySuccess}</div>}
        </div>
      </div>
    </div>
  );
}
