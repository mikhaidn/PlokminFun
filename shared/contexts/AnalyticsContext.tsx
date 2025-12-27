/**
 * Analytics context and provider
 * Provides analytics tracking throughout the app
 */

import React, { createContext, useMemo } from 'react';
import type { AnalyticsProvider } from '../types/Analytics';
import { NoOpAnalyticsProvider } from '../types/Analytics';

interface AnalyticsContextValue {
  provider: AnalyticsProvider;
  game: 'freecell' | 'klondike' | 'spider';
}

export const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

interface AnalyticsProviderProps {
  children: React.ReactNode;

  /** Analytics provider implementation (defaults to NoOp) */
  provider?: AnalyticsProvider;

  /** Game name for event tracking */
  game: 'freecell' | 'klondike' | 'spider';
}

/**
 * Analytics provider component
 *
 * Wraps the app to provide analytics tracking
 *
 * @example
 * ```tsx
 * <AnalyticsProvider game="freecell">
 *   <App />
 * </AnalyticsProvider>
 * ```
 *
 * @example With custom provider (future Plausible integration)
 * ```tsx
 * const plausibleProvider = new PlausibleAnalyticsProvider();
 *
 * <AnalyticsProvider game="klondike" provider={plausibleProvider}>
 *   <App />
 * </AnalyticsProvider>
 * ```
 */
export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({
  children,
  provider = new NoOpAnalyticsProvider(),
  game,
}) => {
  const value = useMemo(
    () => ({
      provider,
      game,
    }),
    [provider, game]
  );

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};
