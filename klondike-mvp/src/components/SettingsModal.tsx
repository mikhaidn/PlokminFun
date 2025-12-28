/**
 * Settings Modal Component
 * RFC-005 Phase 1 Day 2: Unified settings UI
 *
 * Sections:
 * 1. Klondike Settings (Draw Mode - game-specific)
 * 2. Game Mode (existing accessibility settings)
 * 3. Animations & Effects (new)
 * 4. Interaction Style (new)
 */

import React, { useState } from 'react';
import { useSettings, type GameSettings } from '@cardgames/shared';
import { KlondikeSettingsSection } from './KlondikeSettingsSection';
import {
  loadKlondikeSettings,
  saveKlondikeSettings,
  type KlondikeSettings,
} from '../utils/klondikeSettings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState<GameSettings>(settings);
  const [klondikeSettings, setKlondikeSettings] =
    useState<KlondikeSettings>(loadKlondikeSettings());

  if (!isOpen) return null;

  const handleSave = () => {
    updateSettings(localSettings);
    saveKlondikeSettings(klondikeSettings);
    onClose();
  };

  const handleCancel = () => {
    setLocalSettings(settings); // Reset to original
    setKlondikeSettings(loadKlondikeSettings()); // Reset Klondike settings
    onClose();
  };

  const handleReset = () => {
    resetSettings();
    setLocalSettings(settings);
  };

  const isMobile = window.innerWidth < 600;
  const padding = isMobile ? '16px' : '24px';
  const fontSize = isMobile ? '14px' : '16px';

  // Game mode options
  const gameModes: { value: GameSettings['gameMode']; label: string; description: string }[] = [
    {
      value: 'standard',
      label: 'Standard',
      description: 'Default game settings',
    },
    {
      value: 'easy-to-see',
      label: 'Easy to See',
      description: 'High contrast, larger cards, bigger text',
    },
    {
      value: 'one-handed-left',
      label: 'One-Handed - Left Hand',
      description: 'Controls at bottom, larger cards and text',
    },
    {
      value: 'one-handed-right',
      label: 'One-Handed - Right Hand',
      description: 'Controls at bottom, larger cards and text',
    },
  ];

  // Animation level options
  const animationLevels: {
    value: GameSettings['animationLevel'];
    label: string;
    description: string;
  }[] = [
    {
      value: 'full',
      label: 'Full',
      description: 'All animations and effects',
    },
    {
      value: 'reduced',
      label: 'Reduced',
      description: 'Smooth transitions only',
    },
    {
      value: 'none',
      label: 'None',
      description: 'Instant (no motion)',
    },
  ];

  // Drag physics options
  const dragPhysicsOptions: {
    value: GameSettings['dragPhysics'];
    label: string;
    description: string;
  }[] = [
    {
      value: 'spring',
      label: 'Bouncy',
      description: 'Natural spring physics',
    },
    {
      value: 'smooth',
      label: 'Smooth',
      description: 'Linear motion',
    },
    {
      value: 'instant',
      label: 'Instant',
      description: 'No drag animation',
    },
  ];

  const sectionStyle: React.CSSProperties = {
    marginBottom: '24px',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: isMobile ? '1.2em' : '1.3em',
    fontWeight: 'bold',
    marginBottom: '12px',
    color: '#1e40af',
  };

  const radioGroupStyle: React.CSSProperties = {
    marginBottom: '12px',
  };

  const toggleStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    marginBottom: '12px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    backgroundColor: 'white',
  };

  const checkboxStyle: React.CSSProperties = {
    width: '20px',
    height: '20px',
    marginRight: '12px',
    cursor: 'pointer',
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
      onClick={handleCancel}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding,
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0, fontSize: isMobile ? '1.5em' : '1.8em', marginBottom: '8px' }}>
          Game Settings
        </h2>

        {/* Section 1: Klondike-Specific Settings (PROMINENT) */}
        <KlondikeSettingsSection
          drawMode={klondikeSettings.drawMode}
          onDrawModeChange={(mode) => setKlondikeSettings({ ...klondikeSettings, drawMode: mode })}
          isMobile={isMobile}
          fontSize={fontSize}
        />

        {/* Section 2: Game Mode */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Game Mode</h3>
          <div style={{ marginBottom: '12px' }}>
            {gameModes.map((mode) => (
              <label
                key={mode.value}
                style={{
                  display: 'block',
                  padding: '12px',
                  marginBottom: '8px',
                  border:
                    localSettings.gameMode === mode.value ? '3px solid #4caf50' : '2px solid #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: localSettings.gameMode === mode.value ? '#f1f8f4' : 'white',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <input
                    type="radio"
                    name="gameMode"
                    value={mode.value}
                    checked={localSettings.gameMode === mode.value}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        gameMode: e.target.value as GameSettings['gameMode'],
                      })
                    }
                    style={{
                      width: '20px',
                      height: '20px',
                      marginRight: '12px',
                      marginTop: '2px',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize, fontWeight: 'bold', marginBottom: '4px' }}>
                      {mode.label}
                    </div>
                    <div style={{ fontSize: '0.9em', color: '#666' }}>{mode.description}</div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Section 2: Animations & Effects */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Animations & Effects</h3>

          {/* Animation Level */}
          <div style={radioGroupStyle}>
            <label style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
              Animation Level
            </label>
            {animationLevels.map((level) => (
              <label
                key={level.value}
                style={{
                  display: 'block',
                  padding: '10px',
                  marginBottom: '6px',
                  border:
                    localSettings.animationLevel === level.value
                      ? '2px solid #4caf50'
                      : '1px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor:
                    localSettings.animationLevel === level.value ? '#f1f8f4' : 'white',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="radio"
                    name="animationLevel"
                    value={level.value}
                    checked={localSettings.animationLevel === level.value}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        animationLevel: e.target.value as GameSettings['animationLevel'],
                      })
                    }
                    style={{
                      width: '18px',
                      height: '18px',
                      marginRight: '10px',
                      cursor: 'pointer',
                    }}
                  />
                  <div>
                    <div style={{ fontSize: '0.95em', fontWeight: 'bold' }}>{level.label}</div>
                    <div style={{ fontSize: '0.85em', color: '#666' }}>{level.description}</div>
                  </div>
                </div>
              </label>
            ))}
          </div>

          {/* Win Celebration Toggle */}
          <label style={toggleStyle}>
            <input
              type="checkbox"
              checked={localSettings.winCelebration}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  winCelebration: e.target.checked,
                })
              }
              disabled={localSettings.animationLevel === 'none'}
              style={checkboxStyle}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>Win Celebration</div>
              <div style={{ fontSize: '0.85em', color: '#666' }}>
                Show confetti and card cascade when you win
              </div>
            </div>
          </label>

          {/* Sound Effects Toggle (disabled for now) */}
          <label style={{ ...toggleStyle, opacity: 0.5, cursor: 'not-allowed' }}>
            <input
              type="checkbox"
              checked={localSettings.soundEffects}
              disabled={true}
              style={{ ...checkboxStyle, cursor: 'not-allowed' }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>Sound Effects</div>
              <div style={{ fontSize: '0.85em', color: '#666' }}>
                Play sounds for card moves and wins (coming soon)
              </div>
            </div>
          </label>
        </div>

        {/* Section 3: Interaction Style */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Interaction Style</h3>

          {/* Smart Tap-to-Move Toggle */}
          <label style={toggleStyle}>
            <input
              type="checkbox"
              checked={localSettings.smartTapToMove}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  smartTapToMove: e.target.checked,
                })
              }
              style={checkboxStyle}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>Smart Tap-to-Move</div>
              <div style={{ fontSize: '0.85em', color: '#666' }}>
                Auto-execute moves when only one option available (recommended for mobile)
              </div>
            </div>
          </label>

          {/* Drag Physics */}
          <div style={radioGroupStyle}>
            <label style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
              Drag Feel
            </label>
            {dragPhysicsOptions.map((physics) => (
              <label
                key={physics.value}
                style={{
                  display: 'block',
                  padding: '10px',
                  marginBottom: '6px',
                  border:
                    localSettings.dragPhysics === physics.value
                      ? '2px solid #4caf50'
                      : '1px solid #ddd',
                  borderRadius: '6px',
                  cursor: localSettings.animationLevel === 'none' ? 'not-allowed' : 'pointer',
                  backgroundColor:
                    localSettings.dragPhysics === physics.value ? '#f1f8f4' : 'white',
                  opacity: localSettings.animationLevel === 'none' ? 0.5 : 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="radio"
                    name="dragPhysics"
                    value={physics.value}
                    checked={localSettings.dragPhysics === physics.value}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        dragPhysics: e.target.value as GameSettings['dragPhysics'],
                      })
                    }
                    disabled={localSettings.animationLevel === 'none'}
                    style={{
                      width: '18px',
                      height: '18px',
                      marginRight: '10px',
                      cursor: localSettings.animationLevel === 'none' ? 'not-allowed' : 'pointer',
                    }}
                  />
                  <div>
                    <div style={{ fontSize: '0.95em', fontWeight: 'bold' }}>{physics.label}</div>
                    <div style={{ fontSize: '0.85em', color: '#666' }}>{physics.description}</div>
                  </div>
                </div>
              </label>
            ))}
          </div>

          {/* Auto-Complete Toggle */}
          <label style={toggleStyle}>
            <input
              type="checkbox"
              checked={localSettings.autoComplete}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  autoComplete: e.target.checked,
                })
              }
              style={checkboxStyle}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>Auto-complete</div>
              <div style={{ fontSize: '0.85em', color: '#666' }}>
                Automatically move obvious cards to foundations
              </div>
            </div>
          </label>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'space-between',
            borderTop: '1px solid #eee',
            paddingTop: '16px',
          }}
        >
          <button
            onClick={handleReset}
            style={{
              padding: isMobile ? '10px 16px' : '12px 20px',
              fontSize,
              cursor: 'pointer',
              backgroundColor: '#f5f5f5',
              border: '1px solid #ccc',
              borderRadius: '4px',
              color: '#666',
            }}
          >
            Reset to Defaults
          </button>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleCancel}
              style={{
                padding: isMobile ? '10px 20px' : '12px 24px',
                fontSize,
                cursor: 'pointer',
                backgroundColor: '#f5f5f5',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: isMobile ? '10px 20px' : '12px 24px',
                fontSize,
                cursor: 'pointer',
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 'bold',
              }}
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
