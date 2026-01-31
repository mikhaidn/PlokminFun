# Daily Challenge Integration

## Overview

FreeCell Mini is **optimized for daily challenge format** due to:
- Quick play time (5-10 minutes)
- High solvability rate (95%+)
- Mobile-friendly layout
- Low frustration factor

---

## Daily Challenge Requirements

### Seed Generation Strategy

**Goal:** Provide one daily challenge that all players globally see.

```typescript
// Generate daily seed from UTC date
function getDailySeed(): number {
  const today = new Date();
  const utcDate = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());

  // Convert to seed (e.g., days since epoch)
  return Math.floor(utcDate / (1000 * 60 * 60 * 24));
}

// Usage
const dailySeed = getDailySeed(); // Same for all players on 2026-01-14
const gameState = createInitialState(dailySeed);
```

---

## Solvability Pre-Validation

### Problem
Not all random seeds produce solvable games (estimated 5-10% unsolvable).

### Solution: Seed Library
Maintain a curated list of known-solvable seeds:

```typescript
// Pre-validated seeds (generated offline)
const SOLVABLE_SEEDS = [
  { seed: 12345, difficulty: 'easy', moves: 45 },
  { seed: 67890, difficulty: 'medium', moves: 68 },
  { seed: 11111, difficulty: 'hard', moves: 92 },
  // ... 1000+ seeds
];

function getDailyChallengeConfig(dayIndex: number): SeedConfig {
  // Rotate through seed library
  const index = dayIndex % SOLVABLE_SEEDS.length;
  return SOLVABLE_SEEDS[index];
}
```

### Seed Generation Process (Offline)
```typescript
// Run once to generate seed library
async function generateSeedLibrary(count: number) {
  const seeds = [];

  for (let attempt = 0; seeds.length < count; attempt++) {
    const seed = generateRandomSeed();
    const gameState = createInitialState(seed);

    // Check solvability (may take 1-10 seconds per seed)
    const result = await solveFreeCell(gameState, { timeout: 10000 });

    if (result.solvable) {
      seeds.push({
        seed,
        difficulty: categorizeDifficulty(result.moves),
        moves: result.moves,
        timestamp: Date.now(),
      });

      console.log(`Found solvable seed ${seed} (${seeds.length}/${count})`);
    }
  }

  // Save to JSON file
  fs.writeFileSync('solvable-seeds.json', JSON.stringify(seeds, null, 2));
}
```

---

## Difficulty Balancing

### Move Count Ranges
```typescript
function categorizeDifficulty(moves: number): 'easy' | 'medium' | 'hard' {
  if (moves < 50) return 'easy';
  if (moves < 75) return 'medium';
  return 'hard';
}
```

### Weekly Rotation Pattern
```
Monday:    Easy    (40-50 moves)  - Start week relaxed
Tuesday:   Medium  (55-70 moves)  - Ramp up
Wednesday: Medium  (60-75 moves)
Thursday:  Hard    (75-90 moves)  - Peak challenge
Friday:    Medium  (50-65 moves)  - Wind down
Saturday:  Easy    (45-55 moves)  - Weekend bonus
Sunday:    Hard    (80-95 moves)  - Weekend challenge
```

---

## Persistence & Tracking

### LocalStorage Schema
```typescript
interface DailyChallenge {
  date: string;           // '2026-01-14'
  seed: number;           // 12345
  status: 'pending' | 'won' | 'lost';
  moves: number;          // Moves taken
  timeSpent: number;      // Seconds
  completed: boolean;
  completedAt?: string;   // ISO timestamp
}

// Store in localStorage
const STORAGE_KEY = 'freecell_mini_daily';

function saveDailyProgress(challenge: DailyChallenge) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(challenge));
}

function loadDailyProgress(): DailyChallenge | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
}
```

### Streak Tracking
```typescript
interface StreakData {
  current: number;      // Current streak (consecutive days)
  longest: number;      // All-time best
  lastPlayed: string;   // ISO date
  totalCompleted: number;
}

function updateStreak(won: boolean) {
  const streak = loadStreak();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = getPreviousDay(today);

  if (won) {
    // Increment streak if played yesterday or starting new
    if (streak.lastPlayed === yesterday || streak.current === 0) {
      streak.current++;
    } else {
      streak.current = 1; // Streak broken, restart
    }

    streak.longest = Math.max(streak.longest, streak.current);
    streak.totalCompleted++;
  }

  streak.lastPlayed = today;
  saveStreak(streak);
}
```

---

## UI Integration

### Daily Challenge Entry Point
```tsx
// Landing page (index.html)
<a href="./freecell-mini/?mode=daily" class="game-card daily-challenge">
  <div class="game-icon">🎴🌟</div>
  <h2>FreeCell Mini - Daily Challenge</h2>
  <p>Today's quick challenge - January 14, 2026</p>
  <span class="status daily">Play Today's Challenge</span>
  <div class="streak">🔥 5 day streak</div>
</a>
```

### In-Game Daily Mode
```tsx
function GameBoard() {
  const urlParams = new URLSearchParams(window.location.search);
  const isDailyMode = urlParams.get('mode') === 'daily';

  useEffect(() => {
    if (isDailyMode) {
      const dailySeed = getDailySeed();
      const progress = loadDailyProgress();

      // Load existing daily game or start new
      if (progress && progress.date === getTodayDate()) {
        // Resume today's challenge
        loadGameState(progress.state);
      } else {
        // Start new daily challenge
        initializeGame(dailySeed);
      }
    }
  }, [isDailyMode]);

  return (
    <div>
      {isDailyMode && (
        <div className="daily-banner">
          <h3>🌟 Daily Challenge - {formatDate(new Date())}</h3>
          <div className="stats">
            <span>Moves: {moveCount}</span>
            <span>Time: {formatTime(elapsed)}</span>
            <span>Streak: 🔥 {streak.current}</span>
          </div>
        </div>
      )}
      {/* Rest of game board */}
    </div>
  );
}
```

### Post-Completion Screen
```tsx
function WinCelebration({ isDailyMode, stats }) {
  if (!isDailyMode) return <StandardWinScreen />;

  return (
    <div className="daily-win">
      <h2>🎉 Daily Challenge Complete!</h2>
      <div className="stats-grid">
        <div className="stat">
          <div className="value">{stats.moves}</div>
          <div className="label">Moves</div>
        </div>
        <div className="stat">
          <div className="value">{formatTime(stats.time)}</div>
          <div className="label">Time</div>
        </div>
        <div className="stat highlight">
          <div className="value">🔥 {stats.streak}</div>
          <div className="label">Day Streak</div>
        </div>
      </div>

      <button onClick={shareResults}>Share Results</button>
      <button onClick={goToLanding}>Play Other Games</button>

      <p className="next-challenge">Next challenge in {timeUntilMidnight()}</p>
    </div>
  );
}
```

---

## Social Sharing

### Share Format (Wordle-style)
```typescript
function generateShareText(stats: DailyStats): string {
  const date = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return `FreeCell Mini Daily Challenge
${date}

✅ Solved in ${stats.moves} moves
⏱️ ${formatTime(stats.time)}
🔥 ${stats.streak} day streak

Play at: https://mikhaidn.github.io/PlokminFun/freecell-mini/?mode=daily`;
}

function shareResults() {
  const text = generateShareText(dailyStats);

  if (navigator.share) {
    // Native share API (mobile)
    navigator.share({ text });
  } else {
    // Clipboard fallback (desktop)
    navigator.clipboard.writeText(text);
    showToast('Results copied to clipboard!');
  }
}
```

---

## Analytics Events

### Track Daily Engagement
```typescript
// When daily challenge starts
analytics.track('daily_challenge_started', {
  game: 'freecell-mini',
  seed: dailySeed,
  difficulty: difficulty,
  date: getTodayDate(),
});

// When daily challenge completes
analytics.track('daily_challenge_completed', {
  game: 'freecell-mini',
  seed: dailySeed,
  moves: moveCount,
  time: elapsedSeconds,
  difficulty: difficulty,
  streak: currentStreak,
});

// Track streak milestones
if (currentStreak % 7 === 0) {
  analytics.track('streak_milestone', {
    game: 'freecell-mini',
    streak: currentStreak,
    milestone: `${currentStreak}_days`,
  });
}
```

---

## Phased Rollout

### Phase 1: Basic Daily Mode (Week 1)
- Single daily seed for all players
- LocalStorage persistence
- Basic "Today's Challenge" UI
- Win detection and celebration

### Phase 2: Streak Tracking (Week 2)
- Streak counter
- LocalStorage-based history
- Streak celebration UI (5, 10, 30 day milestones)

### Phase 3: Pre-Validated Seeds (Week 3)
- Generate 365+ solvable seeds
- Difficulty balancing (easy/medium/hard rotation)
- Seed library integration

### Phase 4: Social Features (Week 4)
- Share button with native/clipboard fallback
- Results formatting (Wordle-style)
- Optional: leaderboard (requires backend)

---

## Success Metrics

### Daily Challenge KPIs
- **Completion rate:** >60% (vs <40% for full FreeCell)
- **Return rate:** >30% play again next day
- **Streak retention:** >20% maintain 7+ day streak
- **Share rate:** >10% share results

### Analytics Tracking
```typescript
// Dashboard queries
- Daily challenge starts per day
- Daily challenge completions per day
- Average moves per challenge
- Average time per challenge
- Streak distribution (1 day, 7 day, 30 day, etc.)
- Share button clicks
```

---

## Dependencies

### Must-Have Before Launch
- ✅ RFC-006 (Game State Serialization) - for sharing specific game states
- ✅ LocalStorage persistence system
- ✅ Basic analytics integration (Plausible)

### Nice-to-Have
- Solvability checker algorithm
- Seed library generator script
- Leaderboard backend (optional, deferred)

---

## Future Enhancements

### Potential Additions
1. **Weekly challenges** - Harder variant, runs Mon-Sun
2. **Multiple daily games** - Mini + Full rotation
3. **Historical challenges** - Replay past days
4. **Custom challenges** - Generate shareable seeds
5. **Competitive mode** - Same seed, compare times/moves
