/**
 * Analytics hook for tracking game events
 *
 * Usage:
 * ```tsx
 * const analytics = useAnalytics();
 * analytics.trackGameStart({ seed: 12345, mode: 'draw-3' });
 * analytics.trackGameWon({ moves: 87, timeSeconds: 342, seed: 12345 });
 * ```
 */

import { useCallback, useContext } from 'react';
import type {
  AnalyticsEvent,
  GameEventType,
  GameStartEvent,
  GameWonEvent,
  CardMovedEvent,
  SettingChangedEvent,
} from '../types/Analytics';
import { AnalyticsContext } from '../contexts/AnalyticsContext';

/**
 * Hook for tracking analytics events
 */
export function useAnalytics() {
  const context = useContext(AnalyticsContext);

  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }

  const { provider, game } = context;

  /**
   * Track a game start event
   */
  const trackGameStart = useCallback(
    (properties: GameStartEvent['properties']) => {
      const event: GameStartEvent = {
        type: 'game_start',
        game,
        timestamp: Date.now(),
        properties,
      };
      provider.trackEvent(event);
    },
    [provider, game]
  );

  /**
   * Track a game won event
   */
  const trackGameWon = useCallback(
    (properties: GameWonEvent['properties']) => {
      const event: GameWonEvent = {
        type: 'game_won',
        game,
        timestamp: Date.now(),
        properties,
      };
      provider.trackEvent(event);
    },
    [provider, game]
  );

  /**
   * Track a card moved event
   */
  const trackCardMoved = useCallback(
    (properties: CardMovedEvent['properties']) => {
      const event: CardMovedEvent = {
        type: 'card_moved',
        game,
        timestamp: Date.now(),
        properties,
      };
      provider.trackEvent(event);
    },
    [provider, game]
  );

  /**
   * Track a setting changed event
   */
  const trackSettingChanged = useCallback(
    (properties: SettingChangedEvent['properties']) => {
      const event: SettingChangedEvent = {
        type: 'setting_changed',
        game,
        timestamp: Date.now(),
        properties,
      };
      provider.trackEvent(event);
    },
    [provider, game]
  );

  /**
   * Track a generic event
   */
  const trackEvent = useCallback(
    (type: GameEventType, properties?: Record<string, string | number | boolean>) => {
      const event: AnalyticsEvent = {
        type,
        game,
        timestamp: Date.now(),
        properties,
      };
      provider.trackEvent(event);
    },
    [provider, game]
  );

  return {
    trackGameStart,
    trackGameWon,
    trackCardMoved,
    trackSettingChanged,
    trackEvent,
  };
}
