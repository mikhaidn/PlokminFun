# Testing Strategy

## Test Coverage Goals

- **Unit tests:** >90% coverage for encoder/decoder
- **Integration tests:** 100% coverage for round-trip encoding
- **E2E tests:** Core user flows (share, replay, copy URL)
- **Performance tests:** Encoding/decoding benchmarks

---

## Unit Tests

### Encoder Tests (`encoder.test.ts`)

```typescript
describe('encodeMove', () => {
  test('encodes tableau to foundation move', () => {
    const move = { from: { type: 'T', index: 2, cardIndex: 3 }, to: { type: 'F', index: 0 } };
    expect(encodeMove(move)).toBe('A7'); // Example
  });

  test('encodes freecell to tableau move', () => {
    const move = { from: { type: 'F', index: 1 }, to: { type: 'T', index: 5 } };
    expect(encodeMove(move)).toBe('B3');
  });

  test('handles edge cases (index 0, index 7)', () => {
    // Test boundary conditions
  });
});

describe('encodeGame', () => {
  test('encodes game session with seed and moves', () => {
    const session = { seed: 1234567890, moves: [...], metadata: { won: true } };
    const encoded = encodeGame(session);
    expect(encoded).toMatch(/^[a-z0-9]+\.[A-Za-z0-9+/]+\.W$/);
  });

  test('encoding size is under 2KB for 100 moves', () => {
    const session = createMockGame(100);
    const encoded = encodeGame(session);
    expect(encoded.length).toBeLessThan(2048);
  });
});
```

### Decoder Tests (`decoder.test.ts`)

```typescript
describe('decodeMove', () => {
  test('decodes tableau to foundation move', () => {
    const move = decodeMove('A7');
    expect(move).toEqual({ from: { type: 'T', index: 2, cardIndex: 3 }, to: { type: 'F', index: 0 } });
  });

  test('throws error on invalid encoding', () => {
    expect(() => decodeMove('INVALID')).toThrow();
  });
});

describe('decodeGame', () => {
  test('decodes game session correctly', () => {
    const encoded = 'g4z3m.A7B2C5.W';
    const session = decodeGame(encoded);
    expect(session.seed).toBe(/* calculated from g4z3m */);
    expect(session.moves).toHaveLength(3);
    expect(session.metadata?.won).toBe(true);
  });

  test('handles games without win flag', () => {
    const encoded = 'g4z3m.A7B2C5';
    const session = decodeGame(encoded);
    expect(session.metadata?.won).toBeFalsy();
  });
});
```

### Integration Tests (`integration.test.ts`)

```typescript
describe('encode/decode round-trip', () => {
  test('encodes and decodes game with 100% fidelity', () => {
    const original = createMockGame(50);
    const encoded = encodeGame(original);
    const decoded = decodeGame(encoded);
    expect(decoded).toEqual(original);
  });

  test('handles 1000+ different game sessions', () => {
    for (let i = 0; i < 1000; i++) {
      const game = playRandomGame();
      const encoded = encodeGame(game);
      const decoded = decodeGame(encoded);
      expect(decoded.seed).toBe(game.seed);
      expect(decoded.moves).toEqual(game.moves);
    }
  });

  test('property-based testing: encode → decode → encode matches', () => {
    fc.assert(
      fc.property(fc.gameSession(), (session) => {
        const encoded1 = encodeGame(session);
        const decoded = decodeGame(encoded1);
        const encoded2 = encodeGame(decoded);
        return encoded1 === encoded2;
      })
    );
  });
});
```

### Validator Tests (`validator.test.ts`)

```typescript
describe('validateGame', () => {
  test('validates legal game sequence', () => {
    const session = playValidGame();
    expect(validateGame(session)).toBe(true);
  });

  test('rejects illegal moves', () => {
    const session = { seed: 12345, moves: [{ from: { type: 'T', index: 0 }, to: { type: 'T', index: 1 } }] };
    expect(() => validateGame(session)).toThrow('Illegal move');
  });

  test('rejects games with invalid seed', () => {
    const session = { seed: -1, moves: [] };
    expect(() => validateGame(session)).toThrow('Invalid seed');
  });
});
```

---

## Performance Tests

### Benchmarks

```typescript
describe('performance', () => {
  test('encodes 100-move game in <10ms', () => {
    const game = createMockGame(100);
    const start = performance.now();
    encodeGame(game);
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(10);
  });

  test('decodes 100-move game in <50ms on mobile', () => {
    const encoded = createEncodedGame(100);
    const start = performance.now();
    decodeGame(encoded);
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(50);
  });

  test('validates 100-move game in <500ms', () => {
    const session = createMockGame(100);
    const start = performance.now();
    validateGame(session);
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(500);
  });
});
```

---

## E2E Tests

### User Flows

```typescript
describe('Share and Replay Flow', () => {
  test('user completes game, shares, recipient replays', async () => {
    // 1. Play game to completion
    await playGameToWin();

    // 2. Click share button
    await page.click('[data-testid="share-button"]');

    // 3. Copy URL
    const url = await page.$eval('[data-testid="share-url"]', el => el.value);
    expect(url).toContain('?replay=');

    // 4. Navigate to URL in new tab
    await page.goto(url);

    // 5. Verify replay UI appears
    expect(await page.$('[data-testid="replay-controls"]')).toBeTruthy();

    // 6. Click play button
    await page.click('[data-testid="replay-play"]');

    // 7. Verify game replays
    await page.waitForSelector('[data-testid="replay-complete"]', { timeout: 10000 });
  });

  test('invalid URL shows error message', async () => {
    await page.goto('/freecell/?replay=INVALID');
    expect(await page.$('[data-testid="error-message"]')).toBeTruthy();
  });
});
```

---

## Success Metrics

### User-Facing Metrics

- [ ] **Share rate**: >5% of completed games shared
  - Track: `completedGames / sharedGames`
  - Goal: 1 in 20 wins shared

- [ ] **Replay rate**: >20% of shared games replayed
  - Track: `sharedURLs / replayViews`
  - Goal: 1 in 5 shares viewed

- [ ] **Completion rate**: >80% of replays watched to end
  - Track: `replayStarts / replayCompletions`
  - Goal: Most viewers watch full replay

- [ ] **Load time**: <500ms from URL to replay start
  - Track: `pageLoad → replayReady`
  - Goal: Fast enough for social media shares

### Technical Metrics

- [ ] **Encoding size**: Average game <1KB, max <2KB
  - Track: Histogram of encoding sizes
  - Goal: 95th percentile <2KB

- [ ] **Encoding speed**: <10ms for 100 moves
  - Track: P95 encoding duration
  - Goal: Imperceptible to users

- [ ] **Decoding speed**: <50ms for 100 moves
  - Track: P95 decoding duration
  - Goal: Fast load on mobile

- [ ] **Validation accuracy**: 100% (no false negatives)
  - Track: Legal games rejected / total games
  - Goal: Zero false rejections

### Business Metrics (Future)

- [ ] **Viral coefficient**: Track referrals from shared games
  - New users from replay URLs
  - Goal: K-factor >1.0

- [ ] **Retention**: Do users who replay games return more?
  - 7-day retention: replay viewers vs non-viewers
  - Goal: +20% retention

- [ ] **Daily challenge**: Participation increases with sharing
  - Daily challenge completion before/after sharing
  - Goal: +50% participation

---

## Risk Mitigation

### Risk 1: URL Length Exceeds Browser Limits

**Likelihood:** Low
**Impact:** High (breaks sharing for long games)

**Mitigation:**
- Target <2KB (safe limit is ~2048 chars)
- Use compression (gzip text before base64)
- Fall back to file download if >2KB
- Monitor 95th percentile game length

**Tests:**
```typescript
test('games over 150 moves trigger download fallback', () => {
  const game = createMockGame(200);
  const encoded = encodeGame(game);
  if (encoded.length > 2048) {
    expect(shouldUseFallback(game)).toBe(true);
  }
});
```

---

### Risk 2: Move Validation Performance

**Likelihood:** Medium (complex games, mobile devices)
**Impact:** Medium (slow load time)

**Mitigation:**
- Lazy validation: validate on play, not on load
- Show loading spinner for >200ms
- Use Web Worker for validation
- Cache validated games in localStorage

**Tests:**
```typescript
test('validation shows loading state after 200ms', async () => {
  const slowGame = createComplexGame();
  const promise = validateGame(slowGame);
  await sleep(200);
  expect(screen.getByText('Validating...')).toBeInTheDocument();
});
```

---

### Risk 3: Encoding Collisions / Ambiguity

**Likelihood:** Low (good bit packing)
**Impact:** High (replays differ from original)

**Mitigation:**
- Comprehensive test suite (1000+ games)
- Property-based testing (encode → decode → encode must match)
- Add checksum to encoding (CRC-8, +1 byte)
- Versioning: prefix with version byte for future changes

**Tests:**
```typescript
test('no collisions in 10,000 random games', () => {
  const encodings = new Set();
  for (let i = 0; i < 10000; i++) {
    const game = playRandomGame();
    const encoded = encodeGame(game);
    expect(encodings.has(encoded)).toBe(false);
    encodings.add(encoded);
  }
});
```

---

### Risk 4: Cheating / Invalid Shares

**Likelihood:** High (users will try)
**Impact:** Low (single-player game, no leaderboards yet)

**Mitigation:**
- Strict move validation (reject invalid moves)
- Can't claim win without valid move sequence
- Future: Server-side validation for leaderboards
- For now: "Trust but verify locally"

**Tests:**
```typescript
test('manipulated encoding is rejected', () => {
  const valid = encodeGame(playValidGame());
  const manipulated = valid.replace(/A7/, 'XX');
  expect(() => decodeGame(manipulated)).toThrow();
});
```

---

## Test Automation

### CI/CD Integration

```yaml
# .github/workflows/test.yml
- name: Run unit tests
  run: npm test -- --coverage --coverageThreshold='{"global":{"lines":90}}'

- name: Run performance benchmarks
  run: npm run bench -- --threshold=10ms

- name: Run E2E tests
  run: npm run test:e2e

- name: Check encoding size limits
  run: npm run test:size -- --max-size=2048
```

### Pre-commit Hooks

```javascript
// .husky/pre-commit
npm run test:unit
npm run test:perf
npm run lint
```

---

## Manual Testing Checklist

- [ ] Test on mobile devices (iOS, Android)
- [ ] Test on slow connections (throttle to 3G)
- [ ] Test with screen readers (VoiceOver, NVDA)
- [ ] Test keyboard navigation (no mouse)
- [ ] Test URL sharing on social media (Twitter, Facebook)
- [ ] Test QR code scanning from printed screenshot
- [ ] Test with very long games (200+ moves)
- [ ] Test with very short games (1-10 moves)
- [ ] Test concurrent replays in multiple tabs
- [ ] Test offline functionality (service worker)
