import { useState } from 'react';
import { InstructionSet } from '../types';
import { instructionsToText, instructionsToURL, copyToClipboard } from '../utils/sharing';

interface ShareInstructionsButtonProps {
  instructions: InstructionSet;
}

export function ShareInstructionsButton({ instructions }: ShareInstructionsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const handleCopyText = async () => {
    const text = instructionsToText(instructions);
    const success = await copyToClipboard(text);
    setCopySuccess(success ? 'Copied text!' : 'Failed to copy');
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const handleCopyURL = async () => {
    const url = instructionsToURL(instructions);
    const success = await copyToClipboard(url);
    setCopySuccess(success ? 'Copied URL!' : 'Failed to copy');
    setTimeout(() => setCopySuccess(null), 2000);
  };

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="share-button">
        📤 Share Instructions
      </button>
    );
  }

  return (
    <div className="modal-overlay" onClick={() => setIsOpen(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📤 Share Instructions</h3>
          <button className="close-button" onClick={() => setIsOpen(false)}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="share-section">
            <h4>Text Format</h4>
            <p className="hint">Copy and paste into messages, email, or notes</p>
            <textarea
              readOnly
              value={instructionsToText(instructions)}
              rows={12}
              className="share-preview"
            />
            <button onClick={handleCopyText}>Copy Text</button>
          </div>

          <div className="share-section">
            <h4>Shareable URL</h4>
            <p className="hint">Share this link to let others import your instructions</p>
            <input readOnly value={instructionsToURL(instructions)} className="share-url" />
            <button onClick={handleCopyURL}>Copy URL</button>
          </div>

          {copySuccess && <div className="copy-success">{copySuccess}</div>}
        </div>
      </div>
    </div>
  );
}
