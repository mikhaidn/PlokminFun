/**
 * Utility to generate pre-filled bug report URLs
 */

import type { GameState } from '../state/gameState';

export interface BugReportContext {
  seed?: number;
  moves?: number;
  description?: string;
}

/**
 * Generate a GitHub issue URL with pre-filled bug report
 */
export function createBugReportUrl(context: BugReportContext = {}): string {
  const { seed, moves, description = '' } = context;

  // Get browser/device info
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  const screenSize = `${window.screen.width}x${window.screen.height}`;

  const body = `## Bug Description
${description}

## Steps to Reproduce
1.
2.
3.

## Expected Behavior


## Actual Behavior


## Game Seed
${seed !== undefined ? `Seed: ${seed}` : 'N/A'}
${moves !== undefined ? `Moves: ${moves}` : ''}

## Environment
- **Browser**: ${userAgent}
- **Platform**: ${platform}
- **Screen**: ${screenSize}
- **URL**: ${window.location.href}
- **Timestamp**: ${new Date().toISOString()}

## Additional Context

`;

  const title = seed !== undefined
    ? `[BUG] Issue in game seed ${seed}`
    : '[BUG] ';

  const url = new URL('https://github.com/mikhaidn/CardGames/issues/new');
  url.searchParams.set('template', 'bug_report.md');
  url.searchParams.set('title', title);
  url.searchParams.set('body', body);
  url.searchParams.set('labels', 'bug');

  return url.toString();
}

/**
 * Generate bug report from current game state
 */
export function createBugReportFromGameState(
  gameState: GameState,
  description?: string
): string {
  return createBugReportUrl({
    seed: gameState.seed,
    moves: gameState.moves,
    description,
  });
}

/**
 * Open bug report in new tab
 */
export function openBugReport(context: BugReportContext = {}): void {
  const url = createBugReportUrl(context);
  window.open(url, '_blank', 'noopener,noreferrer');
}
