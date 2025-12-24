# Accessibility Testing

Comprehensive testing guide for accessibility features in the CardGames project. Ensure that the games are usable by everyone, including users with disabilities.

## Table of Contents

- [Overview](#overview)
- [Testing Checklist](#testing-checklist)
- [Manual Testing Procedures](#manual-testing-procedures)
- [Device Testing](#device-testing)
- [Screen Reader Testing](#screen-reader-testing)
- [Keyboard Navigation Testing](#keyboard-navigation-testing)
- [WCAG Compliance](#wcag-compliance)
- [Visual Accessibility Testing](#visual-accessibility-testing)
- [Touch Target Testing](#touch-target-testing)
- [Responsive Design Testing](#responsive-design-testing)
- [Settings Persistence Testing](#settings-persistence-testing)
- [Automated Testing](#automated-testing)
- [Common Issues and Solutions](#common-issues-and-solutions)

## Overview

Accessibility testing ensures that:
- All users can perceive, understand, navigate, and interact with the games
- The games meet WCAG 2.1 Level AA standards (aiming for AAA where possible)
- Settings persist across sessions
- Visual and interaction accommodations work correctly

**Testing Environment Requirements:**
- Multiple browsers (Chrome, Firefox, Safari, Edge)
- Multiple devices (desktop, tablet, mobile)
- Screen readers (NVDA, JAWS, VoiceOver, TalkBack)
- Various operating systems (Windows, macOS, iOS, Android)

## Testing Checklist

### High Contrast Mode
- [ ] Cards have bolder borders (4px vs 1-2px)
- [ ] Black suits display as pure black (#000)
- [ ] Red suits display as bright red (#ff0000)
- [ ] Selection indicators are clearly visible
- [ ] Shadows provide adequate depth perception
- [ ] Text remains readable against backgrounds
- [ ] Valid/invalid drop targets are distinguishable

### Card Size Settings
- [ ] Small (60px): Default size, cards fit viewport
- [ ] Medium (75px): 25% larger, maintains aspect ratio
- [ ] Large (90px): 50% larger, scrolling may be needed
- [ ] Extra Large (110px): Maximum size, appropriate for accessibility needs
- [ ] Spacing scales proportionally with card size
- [ ] All cards render at same size (no inconsistencies)

### Font Size Multiplier
- [ ] 1.0x: Default, all text readable
- [ ] 1.5x: 50% larger, no overlap with card boundaries
- [ ] 2.0x: Double size, maximum readability
- [ ] Suit symbols scale correctly
- [ ] Card values scale correctly
- [ ] Corner text scales correctly
- [ ] Button text scales correctly

### Button Position
- [ ] Top: Controls visible in header
- [ ] Bottom: Controls in fixed bottom bar
- [ ] Bottom position is thumb-reachable on mobile
- [ ] Bottom bar doesn't obscure game area
- [ ] All buttons remain functional in both positions
- [ ] Layout adjusts appropriately for each position

### Touch Target Size
- [ ] Normal: Buttons are at least 36px height
- [ ] Large: Buttons meet WCAG AAA (44px minimum)
- [ ] All interactive elements have adequate spacing
- [ ] No accidental activations when tapping nearby
- [ ] Touch targets work consistently across devices

### Settings Persistence
- [ ] Settings save to localStorage
- [ ] Settings load on page reload
- [ ] Settings persist across browser sessions
- [ ] Settings work after clearing cookies (localStorage separate)
- [ ] Invalid/corrupted settings fall back to defaults

## Manual Testing Procedures

### 1. High Contrast Mode Testing

**Steps:**
1. Open game (FreeCell or Klondike)
2. Click Settings button (⚙️)
3. Enable "High Contrast Mode" checkbox
4. Click Save
5. Observe visual changes

**Expected Results:**
- Card borders become thicker (4px)
- Black suits (♠ ♣) display in pure black
- Red suits (♥ ♦) display in bright red
- Selected cards have prominent border (4px blue)
- Shadows are more pronounced
- Background is pure white (#ffffff)

**Test Scenarios:**
- Select a card → Border should be clearly visible
- Hover over valid drop target → Highlight should be obvious
- Play in bright sunlight simulation → Cards should be distinguishable
- Rapid card movements → High contrast should maintain visibility

### 2. Card Size Testing

**Steps:**
1. Open Settings
2. Change "Card Size" to each option:
   - Small (default)
   - Medium
   - Large
   - Extra Large
3. Observe card scaling

**Expected Results:**

| Setting | Width | Height | Viewport Fit | Scrolling |
|---------|-------|--------|--------------|-----------|
| Small | ≤60px | ≤84px | Always fits | No |
| Medium | ≤75px | ≤105px | Fits on tablet+ | Rare |
| Large | ≤90px | ≤126px | May scroll on mobile | Possible |
| Extra Large | ≤110px | ≤154px | Likely scrolls | Common |

**Test Scenarios:**
- Desktop (1920×1080): All sizes should fit without scrolling
- Tablet (768×1024): Small/Medium fit, Large may scroll
- Mobile (375×667): Small fits, larger sizes require scrolling
- Orientation change: Cards should resize appropriately

### 3. Font Size Multiplier Testing

**Steps:**
1. Open Settings
2. Adjust "Font Size" slider from 1.0x to 2.0x
3. Observe text scaling

**Expected Results:**
- **1.0x**: Suit symbols ~24px, values ~17px
- **1.5x**: Suit symbols ~36px, values ~25.5px
- **2.0x**: Suit symbols ~48px, values ~34px
- Text remains within card boundaries
- No text overlap with borders
- Corner text scales proportionally

**Test Scenarios:**
- Maximum font + maximum card size → Text should fit
- Minimum font + minimum card size → Text should be readable
- Rapid slider adjustment → No visual glitches

### 4. Button Position Testing

**Steps:**
1. Open Settings on mobile device
2. Change "Button Position" to "Bottom"
3. Attempt one-handed gameplay

**Expected Results:**
- Bottom bar fixed at bottom of screen
- All buttons reachable with thumb
- Bottom bar doesn't obstruct game area
- Z-index ensures bar stays on top
- Works in both portrait and landscape

**Test Scenarios:**
- Play full game with bottom controls
- Test reach with left and right thumb
- Verify no accidental card interactions
- Check landscape orientation usability

### 5. Touch Target Size Testing

**Steps:**
1. Open Settings
2. Change "Touch Target Size" to "Large"
3. Measure button dimensions

**Expected Results:**
- Normal buttons: 36-40px height
- Large buttons: ≥44px height
- Large buttons: ≥44px width
- Adequate spacing between buttons (≥8px)
- No overlap with adjacent elements

**Test Scenarios:**
- Tap each button 10 times → 100% accuracy expected
- Rapid tapping → No missed clicks
- Edge tapping → Buttons still activate
- Compare error rate: Normal vs Large

## Device Testing

### Desktop Testing

**Browsers:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest, macOS only)
- Edge (latest)

**Resolutions:**
- 1920×1080 (Full HD)
- 2560×1440 (QHD)
- 3840×2160 (4K)

**Checklist:**
- [ ] Game fits viewport without scrolling (small card size)
- [ ] All settings apply correctly
- [ ] Keyboard shortcuts work (Ctrl+Z, Ctrl+Y, N, H)
- [ ] Mouse interactions smooth
- [ ] Drag-and-drop functions properly
- [ ] Click-to-select works

### Tablet Testing

**Devices:**
- iPad (768×1024 or 1024×768)
- iPad Mini (744×1133)
- iPad Pro (1024×1366)
- Android tablets (various)

**Orientations:**
- Portrait
- Landscape

**Checklist:**
- [ ] Responsive layout adapts correctly
- [ ] Touch interactions responsive
- [ ] Button position "top" optimal for tablets
- [ ] Cards sized appropriately (small/medium)
- [ ] No accidental card activations
- [ ] Multi-touch gestures don't interfere

### Mobile Testing

**Devices:**
- iPhone SE (375×667) - Small screen
- iPhone 14 (390×844) - Standard
- iPhone 14 Pro Max (430×932) - Large
- Android phones (various sizes)

**Orientations:**
- Portrait (primary)
- Landscape (secondary)

**Checklist:**
- [ ] Game playable in portrait mode
- [ ] Bottom button position improves one-handed use
- [ ] Large touch targets reduce errors
- [ ] Cards visible without excessive scrolling
- [ ] Drag-and-drop works with finger
- [ ] Tap-to-select functions correctly
- [ ] No zoom on double-tap

### Real Device Testing

**Setup:**
```bash
# Start dev server with network access
cd freecell-mvp  # or klondike-mvp
npm run dev -- --host

# Find your local IP
# macOS/Linux: ifconfig | grep "inet "
# Windows: ipconfig
# Example: 192.168.1.100

# Open on device: http://192.168.1.100:5173
```

**Test Procedures:**
1. Test all accessibility settings
2. Verify touch interactions
3. Check performance (smooth animations)
4. Test in different lighting (indoor, outdoor, sunlight)
5. Verify settings persistence
6. Test battery impact during extended play

## Screen Reader Testing

### Windows - NVDA (Free)

**Download:** https://www.nvaccess.org/download/

**Steps:**
1. Install and launch NVDA
2. Navigate to game with keyboard (Tab, Shift+Tab)
3. Listen for announcements

**Expected Announcements:**
- Button labels: "New Game", "Undo", "Redo", "Settings", "Help"
- Card descriptions: "Ace of Spades", "King of Hearts"
- Pile labels: "Free Cell 1", "Foundation Hearts", "Tableau Column 3"
- State changes: "Selected", "Moved to Foundation"

**Checklist:**
- [ ] All buttons have ARIA labels
- [ ] Card elements have descriptive text
- [ ] Interactive elements are keyboard-focusable
- [ ] Focus indicators are visible
- [ ] Modal dialogs trap focus appropriately
- [ ] Error messages are announced

### Windows - JAWS (Commercial)

**Download:** https://www.freedomscientific.com/products/software/jaws/

**Testing:** Similar to NVDA, verify:
- [ ] Consistent behavior with NVDA
- [ ] No JAWS-specific issues
- [ ] Virtual cursor mode works

### macOS/iOS - VoiceOver (Built-in)

**Enable:**
- macOS: System Preferences → Accessibility → VoiceOver
- iOS: Settings → Accessibility → VoiceOver

**Shortcuts:**
- macOS: Cmd+F5 (toggle)
- iOS: Triple-click home button or side button

**Testing:**
- [ ] Safari compatibility
- [ ] Touch gestures with VoiceOver (iOS)
- [ ] Rotor navigation (headings, links, form controls)

### Android - TalkBack (Built-in)

**Enable:** Settings → Accessibility → TalkBack

**Testing:**
- [ ] Chrome compatibility
- [ ] Swipe gestures with TalkBack
- [ ] Reading order logical
- [ ] Custom actions announced

### Screen Reader Checklist

- [ ] **Buttons**: All interactive elements have accessible labels
- [ ] **Cards**: Announced with rank and suit (e.g., "Ace of Spades")
- [ ] **Piles**: Labeled clearly (Free Cells, Foundations, Tableau)
- [ ] **State**: Selected/unselected state announced
- [ ] **Actions**: Results of moves announced
- [ ] **Errors**: Invalid moves explained
- [ ] **Dialogs**: Modal focus management
- [ ] **Instructions**: Help content accessible

## Keyboard Navigation Testing

### Essential Keyboard Shortcuts

| Shortcut | Action | Expected Behavior |
|----------|--------|-------------------|
| **Tab** | Next focusable element | Moves through buttons, cards |
| **Shift+Tab** | Previous focusable element | Reverse order |
| **Enter/Space** | Activate | Clicks button or selects card |
| **N** | New Game | Starts new game |
| **H** | Help | Opens help modal |
| **Ctrl+Z** (Cmd+Z) | Undo | Undoes last move |
| **Ctrl+Y** (Cmd+Y) | Redo | Redoes move |
| **Esc** | Close modal | Closes settings/help |
| **Arrow Keys** | Navigate cards | (Optional) Move focus between cards |

### Keyboard Testing Checklist

- [ ] All interactive elements keyboard-focusable
- [ ] Focus indicator visible (outline, border, highlight)
- [ ] Focus order logical (left-to-right, top-to-bottom)
- [ ] No keyboard traps (can always Tab out)
- [ ] Modal dialogs trap focus (Tab cycles within modal)
- [ ] Escape closes modals
- [ ] Shortcuts work consistently
- [ ] No shortcuts conflict with browser/OS

### Focus Indicator Testing

**Visual Requirements:**
- Minimum 2px border or outline
- High contrast with background (3:1 ratio minimum)
- Clearly visible in high contrast mode
- Different from selection indicator

**Test:**
```css
/* Good focus indicator */
button:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

/* High contrast mode enhancement */
@media (prefers-contrast: high) {
  button:focus {
    outline: 3px solid #0066cc;
  }
}
```

## WCAG Compliance

### WCAG 2.1 Level AA Compliance

**Perceivable:**
- [x] **1.4.3 Contrast (Minimum)**: 4.5:1 for normal text, 3:1 for large text
  - High contrast mode exceeds this (pure black/red on white)
- [x] **1.4.4 Resize Text**: Text can be resized up to 200% (font multiplier)
- [x] **1.4.10 Reflow**: Content reflows for 320px viewport width

**Operable:**
- [x] **2.1.1 Keyboard**: All functionality available via keyboard
- [x] **2.4.7 Focus Visible**: Focus indicator always visible
- [x] **2.5.5 Target Size (AAA)**: Large touch targets meet 44×44px minimum

**Understandable:**
- [x] **3.2.3 Consistent Navigation**: Controls in consistent locations
- [x] **3.3.1 Error Identification**: Invalid moves explained

**Robust:**
- [x] **4.1.2 Name, Role, Value**: All UI components have accessible names
- [x] **4.1.3 Status Messages**: Game state changes announced

### WCAG Testing Tools

**Browser Extensions:**
- [axe DevTools](https://www.deque.com/axe/devtools/) - Automated accessibility testing
- [WAVE](https://wave.webaim.org/extension/) - Visual feedback on accessibility
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Built into Chrome DevTools

**Testing Procedure:**
1. Install axe DevTools extension
2. Open game in browser
3. Open DevTools (F12)
4. Navigate to "axe DevTools" tab
5. Click "Scan ALL of my page"
6. Review issues by severity

**Expected Results:**
- 0 critical issues
- 0 serious issues
- Address moderate issues where possible
- Minor issues documented

### Color Contrast Testing

**Tool:** [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

**Test Combinations:**

| Foreground | Background | Ratio | WCAG Level | Status |
|------------|------------|-------|------------|--------|
| #000000 (Black) | #ffffff (White) | 21:1 | AAA | ✅ Pass |
| #ff0000 (Red) | #ffffff (White) | 4.0:1 | AA | ✅ Pass |
| #0066cc (Blue) | #ffffff (White) | 7.5:1 | AAA | ✅ Pass |

**High Contrast Mode:**
- Black text on white: 21:1 (AAA)
- Red text on white: 4.0:1 (AA large text)
- Blue selection on white: 7.5:1 (AAA)

## Visual Accessibility Testing

### Color Blindness Testing

**Tools:**
- [Color Oracle](https://colororacle.org/) - Simulates color blindness
- Chrome DevTools → Rendering → Emulate vision deficiencies

**Test Modes:**
- Protanopia (red-blind)
- Deuteranopia (green-blind)
- Tritanopia (blue-blind)
- Achromatopsia (no color vision)

**Checklist:**
- [ ] Red and black suits distinguishable by shape (♥♦ vs ♠♣)
- [ ] Selection/highlight visible in all modes
- [ ] High contrast mode improves distinction
- [ ] Valid/invalid moves clear without color
- [ ] Error messages don't rely solely on color

### Low Vision Testing

**Simulate:**
- Blur vision: CSS filter `blur(1px)`
- Reduce contrast: Lower screen brightness
- Increase distance: View from 3+ feet away

**Checklist:**
- [ ] Cards distinguishable when blurred
- [ ] High contrast mode improves visibility
- [ ] Large card sizes improve readability
- [ ] Font multiplier makes text readable at distance

### Motion Sensitivity Testing

**Check for:**
- Smooth animations (no jarring movements)
- Respect `prefers-reduced-motion` media query
- No flashing/strobing effects (seizure risk)
- Optional animation disable setting

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Touch Target Testing

### Measurement Tool

**Browser DevTools:**
1. Inspect button element
2. View computed dimensions
3. Verify: `height ≥ 44px` and `width ≥ 44px`

**CSS Test:**
```css
/* Ensure minimum touch target size */
button {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 16px;
}
```

### Touch Accuracy Testing

**Procedure:**
1. Set touch target size to "Normal"
2. Tap each button 20 times rapidly
3. Count missed clicks
4. Switch to "Large"
5. Repeat test
6. Compare error rates

**Expected Results:**
- Normal: <10% error rate
- Large: <2% error rate

### Spacing Testing

**Requirement:** Minimum 8px spacing between touch targets

**Test:**
```css
button + button {
  margin-left: 8px; /* Minimum spacing */
}
```

## Responsive Design Testing

### Viewport Testing

See [Responsive Design - Testing](./responsive-design.md#testing-responsive-behavior) for detailed procedures.

**Quick Test:**
1. Open DevTools (F12)
2. Enable device toolbar (Ctrl+Shift+M)
3. Test these viewports:
   - 375×667 (iPhone SE)
   - 768×1024 (iPad)
   - 1920×1080 (Desktop)
4. Rotate device (toggle portrait/landscape)
5. Verify layout adapts smoothly

### Orientation Change Testing

**Steps:**
1. Load game in portrait mode
2. Play a few moves
3. Rotate to landscape
4. Verify:
   - [ ] Game state preserved
   - [ ] Layout recalculates
   - [ ] Cards remain proportional
   - [ ] No visual glitches

## Settings Persistence Testing

### localStorage Testing

**Steps:**
1. Open Settings
2. Change all settings to non-default values:
   - High Contrast: ON
   - Card Size: Extra Large
   - Font Size: 2.0x
   - Button Position: Bottom
   - Touch Target Size: Large
3. Click Save
4. Reload page (F5)
5. Verify all settings preserved

**Test Scenarios:**
- [ ] Settings persist after page reload
- [ ] Settings persist after browser close/reopen
- [ ] Settings persist after computer restart
- [ ] Settings independent between games (FreeCell vs Klondike)
- [ ] Corrupted localStorage falls back to defaults

### Storage Key Testing

**Verify:**
```javascript
// Check localStorage in DevTools Console
localStorage.getItem('freecell-accessibility-settings');
localStorage.getItem('klondike-accessibility-settings');

// Should return JSON like:
// {"highContrastMode":true,"cardSize":"large","fontSizeMultiplier":1.5,...}
```

### Error Handling Testing

**Simulate Errors:**

**1. Quota Exceeded:**
```javascript
// Fill localStorage to quota
try {
  for (let i = 0; i < 10000; i++) {
    localStorage.setItem('test_' + i, 'x'.repeat(100000));
  }
} catch (e) {
  console.log('Quota exceeded');
}
// Now try saving settings - should fail gracefully
```

**2. Private Browsing:**
- Open incognito/private window
- Settings should work but not persist
- No errors displayed to user

**3. Corrupted Data:**
```javascript
// Corrupt settings
localStorage.setItem('freecell-accessibility-settings', 'invalid json{{{');
// Reload page - should use defaults, no error
```

## Automated Testing

### Unit Tests

**Example:** Testing settings functions

```typescript
// accessibilitySettings.test.ts
import { saveAccessibilitySettings, loadAccessibilitySettings } from './accessibilitySettings';

describe('Accessibility Settings', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should save and load settings', () => {
    const settings = {
      highContrastMode: true,
      cardSize: 'large' as const,
      fontSizeMultiplier: 1.5,
      buttonPosition: 'bottom' as const,
      touchTargetSize: 'large' as const
    };

    saveAccessibilitySettings(settings);
    const loaded = loadAccessibilitySettings();

    expect(loaded).toEqual(settings);
  });

  it('should use defaults when localStorage is empty', () => {
    const loaded = loadAccessibilitySettings();
    expect(loaded.highContrastMode).toBe(false);
    expect(loaded.cardSize).toBe('small');
  });

  it('should handle corrupted localStorage', () => {
    localStorage.setItem('freecell-accessibility-settings', 'invalid');
    const loaded = loadAccessibilitySettings();
    expect(loaded).toEqual(expect.objectContaining({
      highContrastMode: false
    }));
  });
});
```

### Integration Tests

```typescript
// SettingsModal.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import SettingsModal from './SettingsModal';

describe('SettingsModal', () => {
  it('should update settings when saved', () => {
    const onSave = vi.fn();
    render(<SettingsModal onClose={() => {}} onSave={onSave} />);

    // Enable high contrast
    fireEvent.click(screen.getByLabelText('High Contrast Mode'));

    // Save
    fireEvent.click(screen.getByText('Save'));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ highContrastMode: true })
    );
  });
});
```

### End-to-End Tests

**Tool:** Playwright or Cypress

```typescript
// e2e/accessibility.spec.ts
test('accessibility settings persist', async ({ page }) => {
  await page.goto('/freecell');

  // Open settings
  await page.click('text=Settings');

  // Enable high contrast
  await page.check('text=High Contrast Mode');

  // Save
  await page.click('text=Save');

  // Reload page
  await page.reload();

  // Verify settings persisted
  await page.click('text=Settings');
  await expect(page.locator('input[type=checkbox]')).toBeChecked();
});
```

## Common Issues and Solutions

### Issue 1: Settings Not Persisting

**Symptoms:**
- Settings reset on page reload
- localStorage appears empty

**Solutions:**
1. Check browser's private/incognito mode (localStorage disabled)
2. Verify localStorage quota not exceeded
3. Check browser security settings (localStorage may be blocked)
4. Inspect DevTools Console for errors

### Issue 2: High Contrast Mode Not Applying

**Symptoms:**
- Checkbox checked but colors unchanged
- Some cards have contrast, others don't

**Solutions:**
1. Verify `highContrastMode` prop passed to all Card components
2. Check CSS specificity (inline styles may override)
3. Clear browser cache (old CSS may be cached)
4. Verify `getCardColors()` function called with correct parameters

### Issue 3: Font Size Not Scaling

**Symptoms:**
- Slider moves but text size unchanged
- Some text scales, other text doesn't

**Solutions:**
1. Verify `fontSizeMultiplier` passed to `calculateLayoutSizes()`
2. Check that components use `layoutSizes.fontSize` not hardcoded values
3. Inspect computed styles in DevTools
4. Ensure font sizes calculated, not overridden by CSS

### Issue 4: Bottom Button Position Obstructs Game

**Symptoms:**
- Bottom bar covers tableau cards
- Can't see or interact with bottom rows

**Solutions:**
1. Add padding to game area: `padding-bottom: 60px`
2. Reduce bottom bar height
3. Implement collapsible bottom bar
4. Add z-index management for overlays

### Issue 5: Touch Targets Too Small on Real Device

**Symptoms:**
- Buttons appear correct size in DevTools
- Difficult to tap on actual device
- Frequent mis-taps

**Solutions:**
1. Test on real device, not just emulator
2. Verify CSS pixels vs device pixels (Retina displays)
3. Increase padding around buttons
4. Add minimum spacing between touch targets (8px)
5. Use Large touch target setting by default on mobile

---

**See Also:**
- [Responsive Design](./responsive-design.md) - Viewport-based sizing system
- [Accessibility Settings](./settings.md) - User-controlled settings
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/) - Compliance guidelines
- [a11y Project Checklist](https://www.a11yproject.com/checklist/) - General accessibility checklist
