import React, { useState } from 'react';
import {
  type AccessibilitySettings,
  type CardSize,
  type ButtonPosition,
  type TouchTargetSize,
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
        <h2 style={{ marginTop: 0, fontSize: isMobile ? '1.5em' : '1.8em' }}>
          Accessibility Settings
        </h2>

        {/* High Contrast Mode */}
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              fontSize,
            }}
          >
            <input
              type="checkbox"
              checked={localSettings.highContrastMode}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  highContrastMode: e.target.checked,
                })
              }
              style={{
                width: '20px',
                height: '20px',
                marginRight: '12px',
                cursor: 'pointer',
              }}
            />
            <div>
              <strong>High Contrast Mode</strong>
              <div style={{ fontSize: '0.9em', color: '#666', marginTop: '4px' }}>
                Bolder colors and thicker borders for better visibility
              </div>
            </div>
          </label>
        </div>

        {/* Card Size */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize, fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
            Card Size
          </label>
          <select
            value={localSettings.cardSize}
            onChange={(e) =>
              setLocalSettings({
                ...localSettings,
                cardSize: e.target.value as CardSize,
              })
            }
            style={{
              width: '100%',
              padding: '10px',
              fontSize,
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          >
            <option value="small">Small (Default)</option>
            <option value="medium">Medium (25% larger)</option>
            <option value="large">Large (50% larger)</option>
            <option value="extra-large">Extra Large (80% larger)</option>
          </select>
          <div style={{ fontSize: '0.85em', color: '#666', marginTop: '6px' }}>
            Larger cards are easier to see and tap
          </div>
        </div>

        {/* Font Size Multiplier */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize, fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
            Font Size: {localSettings.fontSizeMultiplier.toFixed(1)}x
          </label>
          <input
            type="range"
            min="1.0"
            max="2.0"
            step="0.1"
            value={localSettings.fontSizeMultiplier}
            onChange={(e) =>
              setLocalSettings({
                ...localSettings,
                fontSizeMultiplier: parseFloat(e.target.value),
              })
            }
            style={{ width: '100%' }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.85em',
              color: '#666',
              marginTop: '4px',
            }}
          >
            <span>Normal</span>
            <span>Double</span>
          </div>
        </div>

        {/* Button Position */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize, fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
            Button Position
          </label>
          <select
            value={localSettings.buttonPosition}
            onChange={(e) =>
              setLocalSettings({
                ...localSettings,
                buttonPosition: e.target.value as ButtonPosition,
              })
            }
            style={{
              width: '100%',
              padding: '10px',
              fontSize,
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          >
            <option value="top">Top (Default)</option>
            <option value="bottom">Bottom (One-handed mode)</option>
          </select>
          <div style={{ fontSize: '0.85em', color: '#666', marginTop: '6px' }}>
            Bottom position is easier to reach with one hand
          </div>
        </div>

        {/* Touch Target Size */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize, fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
            Button Size
          </label>
          <select
            value={localSettings.touchTargetSize}
            onChange={(e) =>
              setLocalSettings({
                ...localSettings,
                touchTargetSize: e.target.value as TouchTargetSize,
              })
            }
            style={{
              width: '100%',
              padding: '10px',
              fontSize,
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          >
            <option value="normal">Normal</option>
            <option value="large">Large (Easier to tap)</option>
          </select>
          <div style={{ fontSize: '0.85em', color: '#666', marginTop: '6px' }}>
            Larger buttons are easier to tap accurately
          </div>
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
