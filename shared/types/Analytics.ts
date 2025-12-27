/**
 * Analytics event types and structures
 * Foundation for future Plausible/analytics integration
 *
 * Design: No-op implementation initially, easy to plug in real analytics later
 */

/**
 * Core analytics event types
 */
export type GameEventType =
  // Game lifecycle
  | 'game_start'
  | 'game_won'
  | 'game_lost'
  | 'game_reset'

  // User actions
  | 'card_moved'
  | 'undo_used'
  | 'redo_used'
  | 'hint_used'
  | 'auto_complete_used'

  // Settings
  | 'settings_opened'
  | 'setting_changed'

  // Win celebration
  | 'celebration_shown'
  | 'celebration_skipped';

/**
 * Base event structure
 */
export interface GameEvent {
  /** Event type */
  type: GameEventType;

  /** Game being played (freecell, klondike, etc.) */
  game: 'freecell' | 'klondike' | 'spider';

  /** Timestamp of event */
  timestamp: number;

  /** Additional event-specific properties */
  properties?: Record<string, string | number | boolean>;
}

/**
 * Game start event
 */
export interface GameStartEvent extends GameEvent {
  type: 'game_start';
  properties: {
    /** Game seed for reproducibility */
    seed: number;

    /** Game mode (e.g., draw-1, draw-3 for Klondike) */
    mode?: string;
  };
}

/**
 * Game won event
 */
export interface GameWonEvent extends GameEvent {
  type: 'game_won';
  properties: {
    /** Number of moves to win */
    moves: number;

    /** Time to complete in seconds */
    timeSeconds?: number;

    /** Game seed */
    seed: number;
  };
}

/**
 * Card moved event
 */
export interface CardMovedEvent extends GameEvent {
  type: 'card_moved';
  properties: {
    /** Source location type */
    from: string;

    /** Destination location type */
    to: string;

    /** Whether it was a smart tap move */
    smartTap?: boolean;
  };
}

/**
 * Setting changed event
 */
export interface SettingChangedEvent extends GameEvent {
  type: 'setting_changed';
  properties: {
    /** Setting key that changed */
    setting: string;

    /** New value (string representation) */
    value: string;
  };
}

/**
 * Union type of all specific event types
 */
export type AnalyticsEvent =
  | GameStartEvent
  | GameWonEvent
  | CardMovedEvent
  | SettingChangedEvent
  | GameEvent;

/**
 * Analytics provider interface
 * Can be implemented by Plausible, Google Analytics, custom analytics, etc.
 */
export interface AnalyticsProvider {
  /**
   * Track an event
   */
  trackEvent(event: AnalyticsEvent): void;

  /**
   * Track a page view
   */
  trackPageView?(page: string): void;

  /**
   * Enable/disable tracking
   */
  setEnabled?(enabled: boolean): void;
}

/**
 * No-op analytics provider for development/default
 */
export class NoOpAnalyticsProvider implements AnalyticsProvider {
  trackEvent(_event: AnalyticsEvent): void {
    // No-op: Do nothing
    // In development, you might want to console.log for debugging
    if (process.env.NODE_ENV === 'development') {
      console.debug('[Analytics]', _event);
    }
  }

  trackPageView(_page: string): void {
    // No-op
  }

  setEnabled(_enabled: boolean): void {
    // No-op
  }
}
