# 🐕 Dog Care Tracker

A mobile-first PWA for tracking your dog's daily activities and sharing status with caretakers.

## Features

- **Mobile-optimized**: Touch-friendly UI designed for on-the-go logging
- **Daily tracking**: Log pee, poop, walks, and notes for morning/afternoon/night
- **Instant sharing**: Generate shareable URLs and text summaries (Wordle-style)
- **Import/Export**: Receive and merge shared logs
- **Offline-capable**: PWA with service worker for offline use
- **localStorage**: All data stays on your device

## Use Case

**Problem**: You and your roommate share dog care. You take the dog out in the morning, but your roommate doesn't know if the dog has peed, pooped, or been walked yet.

**Solution**: Log activities on your phone → tap Share → send URL or text to roommate → they instantly see the status or import it into their tracker.

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Type checking
npm run typecheck
```

## Architecture

- **React + TypeScript**: Type-safe component architecture
- **Vite**: Fast dev server and optimized builds
- **localStorage**: Client-side persistence (no backend needed)
- **PWA**: Installable, offline-capable progressive web app

## Data Model

```typescript
type Period = 'morning' | 'afternoon' | 'night';

interface PeriodLog {
  pee: boolean;
  poop: boolean;
  walk: boolean;
  notes: string;
}

interface DayLog {
  date: string; // ISO date
  periods: {
    morning: PeriodLog;
    afternoon: PeriodLog;
    night: PeriodLog;
  };
}
```

## Sharing Format

**URL**: `https://plokmin.dev/dog?data=<base64-encoded-log>`

**Text** (Wordle-style):
```
🐕 Dog Log: Jan 11, 2026

🌅 Morning: 💧💩🚶 "Good walk!"
☀️ Afternoon: 💧
🌙 Night: —
```

## Future Enhancements

- Calendar view (historical logs)
- Multi-dog support
- Reminders/notifications
- Statistics and trends
- Export to CSV

## Part of Plokmin Consortium

This is one experience in the Plokmin collection of interactive web apps.
