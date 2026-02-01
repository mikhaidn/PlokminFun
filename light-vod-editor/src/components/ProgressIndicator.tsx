import React from 'react';
import type { ProcessingProgress } from '../utils/ffmpeg-wasm';

interface ProgressIndicatorProps {
  progress: ProcessingProgress;
  onCancel?: () => void;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  onCancel,
}) => {
  const getStatusColor = () => {
    switch (progress.phase) {
      case 'loading':
        return '#3b82f6'; // blue
      case 'processing':
        return '#10b981'; // green
      case 'complete':
        return '#22c55e'; // bright green
      case 'error':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  const getStatusIcon = () => {
    switch (progress.phase) {
      case 'loading':
        return '⏳';
      case 'processing':
        return '⚙️';
      case 'complete':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '⏸️';
    }
  };

  return (
    <div
      style={{
        padding: '20px',
        border: `2px solid ${getStatusColor()}`,
        borderRadius: '8px',
        backgroundColor: '#1a1a1a',
        marginTop: '10px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>{getStatusIcon()}</span>
          <span style={{ color: '#e5e7eb', fontWeight: 'bold' }}>
            {progress.message}
          </span>
        </div>
        {progress.phase === 'processing' && onCancel && (
          <button
            onClick={onCancel}
            style={{
              padding: '6px 12px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Cancel
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: '100%',
          height: '24px',
          backgroundColor: '#374151',
          borderRadius: '12px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: `${progress.progress}%`,
            height: '100%',
            backgroundColor: getStatusColor(),
            transition: 'width 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            {Math.round(progress.progress)}%
          </span>
        </div>
      </div>

      {progress.eta && (
        <div
          style={{
            marginTop: '8px',
            color: '#9ca3af',
            fontSize: '14px',
            textAlign: 'center',
          }}
        >
          Estimated time remaining: {Math.round(progress.eta)}s
        </div>
      )}
    </div>
  );
};
