/**
 * Analytics Event Structure
 *
 * Foundation for future analytics integration (Plausible, Simple Analytics, etc.)
 * Currently a no-op implementation - ready to plug in real tracking later.
 *
 * Usage:
 * ```typescript
 * import { trackEvent } from '@cardgames/shared';
 *
 * trackEvent('game_start', { game: 'klondike', mode: 'draw-3' });
 * trackEvent('game_won', { game: 'freecell', moves: 87, time: 245 });
 * ```
 */

/**
 * Standard game events we track
 */
export type GameEventType =
  | 'game_start'      // New game started
  | 'game_won'        // Game completed successfully
  | 'game_lost'       // Game abandoned/given up
  | 'card_moved'      // Card moved (throttled to avoid spam)
  | 'hint_used'       // Hint requested
  | 'undo_used'       // Undo performed
  | 'redo_used'       // Redo performed
  | 'auto_complete'   // Auto-complete triggered
  | 'settings_opened' // Settings modal opened
  | 'new_game_click'; // New game button clicked

/**
 * Properties that can be attached to events
 */
export interface GameEventProperties {
  // Game context
  game?: 'freecell' | 'klondike' | 'spider';
  mode?: string;  // e.g., 'draw-1', 'draw-3', '1-suit', '4-suit'
  seed?: number;

  // Game outcome
  moves?: number;
  time?: number;  // seconds
  won?: boolean;

  // User context (derived, never PII)
  device?: 'mobile' | 'tablet' | 'desktop';
  platform?: 'ios' | 'android' | 'windows' | 'macos' | 'linux';

  // Settings
  setting_key?: string;
  setting_value?: string | number | boolean;

  // Custom properties
  [key: string]: string | number | boolean | undefined;
}

/**
 * Track a game event
 *
 * Currently a no-op. When ready to enable analytics:
 * 1. Install Plausible or Simple Analytics
 * 2. Uncomment the implementation below
 * 3. Add your domain to the config
 *
 * @param event - Event type to track
 * @param properties - Additional event properties
 *
 * @example
 * trackEvent('game_start', { game: 'klondike', mode: 'draw-3' });
 * trackEvent('game_won', { game: 'freecell', moves: 87, time: 245 });
 */
export function trackEvent(
  event: GameEventType,
  properties?: GameEventProperties
): void {
  // No-op implementation for now
  // When ready, uncomment one of these:

  // Plausible:
  // if (window.plausible) {
  //   window.plausible(event, { props: properties });
  // }

  // Simple Analytics:
  // if (window.sa_event) {
  //   window.sa_event(event, properties);
  // }

  // Console logging for development (remove in production)
  if (import.meta.env.DEV) {
    console.log('[Analytics]', event, properties);
  }
}

/**
 * Track page view
 *
 * Useful for SPA navigation between games
 */
export function trackPageView(path?: string): void {
  // No-op for now
  if (import.meta.env.DEV) {
    console.log('[Analytics] Page view:', path || window.location.pathname);
  }
}

/**
 * Helper to get device type from viewport
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Helper to get platform (best guess from user agent)
 */
export function getPlatform(): string {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('iphone') || ua.includes('ipad')) return 'ios';
  if (ua.includes('android')) return 'android';
  if (ua.includes('mac')) return 'macos';
  if (ua.includes('win')) return 'windows';
  if (ua.includes('linux')) return 'linux';
  return 'unknown';
}

/**
 * Create enriched event properties with device/platform context
 */
export function enrichEventProperties(
  properties?: GameEventProperties
): GameEventProperties {
  return {
    ...properties,
    device: getDeviceType(),
    platform: getPlatform(),
  };
}
