/**
 * Klondike-Specific Settings Section
 * To be included in the main Settings Modal
 */

import React from 'react';
import type { DrawMode } from '../state/gameState';

interface KlondikeSettingsSectionProps {
  drawMode: DrawMode;
  onDrawModeChange: (mode: DrawMode) => void;
  isMobile?: boolean;
  fontSize?: string;
}

export const KlondikeSettingsSection: React.FC<KlondikeSettingsSectionProps> = ({
  drawMode,
  onDrawModeChange,
  isMobile = false,
  fontSize = '16px',
}) => {
  const sectionStyle: React.CSSProperties = {
    marginBottom: '24px',
  };

  const headingStyle: React.CSSProperties = {
    fontSize: isMobile ? '18px' : '20px',
    fontWeight: 'bold',
    marginBottom: '12px',
    color: '#333',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
    fontSize,
  };

  const radioGroupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  };

  const radioOptionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    padding: '12px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    cursor: 'pointer',
    border: '2px solid transparent',
    transition: 'all 0.15s ease',
  };

  const radioOptionSelectedStyle: React.CSSProperties = {
    ...radioOptionStyle,
    backgroundColor: '#e3f2fd',
    border: '2px solid #2196f3',
  };

  const radioLabelStyle: React.CSSProperties = {
    marginLeft: '8px',
    flex: 1,
  };

  const radioTitleStyle: React.CSSProperties = {
    fontWeight: 'bold',
    fontSize,
    marginBottom: '4px',
  };

  const radioDescriptionStyle: React.CSSProperties = {
    fontSize: isMobile ? '12px' : '14px',
    color: '#666',
  };

  const drawModes: { value: DrawMode; label: string; description: string }[] = [
    {
      value: 'draw1',
      label: 'Draw-1 (Easier)',
      description: 'Draw one card at a time from the stock pile. Best for beginners.',
    },
    {
      value: 'draw3',
      label: 'Draw-3 (Traditional)',
      description:
        'Draw three cards at a time. Classic Klondike solitaire rules. More challenging.',
    },
  ];

  return (
    <div style={sectionStyle}>
      <h3 style={headingStyle}>⚙️ Klondike Settings</h3>

      {/* Draw Mode */}
      <div>
        <label style={labelStyle}>
          Draw Mode
          <span style={{ color: '#2196f3', marginLeft: '4px' }}>★</span>
        </label>
        <div style={radioGroupStyle}>
          {drawModes.map((mode) => {
            const isSelected = drawMode === mode.value;
            return (
              <div
                key={mode.value}
                style={isSelected ? radioOptionSelectedStyle : radioOptionStyle}
                onClick={() => onDrawModeChange(mode.value)}
              >
                <input
                  type="radio"
                  name="drawMode"
                  value={mode.value}
                  checked={isSelected}
                  onChange={() => onDrawModeChange(mode.value)}
                  style={{ marginTop: '2px', cursor: 'pointer' }}
                />
                <div style={radioLabelStyle}>
                  <div style={radioTitleStyle}>{mode.label}</div>
                  <div style={radioDescriptionStyle}>{mode.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info text */}
      <div
        style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#fff3e0',
          borderRadius: '8px',
          fontSize: isMobile ? '12px' : '14px',
          color: '#e65100',
        }}
      >
        <strong>Note:</strong> Changing the draw mode will apply to your next game. Current game
        will continue with the mode it started with.
      </div>
    </div>
  );
};
