/**
 * Invalid Move Tooltip Component
 * Shows a floating tooltip when an invalid move is attempted
 * Auto-dismisses after 2 seconds
 */

import React from 'react';

export interface InvalidMoveTooltipProps {
  reason: string;
  position: { x: number; y: number };
}

export function InvalidMoveTooltip({ reason, position }: InvalidMoveTooltipProps) {
  const style: React.CSSProperties = {
    position: 'fixed',
    left: `${position.x}px`,
    top: `${position.y}px`,
    transform: 'translate(-50%, -100%)',
    backgroundColor: 'rgba(220, 38, 38, 0.95)',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    pointerEvents: 'none',
    zIndex: 10000,
    whiteSpace: 'nowrap',
    animation: 'fadeInOut 2s ease-in-out forwards',
  };

  return (
    <div style={style} role="alert">
      {reason}
    </div>
  );
}

// Inject fade animation CSS once
let fadeAnimationInjected = false;
export function injectFadeAnimation() {
  if (fadeAnimationInjected) return;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInOut {
      0% { opacity: 0; transform: translate(-50%, -100%) translateY(-10px); }
      10% { opacity: 1; transform: translate(-50%, -100%) translateY(0); }
      90% { opacity: 1; transform: translate(-50%, -100%) translateY(0); }
      100% { opacity: 0; transform: translate(-50%, -100%) translateY(-10px); }
    }
  `;
  document.head.appendChild(style);
  fadeAnimationInjected = true;
}
