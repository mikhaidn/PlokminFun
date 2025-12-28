/**
 * Help/Rules Modal Component
 * Displays game rules, valid moves, and keyboard shortcuts
 * Used by FreeCell, Klondike, and future games
 */

import React, { useEffect } from 'react';

export interface HelpContent {
  gameName: string;
  objective: string;
  rules: string[];
  validMoves: string[];
  tips?: string[];
  keyboardShortcuts: { key: string; action: string }[];
}

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: HelpContent;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, content }) => {
  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isMobile = window.innerWidth < 600;
  const padding = isMobile ? '16px' : '24px';
  const fontSize = isMobile ? '14px' : '16px';

  const sectionStyle: React.CSSProperties = {
    marginBottom: '24px',
  };

  const headingStyle: React.CSSProperties = {
    fontSize: isMobile ? '1.2em' : '1.4em',
    fontWeight: 'bold',
    marginBottom: '12px',
    color: '#1e40af',
  };

  const listStyle: React.CSSProperties = {
    margin: '8px 0',
    paddingLeft: '20px',
    lineHeight: '1.6',
  };

  const shortcutStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 12px',
    marginBottom: '6px',
    backgroundColor: '#f5f5f5',
    borderRadius: '6px',
    fontSize: '0.95em',
  };

  const keyStyle: React.CSSProperties = {
    fontFamily: 'monospace',
    backgroundColor: '#e0e0e0',
    padding: '2px 8px',
    borderRadius: '4px',
    fontWeight: 'bold',
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding,
          maxWidth: '700px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <h2
            id="help-modal-title"
            style={{
              margin: 0,
              fontSize: isMobile ? '1.5em' : '1.8em',
            }}
          >
            📖 How to Play {content.gameName}
          </h2>
          <button
            onClick={onClose}
            style={{
              fontSize: '24px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: '4px 8px',
              color: '#666',
            }}
            aria-label="Close help modal"
            title="Close (ESC)"
          >
            ✕
          </button>
        </div>

        {/* Objective */}
        <div style={sectionStyle}>
          <h3 style={headingStyle}>🎯 Objective</h3>
          <p style={{ fontSize, lineHeight: '1.6', margin: 0 }}>{content.objective}</p>
        </div>

        {/* Game Rules */}
        <div style={sectionStyle}>
          <h3 style={headingStyle}>📋 Rules</h3>
          <ul style={listStyle}>
            {content.rules.map((rule, index) => (
              <li key={index} style={{ marginBottom: '8px', fontSize }}>
                {rule}
              </li>
            ))}
          </ul>
        </div>

        {/* Valid Moves */}
        <div style={sectionStyle}>
          <h3 style={headingStyle}>✅ Valid Moves</h3>
          <ul style={listStyle}>
            {content.validMoves.map((move, index) => (
              <li key={index} style={{ marginBottom: '8px', fontSize }}>
                {move}
              </li>
            ))}
          </ul>
        </div>

        {/* Tips (optional) */}
        {content.tips && content.tips.length > 0 && (
          <div style={sectionStyle}>
            <h3 style={headingStyle}>💡 Tips</h3>
            <ul style={listStyle}>
              {content.tips.map((tip, index) => (
                <li key={index} style={{ marginBottom: '8px', fontSize }}>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Keyboard Shortcuts */}
        <div style={sectionStyle}>
          <h3 style={headingStyle}>⌨️ Keyboard Shortcuts</h3>
          <div>
            {content.keyboardShortcuts.map((shortcut, index) => (
              <div key={index} style={shortcutStyle}>
                <span style={{ fontSize }}>{shortcut.action}</span>
                <span style={keyStyle}>{shortcut.key}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button
            onClick={onClose}
            style={{
              padding: isMobile ? '10px 24px' : '12px 32px',
              fontSize,
              cursor: 'pointer',
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
            }}
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};
