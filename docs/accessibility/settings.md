# Accessibility Settings

The CardGames project includes comprehensive accessibility settings to improve visibility, readability, and one-handed usability. Settings are stored in localStorage and persist across sessions.

## Table of Contents

- [Overview](#overview)
- [Available Settings](#available-settings)
- [Implementation Details](#implementation-details)
- [High Contrast Mode](#high-contrast-mode)
- [Card Size Control](#card-size-control)
- [Font Size Multiplier](#font-size-multiplier)
- [Button Position](#button-position)
- [Touch Target Size](#touch-target-size)
- [Settings Storage](#settings-storage)
- [User Interface](#user-interface)
- [Component Integration](#component-integration)
- [Best Practices](#best-practices)
- [Testing Settings](#testing-settings)

## Overview

Accessibility settings provide users with control over visual presentation and interaction methods. The system is designed to accommodate:

- Users with vision impairments
- Players using mobile devices in varying lighting conditions
- One-handed mobile gameplay
- Touch screen accuracy challenges

**Key Files:**
- `src/config/accessibilitySettings.ts` - Settings types, defaults, storage
- `src/utils/highContrastStyles.ts` - High contrast color calculations
- `src/components/SettingsModal.tsx` - Settings UI
- `src/utils/responsiveLayout.ts` - Layout calculations with accessibility overrides

## Available Settings

### 1. High Contrast Mode

**Type:** `boolean` (default: `false`)

**Purpose:** Enhances visual distinction between cards and improves readability in bright environments.

**Visual Changes:**
- **Bolder borders**: 4px vs 1-2px
- **Stronger colors**:
  - Black suits (♠ ♣): Pure black `#000000`
  - Red suits (♥ ♦): Bright red `#ff0000`
- **Enhanced selection indicators**: Thicker, more visible borders
- **Higher contrast shadows**: Stronger drop shadows for depth
- **Solid backgrounds**: Removes gradients for maximum contrast

**Best For:**
- Users with low vision or color blindness
- Playing in bright sunlight (outdoor use)
- Reducing eye strain during extended play
- Distinguishing cards on older displays

### 2. Card Size

**Type:** `'small' | 'medium' | 'large' | 'extra-large'` (default: `'small'`)

**Purpose:** Controls maximum card dimensions, making cards easier to see and tap on mobile devices.

**Size Chart:**

| Setting | Max Width | Scale Factor | Best For |
|---------|-----------|--------------|----------|
| **Small** | 60px | 100% | Desktop, large tablets, default experience |
| **Medium** | 75px | 125% | Small tablets, users wanting larger cards |
| **Large** | 90px | 150% | Mobile phones, users with vision impairments |
| **Extra Large** | 110px | 183% | Maximum visibility, accessibility mode |

**Technical Details:**
- Sets maximum card width; responsive system may use smaller size if viewport requires
- Height calculated automatically (maintains 5:7 aspect ratio)
- All spacing (gaps, overlaps) scales proportionally
- Independent from font size control

**Example:**
```typescript
const maxWidth = getMaxCardWidth(settings.cardSize);
// 'small' → 60, 'medium' → 75, 'large' → 90, 'extra-large' → 110
```

### 3. Font Size Multiplier

**Type:** `number` (range: 1.0 - 2.0, default: 1.0)

**Purpose:** Scales all text elements independently from card size.

**Scaling:**
- **1.0x**: Normal size (default)
- **1.2x**: 20% larger
- **1.5x**: 50% larger
- **2.0x**: Double size (maximum)

**Affects:**
- Card suit symbols (♠ ♥ ♦ ♣)
- Card values (A, 2-10, J, Q, K)
- Corner text
- Button labels
- Help text
- Modal content

**Use Cases:**
- Vision impairments requiring larger text
- Users sitting far from screen
- Presentation/demo mode
- Reading difficulty accommodation

**Example:**
```typescript
const fontSize = {
  large: baseFontSize * fontSizeMultiplier,      // 24 * 1.5 = 36
  medium: baseFontSize * 0.7 * fontSizeMultiplier, // 17 * 1.5 = 25.5
  small: baseFontSize * 0.5 * fontSizeMultiplier   // 12 * 1.5 = 18
};
```

### 4. Button Position

**Type:** `'top' | 'bottom'` (default: `'top'`)

**Purpose:** Optimizes control placement for one-handed mobile use.

**Top Position (Default):**
- Buttons in header area
- Traditional desktop layout
- Full feature visibility
- Best for tablets and desktop

**Bottom Position:**
- Fixed position bar at bottom of screen
- Thumb-reachable zone on phones
- Persistent visibility while scrolling
- Best for one-handed mobile gameplay

**Layout:**
```
Top Position:                Bottom Position:
┌─────────────────┐         ┌─────────────────┐
│ [Controls]      │         │                 │
├─────────────────┤         │    Game Area    │
│                 │         │                 │
│   Game Area     │         │                 │
│                 │         ├─────────────────┤
│                 │         │   [Controls]    │
└─────────────────┘         └─────────────────┘
```

**Controls Included:**
- New Game
- Undo
- Redo
- Settings
- Help

### 5. Touch Target Size

**Type:** `'normal' | 'large'` (default: `'normal'`)

**Purpose:** Increases button size to meet WCAG AAA guidelines and reduce touch errors.

**Normal:**
- Standard button sizing
- Compact layout
- 36-40px height

**Large:**
- Minimum 44px height ([WCAG 2.5.5 Level AAA](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html))
- Increased padding
- Larger touch areas
- Better for motor control challenges

**WCAG Compliance:**
- **Level AA**: 24px minimum
- **Level AAA**: 44px minimum (recommended)
- Large setting meets Level AAA

## Implementation Details

### Settings Interface

```typescript
interface AccessibilitySettings {
  highContrastMode: boolean;
  cardSize: 'small' | 'medium' | 'large' | 'extra-large';
  fontSizeMultiplier: number; // 1.0 - 2.0
  buttonPosition: 'top' | 'bottom';
  touchTargetSize: 'normal' | 'large';
}
```

### Default Settings

```typescript
const DEFAULT_SETTINGS: AccessibilitySettings = {
  highContrastMode: false,
  cardSize: 'small',
  fontSizeMultiplier: 1.0,
  buttonPosition: 'top',
  touchTargetSize: 'normal'
};
```

### Loading Settings

```typescript
import { loadAccessibilitySettings } from '../config/accessibilitySettings';

// Load from localStorage (or defaults if not found)
const settings = loadAccessibilitySettings();
```

### Saving Settings

```typescript
import { saveAccessibilitySettings } from '../config/accessibilitySettings';

// Save to localStorage
saveAccessibilitySettings(settings);
```

### Storage Key

Settings are stored in localStorage under the key:
- FreeCell: `'freecell-accessibility-settings'`
- Klondike: `'klondike-accessibility-settings'`

Each game maintains independent settings.

## High Contrast Mode

### Color Calculations

**File:** `src/utils/highContrastStyles.ts`

```typescript
function getCardColors(
  card: Card,
  highContrastMode: boolean,
  isSelected: boolean,
  isHighlighted: boolean
) {
  const isRed = card.suit === '♥' || card.suit === '♦';

  if (highContrastMode) {
    return {
      text: isRed ? '#ff0000' : '#000000',  // Pure red/black
      background: '#ffffff',                 // Pure white
      border: isSelected ? '#0066cc' : '#000000',
      borderWidth: isSelected ? '4px' : '2px'
    };
  } else {
    return {
      text: isRed ? '#d32f2f' : '#333333',  // Softer red/gray
      background: '#f8f8f8',                 // Off-white
      border: isSelected ? '#0066cc' : '#cccccc',
      borderWidth: isSelected ? '3px' : '1px'
    };
  }
}
```

### Box Shadow Calculations

```typescript
function getCardBoxShadow(
  isSelected: boolean,
  isHighlighted: boolean,
  highContrastMode: boolean
): string {
  if (isSelected) {
    return highContrastMode
      ? '0 0 0 4px #0066cc, 0 4px 8px rgba(0,0,0,0.3)'
      : '0 0 0 3px #0066cc, 0 2px 4px rgba(0,0,0,0.2)';
  }

  if (isHighlighted) {
    return highContrastMode
      ? '0 0 0 3px #ffaa00, 0 4px 8px rgba(0,0,0,0.3)'
      : '0 0 0 2px #ffaa00, 0 2px 4px rgba(0,0,0,0.2)';
  }

  return highContrastMode
    ? '0 2px 4px rgba(0,0,0,0.3)'
    : '0 1px 3px rgba(0,0,0,0.15)';
}
```

### Integration Example

```typescript
const colors = getCardColors(card, highContrastMode, isSelected, isHighlighted);
const boxShadow = getCardBoxShadow(isSelected, isHighlighted, highContrastMode);

<div
  style={{
    color: colors.text,
    backgroundColor: colors.background,
    border: `${colors.borderWidth} solid ${colors.border}`,
    boxShadow: boxShadow
  }}
>
  {card.value}{card.suit}
</div>
```

## Card Size Control

### Maximum Card Width Function

```typescript
function getMaxCardWidth(cardSize: CardSize): number {
  switch (cardSize) {
    case 'small':
      return 60;
    case 'medium':
      return 75;
    case 'large':
      return 90;
    case 'extra-large':
      return 110;
    default:
      return 60;
  }
}
```

### Responsive Layout Integration

```typescript
import { calculateLayoutSizes, getMaxCardWidth } from '../utils/responsiveLayout';
import { loadAccessibilitySettings } from '../config/accessibilitySettings';

const settings = loadAccessibilitySettings();

const layoutSizes = calculateLayoutSizes(
  window.innerWidth,
  window.innerHeight,
  getMaxCardWidth(settings.cardSize),  // Override max card width
  settings.fontSizeMultiplier           // Override font scaling
);
```

## Font Size Multiplier

### Implementation

Font sizes scale independently from card dimensions:

```typescript
// Base font size calculated from card width
const baseFontSize = cardWidth * 0.4; // 40% of card width

// Apply multiplier to all font sizes
const fontSize = {
  large: baseFontSize * fontSizeMultiplier,
  medium: baseFontSize * 0.7 * fontSizeMultiplier,
  small: baseFontSize * 0.5 * fontSizeMultiplier
};
```

### Usage in Components

```typescript
<span style={{ fontSize: layoutSizes.fontSize.large }}>
  {card.suit}
</span>
<span style={{ fontSize: layoutSizes.fontSize.medium }}>
  {card.value}
</span>
```

## Button Position

### Top Position (Default)

```tsx
{buttonPosition === 'top' && (
  <header>
    <GameControls
      onNewGame={handleNewGame}
      onUndo={handleUndo}
      onRedo={handleRedo}
      canUndo={canUndo}
      canRedo={canRedo}
      onSettings={() => setShowSettings(true)}
      onHelp={() => setShowHelp(true)}
    />
  </header>
)}
```

### Bottom Position

```tsx
{buttonPosition === 'bottom' && (
  <div style={{
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTop: '1px solid #ddd',
    padding: '8px',
    zIndex: 1000
  }}>
    <GameControls {...props} />
  </div>
)}
```

## Touch Target Size

### Button Styling

```tsx
<button
  style={{
    minHeight: touchTargetSize === 'large' ? '44px' : '36px',
    minWidth: touchTargetSize === 'large' ? '44px' : '36px',
    padding: touchTargetSize === 'large' ? '12px 16px' : '8px 12px'
  }}
>
  {label}
</button>
```

### WCAG Compliance

Meeting [WCAG 2.5.5 (Target Size)](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html):

- **Level AAA**: The size of the target for pointer inputs is at least 44 by 44 CSS pixels
- **Exceptions**: Inline text links, essential targets, user agent controls
- **CardGames Implementation**: Large setting ensures all game controls meet AAA standard

## Settings Storage

### Storage Implementation

```typescript
const STORAGE_KEY = 'freecell-accessibility-settings';

export function saveAccessibilitySettings(settings: AccessibilitySettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save accessibility settings:', error);
  }
}

export function loadAccessibilitySettings(): AccessibilitySettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Failed to load accessibility settings:', error);
  }
  return DEFAULT_SETTINGS;
}
```

### Error Handling

- **QuotaExceededError**: Settings fail gracefully, use defaults
- **SecurityError**: localStorage blocked (private browsing), use in-memory defaults
- **JSON parse errors**: Corrupted data falls back to defaults

## User Interface

### Settings Button

Located in game controls:

```tsx
<button onClick={() => setShowSettings(true)} aria-label="Settings">
  ⚙️ Settings
</button>
```

### Settings Modal

**File:** `src/components/SettingsModal.tsx`

**Features:**
- Modal dialog overlay
- Live preview of changes
- Save and Cancel buttons
- Keyboard navigation support
- ESC to close

**Controls:**

1. **High Contrast Mode**
   ```tsx
   <label>
     <input
       type="checkbox"
       checked={highContrastMode}
       onChange={(e) => setHighContrastMode(e.target.checked)}
     />
     High Contrast Mode
   </label>
   ```

2. **Card Size**
   ```tsx
   <select value={cardSize} onChange={(e) => setCardSize(e.target.value)}>
     <option value="small">Small (60px)</option>
     <option value="medium">Medium (75px)</option>
     <option value="large">Large (90px)</option>
     <option value="extra-large">Extra Large (110px)</option>
   </select>
   ```

3. **Font Size**
   ```tsx
   <input
     type="range"
     min="1.0"
     max="2.0"
     step="0.1"
     value={fontSizeMultiplier}
     onChange={(e) => setFontSizeMultiplier(Number(e.target.value))}
   />
   <span>{fontSizeMultiplier.toFixed(1)}x</span>
   ```

4. **Button Position**
   ```tsx
   <select value={buttonPosition} onChange={(e) => setButtonPosition(e.target.value)}>
     <option value="top">Top</option>
     <option value="bottom">Bottom (One-handed mode)</option>
   </select>
   ```

5. **Touch Target Size**
   ```tsx
   <select value={touchTargetSize} onChange={(e) => setTouchTargetSize(e.target.value)}>
     <option value="normal">Normal</option>
     <option value="large">Large (WCAG AAA - 44px)</option>
   </select>
   ```

## Component Integration

### GameBoard Component

```typescript
import { useState, useEffect } from 'react';
import { loadAccessibilitySettings, saveAccessibilitySettings } from '../config/accessibilitySettings';
import { calculateLayoutSizes, getMaxCardWidth } from '../utils/responsiveLayout';

function GameBoard() {
  // Load settings on mount
  const [accessibilitySettings, setAccessibilitySettings] = useState(() =>
    loadAccessibilitySettings()
  );

  // Calculate layout with accessibility overrides
  const [layoutSizes, setLayoutSizes] = useState(() =>
    calculateLayoutSizes(
      window.innerWidth,
      window.innerHeight,
      getMaxCardWidth(accessibilitySettings.cardSize),
      accessibilitySettings.fontSizeMultiplier
    )
  );

  // Recalculate on settings change
  useEffect(() => {
    setLayoutSizes(
      calculateLayoutSizes(
        window.innerWidth,
        window.innerHeight,
        getMaxCardWidth(accessibilitySettings.cardSize),
        accessibilitySettings.fontSizeMultiplier
      )
    );
  }, [accessibilitySettings]);

  // Save settings when changed
  const handleSettingsChange = (newSettings: AccessibilitySettings) => {
    setAccessibilitySettings(newSettings);
    saveAccessibilitySettings(newSettings);
  };

  return (
    <div>
      <Card
        highContrastMode={accessibilitySettings.highContrastMode}
        cardWidth={layoutSizes.cardWidth}
        cardHeight={layoutSizes.cardHeight}
        fontSize={layoutSizes.fontSize}
      />
    </div>
  );
}
```

### Card Component Props

```typescript
interface CardProps {
  card: Card;
  cardWidth: number;
  cardHeight: number;
  fontSize: {
    large: number;
    medium: number;
    small: number;
  };
  highContrastMode: boolean;
  isSelected?: boolean;
  isHighlighted?: boolean;
  // ... other props
}
```

## Best Practices

### DO:

✅ **Always load settings on component mount**
```typescript
const [settings, setSettings] = useState(() => loadAccessibilitySettings());
```

✅ **Save settings immediately after changes**
```typescript
const handleChange = (newSettings) => {
  setSettings(newSettings);
  saveAccessibilitySettings(newSettings);
};
```

✅ **Provide visual feedback for all settings**
```typescript
// Show current multiplier value
<span>{fontSizeMultiplier.toFixed(1)}x</span>
```

✅ **Test with extreme values**
```typescript
// Test with 2.0x font multiplier and extra-large cards
```

✅ **Respect user preferences across sessions**
```typescript
// Settings persist in localStorage
```

### DON'T:

❌ **Don't override user settings without consent**
```typescript
// Bad - forces high contrast
const settings = { ...userSettings, highContrastMode: true };
```

❌ **Don't ignore accessibility settings**
```typescript
// Bad - hardcoded size ignores user preference
<Card width={60} height={84} />
```

❌ **Don't forget error handling for localStorage**
```typescript
// Bad - no try/catch
localStorage.setItem(key, value);
```

## Testing Settings

See [Accessibility Testing](./testing.md) for comprehensive testing procedures.

### Quick Manual Test

1. Open settings modal
2. Enable high contrast mode → Verify bolder colors
3. Set card size to "Extra Large" → Verify cards scale
4. Set font size to 2.0x → Verify text doubles
5. Set button position to "Bottom" → Verify controls move
6. Set touch target size to "Large" → Verify buttons grow
7. Save and reload page → Verify settings persist

---

**See Also:**
- [Responsive Design](./responsive-design.md) - How layout adapts to settings
- [Accessibility Testing](./testing.md) - Testing accessibility features
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - Web accessibility standards
