/**
 * Settings Context Provider
 * RFC-005 Phase 1 Day 2: React context for app-wide settings
 *
 * Provides:
 * - Current settings state
 * - updateSettings function for partial updates
 * - resetSettings function for reset to defaults
 * - Automatic persistence to localStorage
 * - Reactive updates when prefers-reduced-motion changes
 */

import React, { createContext, useState, useEffect } from 'react';
import { loadSettings, saveSettings, migrateOldSettings, resetSettings as resetToDefaults } from '../utils/settingsStorage';
import { applyAccessibilityOverrides, type GameSettings } from '../types/GameSettings';

interface SettingsContextValue {
  settings: GameSettings;
  updateSettings: (partial: Partial<GameSettings>) => void;
  resetSettings: () => void;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);

interface SettingsProviderProps {
  children: React.ReactNode;
}

/**
 * Settings provider component
 * Wrap your app with this to enable settings context
 *
 * Example:
 * ```tsx
 * <SettingsProvider>
 *   <App />
 * </SettingsProvider>
 * ```
 */
export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<GameSettings>(() => {
    // Migrate old settings on first load
    migrateOldSettings();
    return loadSettings();
  });

  /**
   * Update settings with partial values
   * Automatically saves to localStorage
   */
  const updateSettings = (partial: Partial<GameSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    saveSettings(updated);
  };

  /**
   * Reset settings to defaults
   * Automatically saves to localStorage
   */
  const resetSettings = () => {
    const defaults = resetToDefaults();
    setSettings(defaults);
  };

  // Listen for prefers-reduced-motion changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = () => {
      // Reapply accessibility overrides when preference changes
      setSettings((prev) => applyAccessibilityOverrides(prev));
    };

    // Modern browsers support addEventListener on MediaQueryList
    // Fallback to deprecated addListener for older browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      // Legacy support
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener?.(handleChange);
    }
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

/**
 * Hook to use settings context
 * Must be used within a SettingsProvider
 *
 * Example:
 * ```tsx
 * const { settings, updateSettings } = useSettings();
 * ```
 */
export function useSettings(): SettingsContextValue {
  const context = React.useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
