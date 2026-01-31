# Accessibility & Responsive Design

This directory contains documentation for accessibility features and responsive design.

---

## 📖 Documentation

- **[responsive-design.md](responsive-design.md)** - Viewport-based dynamic sizing system
- **[settings.md](settings.md)** - Accessibility settings (high contrast, card size, fonts)
- **[testing.md](testing.md)** - Accessibility testing guide

---

## 🎯 Quick Overview

**Responsive features:**
- ✅ Viewport-based dynamic card sizing
- ✅ Breakpoints for mobile/tablet/desktop
- ✅ Automatic layout recalculation on resize
- ✅ Maintains 5:7 card aspect ratio

**Accessibility features:**
- ✅ High contrast mode
- ✅ Adjustable card size (small → extra large)
- ✅ Font size multiplier (1.0x - 2.0x)
- ✅ Button position (top/bottom for one-handed mode)
- ✅ Large touch targets (WCAG AAA)
- ✅ Settings persist in localStorage

---

## 🚀 Quick Start

**For developers:**
```typescript
// Get responsive layout sizes
import { calculateLayoutSizes } from '@plokmin/shared';

const layoutSizes = calculateLayoutSizes(
  window.innerWidth,
  window.innerHeight,
  maxCardWidth,      // From accessibility settings
  fontSizeMultiplier // From accessibility settings
);

// Use in components
<Card
  card={card}
  cardWidth={layoutSizes.cardWidth}
  cardHeight={layoutSizes.cardHeight}
  fontSize={layoutSizes.fontSize}
  highContrastMode={settings.highContrastMode}
/>
```

**For users:**
- Open game → Click "Settings" button
- Adjust card size, fonts, button position, etc.
- Settings save automatically

---

## 📱 Supported Devices

| Device | Screen Size | Card Size | Layout |
|--------|-------------|-----------|--------|
| **Mobile** | < 600px | Small-Medium | Compact header, bottom buttons (optional) |
| **Tablet** | 600-900px | Medium | Side-by-side header |
| **Desktop** | > 900px | Medium-Large | Full layout, max card size |

---

## 🔍 Choose Your Topic

**I want to...**
- Understand responsive sizing → [responsive-design.md](responsive-design.md)
- Learn about accessibility settings → [settings.md](settings.md)
- Test accessibility features → [testing.md](testing.md)
