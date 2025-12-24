# Settings Enhancement Plan

**Purpose:** Add user-configurable toggles for RFC-005 animation and interaction features
**Priority:** Critical - Must be built BEFORE rolling out features to users
**Timeline:** 2-3 hours (integrate with Day 2 of RFC-005 Phase 1)

---

## Why This Matters

**User Choice > Forced Features**

Not everyone wants animations or smart tap-to-move:
- Some users prefer traditional click-to-select
- Animations can be distracting or cause motion sickness
- Mobile users may want different interactions than desktop users
- Accessibility: `prefers-reduced-motion` users need minimal animations

**Design Principle:** Every new feature should have a toggle. Nothing forced.

---

## Settings to Add

### 1. Animation Settings

```typescript
export interface AnimationSettings {
  /** Animation level for cards and UI */
  animationLevel: 'full' | 'reduced' | 'none';

  /** Win celebration (confetti + card cascade) */
  winCelebration: boolean;

  /** Sound effects (when implemented) */
  soundEffects: boolean;
}

export const DEFAULT_ANIMATION_SETTINGS: AnimationSettings = {
  animationLevel: 'full', // Default to full for new users
  winCelebration: true,
  soundEffects: false, // Default off until we add sounds
};
```

**Animation Level Behavior:**
- `full`: Spring physics drag, flip animations, confetti, all effects
- `reduced`: Smooth transitions only, no spring physics, no confetti
- `none`: Instant moves, no animations (respects `prefers-reduced-motion`)

### 2. Interaction Settings

```typescript
export interface InteractionSettings {
  /** Smart tap-to-move: auto-execute if only one valid destination */
  smartTapToMove: boolean;

  /** Drag physics style */
  dragPhysics: 'spring' | 'smooth' | 'instant';

  /** Auto-complete moves when possible */
  autoComplete: boolean; // Already exists, just moving to new structure
}

export const DEFAULT_INTERACTION_SETTINGS: InteractionSettings = {
  smartTapToMove: false, // Default OFF - let users discover and enable
  dragPhysics: 'spring',
  autoComplete: true, // Keep existing behavior
};
```

**Smart Tap-to-Move Behavior:**
- `false` (default): Click card → highlights valid destinations → click destination
- `true`: Click card → if 1 valid move, auto-execute; if multiple, highlight

---

## Implementation Approach

### Step 1: Extend Settings Interface (10 min)

**File:** `shared/types/GameSettings.ts` (new file)

```typescript
/**
 * Unified game settings (replaces per-game accessibility settings)
 * Works with RFC-005 GameConfig system
 */

export interface GameSettings {
  // Existing accessibility settings (migrate from accessibilitySettings.ts)
  gameMode: 'standard' | 'easy-to-see' | 'one-handed-left' | 'one-handed-right';

  // New animation settings
  animationLevel: 'full' | 'reduced' | 'none';
  winCelebration: boolean;
  soundEffects: boolean;

  // New interaction settings
  smartTapToMove: boolean;
  dragPhysics: 'spring' | 'smooth' | 'instant';
  autoComplete: boolean;
}

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  gameMode: 'standard',
  animationLevel: 'full',
  winCelebration: true,
  soundEffects: false,
  smartTapToMove: false, // Default OFF
  dragPhysics: 'spring',
  autoComplete: true,
};

// Detect prefers-reduced-motion and override animation settings
export function applyAccessibilityOverrides(settings: GameSettings): GameSettings {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    return {
      ...settings,
      animationLevel: 'none',
      winCelebration: false,
    };
  }

  return settings;
}
```

### Step 2: Update Settings Storage (10 min)

**File:** `shared/utils/settingsStorage.ts` (new file)

```typescript
const STORAGE_KEY = 'cardgames-settings-v2'; // v2 to distinguish from old format

export function loadSettings(): GameSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const merged = { ...DEFAULT_GAME_SETTINGS, ...parsed };
      return applyAccessibilityOverrides(merged);
    }
  } catch (error) {
    console.warn('Failed to load settings:', error);
  }

  return applyAccessibilityOverrides(DEFAULT_GAME_SETTINGS);
}

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

// Migrate old accessibility settings to new format
export function migrateOldSettings(): void {
  const oldKey = 'freecell-accessibility-settings';
  const old = localStorage.getItem(oldKey);

  if (old && !localStorage.getItem(STORAGE_KEY)) {
    try {
      const parsed = JSON.parse(old);
      const migrated: GameSettings = {
        ...DEFAULT_GAME_SETTINGS,
        gameMode: parsed.gameMode || 'standard',
      };
      saveSettings(migrated);
      console.log('Migrated old settings to new format');
    } catch (error) {
      console.warn('Failed to migrate old settings:', error);
    }
  }
}
```

### Step 3: Update Settings Modal UI (30-60 min)

**File:** `shared/components/SettingsModal.tsx` (extend existing)

Add new sections to the existing settings modal:

```tsx
<SettingsSection title="Animations & Effects">
  <SettingSelect
    label="Animation Level"
    value={settings.animationLevel}
    options={[
      { value: 'full', label: 'Full - All animations and effects' },
      { value: 'reduced', label: 'Reduced - Smooth transitions only' },
      { value: 'none', label: 'None - Instant (no motion)' },
    ]}
    onChange={(value) => updateSettings({ animationLevel: value })}
    description="Controls card movements, flips, and visual effects"
  />

  <SettingToggle
    label="Win Celebration"
    checked={settings.winCelebration}
    onChange={(checked) => updateSettings({ winCelebration: checked })}
    description="Show confetti and card cascade when you win"
    disabled={settings.animationLevel === 'none'}
  />

  <SettingToggle
    label="Sound Effects"
    checked={settings.soundEffects}
    onChange={(checked) => updateSettings({ soundEffects: checked })}
    description="Play sounds for card moves and wins (coming soon)"
    disabled={true} // Until we implement sounds
  />
</SettingsSection>

<SettingsSection title="Interaction Style">
  <SettingToggle
    label="Smart Tap-to-Move"
    checked={settings.smartTapToMove}
    onChange={(checked) => updateSettings({ smartTapToMove: checked })}
    description="Auto-execute moves when only one option available (recommended for mobile)"
  />

  <SettingSelect
    label="Drag Feel"
    value={settings.dragPhysics}
    options={[
      { value: 'spring', label: 'Bouncy - Natural spring physics' },
      { value: 'smooth', label: 'Smooth - Linear motion' },
      { value: 'instant', label: 'Instant - No drag animation' },
    ]}
    onChange={(value) => updateSettings({ dragPhysics: value })}
    description="How cards feel when dragging"
    disabled={settings.animationLevel === 'none'}
  />

  <SettingToggle
    label="Auto-complete"
    checked={settings.autoComplete}
    onChange={(checked) => updateSettings({ autoComplete: checked })}
    description="Automatically move obvious cards to foundations"
  />
</SettingsSection>
```

### Step 4: Use Settings in Game Logic (30 min)

**File:** `klondike-mvp/src/hooks/useGameAnimations.ts` (new)

```typescript
import { useContext } from 'react';
import { SettingsContext } from '@cardgames/shared';

export function useGameAnimations() {
  const { settings } = useContext(SettingsContext);

  // Determine animation config based on user settings
  const shouldAnimate = settings.animationLevel !== 'none';
  const useSpringPhysics = settings.animationLevel === 'full' && settings.dragPhysics === 'spring';
  const showWinCelebration = settings.winCelebration && settings.animationLevel !== 'none';

  return {
    shouldAnimate,
    useSpringPhysics,
    showWinCelebration,
    dragPhysics: settings.dragPhysics,
    animationDuration: settings.animationLevel === 'reduced' ? 200 : 400,
  };
}
```

**File:** `klondike-mvp/src/hooks/useSmartTap.ts` (new)

```typescript
import { useContext } from 'react';
import { SettingsContext } from '@cardgames/shared';
import type { GameLocation } from '@cardgames/shared';

export function useSmartTap(getValidMoves: (from: GameLocation) => GameLocation[]) {
  const { settings } = useContext(SettingsContext);

  const handleTap = (location: GameLocation) => {
    if (!settings.smartTapToMove) {
      // Traditional mode: just select the card
      return { action: 'select', location };
    }

    // Smart tap mode: check valid moves
    const validMoves = getValidMoves(location);

    if (validMoves.length === 0) {
      // No valid moves - provide feedback
      return { action: 'invalid', location };
    } else if (validMoves.length === 1) {
      // Only one valid move - auto-execute
      return { action: 'auto-move', from: location, to: validMoves[0] };
    } else {
      // Multiple moves - highlight options
      return { action: 'highlight', location, options: validMoves };
    }
  };

  return { handleTap, smartTapEnabled: settings.smartTapToMove };
}
```

### Step 5: Create Settings Context Provider (20 min)

**File:** `shared/contexts/SettingsContext.tsx` (new)

```typescript
import React, { createContext, useState, useEffect } from 'react';
import { loadSettings, saveSettings, migrateOldSettings } from '../utils/settingsStorage';
import type { GameSettings } from '../types/GameSettings';

interface SettingsContextValue {
  settings: GameSettings;
  updateSettings: (partial: Partial<GameSettings>) => void;
  resetSettings: () => void;
}

export const SettingsContext = createContext<SettingsContextValue>(null!);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<GameSettings>(() => {
    migrateOldSettings();
    return loadSettings();
  });

  const updateSettings = (partial: Partial<GameSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    saveSettings(updated);
  };

  const resetSettings = () => {
    const defaults = loadSettings(); // Gets defaults with accessibility overrides
    setSettings(defaults);
    saveSettings(defaults);
  };

  // Listen for prefers-reduced-motion changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = () => {
      setSettings((prev) => applyAccessibilityOverrides(prev));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}
```

---

## Integration Checklist

### Day 2 of RFC-005 Phase 1

- [ ] Create `shared/types/GameSettings.ts` with unified settings interface
- [ ] Create `shared/utils/settingsStorage.ts` with load/save/migrate functions
- [ ] Create `shared/contexts/SettingsContext.tsx` provider
- [ ] Update settings modal UI with new animation/interaction sections
- [ ] Create `useGameAnimations()` hook for reading animation settings
- [ ] Create `useSmartTap()` hook for smart tap-to-move feature
- [ ] Wrap app in `<SettingsProvider>` in both games
- [ ] Export all new types/components from `shared/index.ts`
- [ ] Test: Settings persist across page reloads
- [ ] Test: `prefers-reduced-motion` overrides animation settings
- [ ] Test: Smart tap works correctly in both modes

### Day 3: Documentation

- [ ] Document settings system in `docs/architecture/ui-requirements.md`
- [ ] Add settings guide to `AI_GUIDE.md`
- [ ] Update `CLAUDE.md` with settings context usage

---

## Migration Notes

### Backwards Compatibility

Existing users with old `freecell-accessibility-settings`:
- Automatically migrated on first load
- Game mode preserved
- New settings get sensible defaults

### Default Behavior Changes

None! All new features default to OFF or existing behavior:
- Smart tap-to-move: OFF (traditional select mode)
- Animations: ON (full) - same as current prototype
- Win celebration: ON - new feature, opt-out available
- Sound effects: OFF - not implemented yet

---

## Testing Strategy

### Manual Testing

1. **Settings Persistence:**
   - Change settings → reload page → verify settings retained

2. **Smart Tap Modes:**
   - Traditional mode: Click card → highlights destinations → click destination
   - Smart mode: Click card with 1 move → auto-executes
   - Smart mode: Click card with multiple moves → highlights options

3. **Animation Levels:**
   - Full: Spring physics, flips, confetti
   - Reduced: Smooth transitions only, no confetti
   - None: Instant moves, no animations

4. **Accessibility:**
   - Enable `prefers-reduced-motion` in browser → verify animations disabled
   - Disable → verify animations respect user setting

### Automated Testing

```typescript
describe('Settings System', () => {
  it('persists settings to localStorage', () => {
    const settings = { ...DEFAULT_GAME_SETTINGS, smartTapToMove: true };
    saveSettings(settings);
    const loaded = loadSettings();
    expect(loaded.smartTapToMove).toBe(true);
  });

  it('respects prefers-reduced-motion', () => {
    // Mock matchMedia
    window.matchMedia = () => ({ matches: true });
    const settings = loadSettings();
    expect(settings.animationLevel).toBe('none');
  });

  it('migrates old settings format', () => {
    localStorage.setItem('freecell-accessibility-settings', JSON.stringify({ gameMode: 'easy-to-see' }));
    migrateOldSettings();
    const settings = loadSettings();
    expect(settings.gameMode).toBe('easy-to-see');
  });
});
```

---

## RFC-005 Compatibility

This settings system is designed to integrate seamlessly with RFC-005:

### GameConfig Integration

```typescript
// Future: klondike.config.ts
export const KlondikeConfig: GameConfig<KlondikeGameState> = {
  // ...
  features: {
    smartTap: true, // Game supports smart tap (check settings.smartTapToMove at runtime)
    animations: true, // Game supports animations (check settings.animationLevel)
    winCelebration: true, // Game supports win celebration
  },
  // ...
};
```

### Settings as First-Class Feature

When we build the unified system, settings will be part of the core GameConfig:
- Each game declares what settings it supports
- Unified settings modal shows/hides options based on game
- Settings context is shared across all games
- One settings modal for entire app (not per-game)

---

## Summary

**Time Investment:** 2-3 hours
**User Benefit:** Complete control over animations and interactions
**Developer Benefit:** Clean, reusable settings system for all future features
**RFC-005 Readiness:** Designed for unified game builder integration

**Key Principle:** User choice over forced features. Every animation and interaction should be configurable.
