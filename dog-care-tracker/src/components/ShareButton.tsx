import { useState } from 'react';
import { DayLog } from '../types';
import { generateShareUrl, generateShareText } from '../utils/sharing';

interface ShareButtonProps {
  dayLog: DayLog;
}

export function ShareButton({ dayLog }: ShareButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState<'url' | 'text' | null>(null);

  const shareUrl = generateShareUrl(dayLog);
  const shareText = generateShareText(dayLog);

  const copyToClipboard = async (text: string, type: 'url' | 'text') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy to clipboard');
    }
  };

  if (!showModal) {
    return (
      <button className="btn btn-primary" onClick={() => setShowModal(true)}>
        📤 Share
      </button>
    );
  }

  return (
    <>
      <div className="modal-backdrop" onClick={() => setShowModal(false)} />
      <div className="modal">
        <div className="modal-header">
          <h2>Share Today's Log</h2>
          <button className="close-btn" onClick={() => setShowModal(false)}>
            ×
          </button>
        </div>

        <div className="modal-content">
          <div className="share-section">
            <h3>Share URL</h3>
            <p className="help-text">
              Copy and send this link. Recipient can view or import the log.
            </p>
            <div className="share-box">
              <code className="share-code">{shareUrl}</code>
              <button
                className="btn btn-secondary"
                onClick={() => copyToClipboard(shareUrl, 'url')}
              >
                {copied === 'url' ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
          </div>

          <div className="share-section">
            <h3>Share Text</h3>
            <p className="help-text">
              Copy this formatted summary (includes URL for importing).
            </p>
            <div className="share-box">
              <pre className="share-text">{shareText}</pre>
              <button
                className="btn btn-secondary"
                onClick={() =>
                  copyToClipboard(`${shareText}\n\n🔗 ${shareUrl}`, 'text')
                }
              >
                {copied === 'text' ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
