# Responsive Design System

The CardGames project uses a **viewport-based dynamic sizing system** that automatically scales all UI elements to fit any screen size while maintaining readability and the proper card aspect ratio (5:7).

## Table of Contents

- [Overview](#overview)
- [Core Function: calculateLayoutSizes](#core-function-calculatelayoutsizes)
- [How It Works](#how-it-works)
- [Responsive Breakpoints](#responsive-breakpoints)
- [Layout Sizes Interface](#layout-sizes-interface)
- [Component Integration](#component-integration)
- [Window Resize Handling](#window-resize-handling)
- [Accessibility Integration](#accessibility-integration)
- [Best Practices](#best-practices)
- [Testing Responsive Behavior](#testing-responsive-behavior)
- [Performance Considerations](#performance-considerations)

## Overview

The responsive design system ensures that card games are playable on any device - from smartphones to large desktop monitors. Instead of using fixed pixel values, the system:

1. Calculates available viewport space
2. Determines optimal card dimensions based on constraints
3. Scales all related UI elements proportionally
4. Maintains the standard playing card aspect ratio (5:7)

**Key Location**: `src/utils/responsiveLayout.ts`

## Core Function: calculateLayoutSizes

```typescript
function calculateLayoutSizes(
  viewportWidth: number,
  viewportHeight: number,
  maxCardWidth?: number,
  fontSizeMultiplier?: number
): LayoutSizes
```

### Parameters

- **viewportWidth**: Current window width in pixels
- **viewportHeight**: Current window height in pixels
- **maxCardWidth** (optional): Maximum allowed card width (defaults to 60px)
  - Can be overridden by accessibility settings (small: 60px, medium: 75px, large: 90px, extra-large: 110px)
- **fontSizeMultiplier** (optional): Font scaling factor (1.0 - 2.0, defaults to 1.0)
  - Allows independent text scaling from card size
  - Improves readability for users with vision impairments

### Return Value

Returns a `LayoutSizes` object with all calculated dimensions and scaling factors.

## How It Works

### Step 1: Calculate Available Space

```typescript
// Subtract padding and UI elements
const availableWidth = viewportWidth - (PADDING * 2);
const availableHeight = viewportHeight - HEADER_HEIGHT - FOOTER_HEIGHT - (PADDING * 2);
```

**Constants:**
- `PADDING`: 24px on desktop, 12px on mobile
- `HEADER_HEIGHT`: Height of game controls (New Game, Undo, etc.)
- `FOOTER_HEIGHT`: Height of version/info footer

### Step 2: Determine Optimal Card Width

The system calculates card width based on two constraints and uses the smaller value:

**Horizontal Constraint** (fitting 8 tableau columns):
```typescript
const maxCardWidthFromWidth = (availableWidth - (7 * cardGap)) / 8;
```

**Vertical Constraint** (fitting stacked cards):
```typescript
// Consider maximum tableau stack height
const maxStackHeight = estimateMaxTableauHeight();
const maxCardWidthFromHeight =
  (availableHeight - maxStackHeight * cardOverlap) / CARD_ASPECT_RATIO;
```

**Final card width:**
```typescript
const cardWidth = Math.min(
  maxCardWidthFromWidth,
  maxCardWidthFromHeight,
  maxCardWidth  // Never exceed accessibility setting
);
```

### Step 3: Scale Related Dimensions

Once card width is determined, all other dimensions scale proportionally:

```typescript
const cardHeight = cardWidth * (7 / 5);  // Maintain 5:7 aspect ratio
const cardGap = cardWidth * 0.15;        // 15% of card width
const cardOverlap = cardWidth * 0.35;    // 35% of card width for tableau stacking
```

### Step 4: Calculate Font Sizes

Font sizes scale with card size but can be independently adjusted:

```typescript
const baseFontSize = cardWidth * 0.4;  // 40% of card width
const fontSize = {
  large: baseFontSize * fontSizeMultiplier,      // Suit symbols
  medium: baseFontSize * 0.7 * fontSizeMultiplier, // Card values
  small: baseFontSize * 0.5 * fontSizeMultiplier   // Corner text
};
```

## Responsive Breakpoints

The system adapts to three device categories:

### Mobile (< 600px)

- **Compact header**: Stacked layout for game controls
- **Smaller buttons**: Reduced padding and text size
- **Reduced padding**: 12px instead of 24px
- **Touch-optimized**: Larger touch targets when accessibility setting enabled
- **Portrait & landscape**: Both orientations supported

**Example viewport**: iPhone SE (375×667), iPhone 14 (390×844)

### Tablet (600-900px)

- **Medium sizing**: Balanced between mobile and desktop
- **Side-by-side header**: Game controls in horizontal layout
- **Standard padding**: 24px
- **Flexible orientation**: Works well in both portrait and landscape

**Example viewport**: iPad (768×1024), iPad Mini (744×1133)

### Desktop (> 900px)

- **Full-size layout**: Maximum card size (up to default 60×84px)
- **Spacious margins**: 24px padding
- **Optimal card visibility**: Larger cards when screen space allows
- **Keyboard-optimized**: Full keyboard shortcut support

**Example viewport**: 1920×1080, 2560×1440

## Layout Sizes Interface

```typescript
interface LayoutSizes {
  cardWidth: number;      // Calculated card width in pixels
  cardHeight: number;     // Calculated card height (maintains 5:7 ratio)
  cardGap: number;        // Gap between cards (15% of card width)
  cardOverlap: number;    // Vertical overlap in tableau (35% of card width)
  fontSize: {
    large: number;        // Suit symbol size (♠ ♥ ♦ ♣)
    medium: number;       // Card value size (A, 2-10, J, Q, K)
    small: number;        // Corner text size
  };
}
```

### Typical Values

**Mobile (375px width):**
```typescript
{
  cardWidth: 40,
  cardHeight: 56,
  cardGap: 6,
  cardOverlap: 14,
  fontSize: { large: 16, medium: 11, small: 8 }
}
```

**Tablet (768px width):**
```typescript
{
  cardWidth: 55,
  cardHeight: 77,
  cardGap: 8,
  cardOverlap: 19,
  fontSize: { large: 22, medium: 15, small: 11 }
}
```

**Desktop (1920px width):**
```typescript
{
  cardWidth: 60,  // Maximum default size
  cardHeight: 84,
  cardGap: 9,
  cardOverlap: 21,
  fontSize: { large: 24, medium: 17, small: 12 }
}
```

## Component Integration

All card-rendering components accept responsive sizing props:

### Card Component

```typescript
<Card
  card={myCard}
  cardWidth={layoutSizes.cardWidth}
  cardHeight={layoutSizes.cardHeight}
  fontSize={layoutSizes.fontSize}
  highContrastMode={accessibilitySettings.highContrastMode}
  // ... other props
/>
```

### EmptyCell Component

```typescript
<EmptyCell
  cardWidth={layoutSizes.cardWidth}
  cardHeight={layoutSizes.cardHeight}
  label="Free"
  // ... other props
/>
```

### Tableau Component

```typescript
<Tableau
  columns={gameState.tableau}
  cardWidth={layoutSizes.cardWidth}
  cardHeight={layoutSizes.cardHeight}
  cardOverlap={layoutSizes.cardOverlap}
  fontSize={layoutSizes.fontSize}
  // ... other props
/>
```

### Components Using Responsive Sizing

- `Card.tsx` - Individual card rendering
- `EmptyCell.tsx` - Empty slot placeholders
- `Tableau.tsx` - Main playing area (FreeCell: 8 columns, Klondike: 7 columns)
- `FreeCellArea.tsx` - Top-left holding cells (FreeCell only)
- `FoundationArea.tsx` - Top-right foundation piles (4 suits)
- `StockPile.tsx` - Draw pile (Klondike only)
- `WastePile.tsx` - Waste pile (Klondike only)

## Window Resize Handling

The game listens for window resize and orientation change events to recalculate layout dynamically:

```typescript
import { useEffect, useState } from 'react';
import { calculateLayoutSizes, getMaxCardWidth } from '../utils/responsiveLayout';
import { loadAccessibilitySettings } from '../config/accessibilitySettings';

function GameBoard() {
  const [accessibilitySettings, setAccessibilitySettings] = useState(() =>
    loadAccessibilitySettings()
  );

  const [layoutSizes, setLayoutSizes] = useState(() =>
    calculateLayoutSizes(
      window.innerWidth,
      window.innerHeight,
      getMaxCardWidth(accessibilitySettings.cardSize),
      accessibilitySettings.fontSizeMultiplier
    )
  );

  useEffect(() => {
    const handleResize = () => {
      setLayoutSizes(
        calculateLayoutSizes(
          window.innerWidth,
          window.innerHeight,
          getMaxCardWidth(accessibilitySettings.cardSize),
          accessibilitySettings.fontSizeMultiplier
        )
      );
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [accessibilitySettings]);

  return (
    {/* Render game with layoutSizes */}
  );
}
```

### Events Handled

- **resize**: Window size changes (browser resize, split screen, etc.)
- **orientationchange**: Device rotation (portrait ↔ landscape)

## Accessibility Integration

The responsive system integrates with accessibility settings to provide user-controlled sizing:

### Maximum Card Width Override

```typescript
function getMaxCardWidth(cardSize: CardSize): number {
  switch (cardSize) {
    case 'small': return 60;        // Default
    case 'medium': return 75;       // 25% larger
    case 'large': return 90;        // 50% larger
    case 'extra-large': return 110; // 80% larger
  }
}
```

### Font Size Multiplier

Users can independently scale text from 1.0x to 2.0x without changing card size:

```typescript
calculateLayoutSizes(
  window.innerWidth,
  window.innerHeight,
  getMaxCardWidth(settings.cardSize),
  settings.fontSizeMultiplier  // 1.0 - 2.0
)
```

This allows users with vision impairments to increase text size while keeping cards at a manageable size for the viewport.

## Best Practices

### DO:

✅ **Always use calculated dimensions from `layoutSizes`**
```typescript
// Good
<div style={{ width: layoutSizes.cardWidth, height: layoutSizes.cardHeight }}>
```

✅ **Pass layout props down to child components**
```typescript
// Good
<Card cardWidth={layoutSizes.cardWidth} cardHeight={layoutSizes.cardHeight} />
```

✅ **Use relative units for spacing when appropriate**
```typescript
// Good - scales with card size
const margin = layoutSizes.cardGap;
```

✅ **Test on multiple device sizes**
```typescript
// Test viewports: 375px, 768px, 1920px
```

### DON'T:

❌ **Never use hardcoded pixel values for card dimensions**
```typescript
// Bad
<div style={{ width: 60, height: 84 }}>
```

❌ **Don't assume viewport size**
```typescript
// Bad
if (isMobile) { /* mobile-specific code */ }
// Better to use calculated dimensions and CSS media queries
```

❌ **Don't forget to include font sizes**
```typescript
// Bad
<Card cardWidth={...} cardHeight={...} />
// Good
<Card cardWidth={...} cardHeight={...} fontSize={layoutSizes.fontSize} />
```

## Testing Responsive Behavior

### Browser DevTools Testing

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Open browser DevTools** (F12)

3. **Enable device toolbar** (Ctrl+Shift+M / Cmd+Shift+M)

4. **Test key viewports:**
   - **iPhone SE**: 375×667 (small mobile)
   - **iPhone 14 Pro**: 393×852 (modern mobile)
   - **iPad Mini**: 744×1133 (tablet portrait)
   - **iPad**: 1024×768 (tablet landscape)
   - **Desktop**: 1920×1080 (standard desktop)
   - **Large Desktop**: 2560×1440 (high-res desktop)

5. **Test orientation changes:**
   - Rotate device in DevTools
   - Verify layout adapts smoothly
   - Check both portrait and landscape modes

### Real Device Testing

```bash
# Start dev server with network access
npm run dev -- --host

# Access from mobile device on same network:
# http://<your-local-ip>:5173
# Example: http://192.168.1.100:5173
```

**Test on:**
- iOS devices (iPhone, iPad) in Safari
- Android phones/tablets in Chrome
- Different screen sizes and orientations

### Automated Testing

```typescript
// Example test in responsiveLayout.test.ts
import { calculateLayoutSizes } from './responsiveLayout';

describe('calculateLayoutSizes', () => {
  it('should scale cards for mobile viewport', () => {
    const sizes = calculateLayoutSizes(375, 667);
    expect(sizes.cardWidth).toBeLessThan(60);
    expect(sizes.cardHeight / sizes.cardWidth).toBeCloseTo(1.4); // 7/5 ratio
  });

  it('should respect maximum card width', () => {
    const sizes = calculateLayoutSizes(3000, 2000, 60);
    expect(sizes.cardWidth).toBeLessThanOrEqual(60);
  });

  it('should apply font size multiplier', () => {
    const normal = calculateLayoutSizes(1920, 1080, 60, 1.0);
    const doubled = calculateLayoutSizes(1920, 1080, 60, 2.0);
    expect(doubled.fontSize.large).toBe(normal.fontSize.large * 2);
  });
});
```

## Performance Considerations

### Current Implementation

The system recalculates layout on **every** resize event, which can cause:
- Multiple re-renders during active window resizing
- Potential performance issues on slower devices
- Unnecessary calculations when changes are minimal

### Recommended Optimization: Debouncing

Implement debouncing to reduce calculation frequency:

```typescript
import { debounce } from 'lodash';

useEffect(() => {
  const handleResize = debounce(() => {
    setLayoutSizes(
      calculateLayoutSizes(
        window.innerWidth,
        window.innerHeight,
        getMaxCardWidth(accessibilitySettings.cardSize),
        accessibilitySettings.fontSizeMultiplier
      )
    );
  }, 150); // Wait 150ms after last resize event

  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', handleResize);

  return () => {
    handleResize.cancel(); // Cancel pending debounced calls
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('orientationchange', handleResize);
  };
}, [accessibilitySettings]);
```

**Benefits:**
- Reduces re-renders during active resizing
- Improves performance on mobile devices
- Still responsive enough for user experience (150ms is imperceptible)

### Alternative: Throttling

For immediate visual feedback during resize:

```typescript
import { throttle } from 'lodash';

const handleResize = throttle(() => {
  setLayoutSizes(calculateLayoutSizes(...));
}, 100); // Update at most every 100ms
```

**Use throttling when:**
- You want smooth visual feedback during resize
- You need to update more frequently than debouncing allows

**Use debouncing when:**
- Final value is more important than intermediate states
- You want to minimize calculations (recommended for this project)

---

**See Also:**
- [Accessibility Settings](./settings.md) - User-controlled sizing options
- [Accessibility Testing](./testing.md) - Testing responsive design across devices
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - Web Content Accessibility Guidelines
