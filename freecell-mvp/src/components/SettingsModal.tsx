import React, { useState } from 'react';
import {
  type AccessibilitySettings,
  type GameMode,
} from '../config/accessibilitySettings';

interface SettingsModalProps {
  isOpen: boolean;
  settings: AccessibilitySettings;
  onClose: () => void;
  onSave: (settings: AccessibilitySettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onClose,
  onSave,
}) => {
  const [localSettings, setLocalSettings] = useState<AccessibilitySettings>(settings);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleCancel = () => {
    setLocalSettings(settings); // Reset to original
    onClose();
  };

  const isMobile = window.innerWidth < 600;
  const padding = isMobile ? '16px' : '24px';
  const fontSize = isMobile ? '14px' : '16px';

  const modes: { value: GameMode; label: string; description: string }[] = [
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
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0, fontSize: isMobile ? '1.5em' : '1.8em', marginBottom: '8px' }}>
          How would you like to play?
        </h2>

        <div style={{ marginBottom: '24px' }}>
          {modes.map((mode) => (
            <label
              key={mode.value}
              style={{
                display: 'block',
                padding: '16px',
                marginBottom: '12px',
                border: localSettings.gameMode === mode.value ? '3px solid #4caf50' : '2px solid #ddd',
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
                      gameMode: e.target.value as GameMode,
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
                  <div style={{ fontSize: '0.9em', color: '#666' }}>
                    {mode.description}
                  </div>
                </div>
              </div>
            </label>
          ))}
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            borderTop: '1px solid #eee',
            paddingTop: '16px',
          }}
        >
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
  );
};
