/**
 * Spider Help Content
 * Rules, valid moves, tips, and keyboard shortcuts.
 */

import type { HelpContent } from '@plokmin/shared';

export const spiderHelpContent: HelpContent = {
  gameName: 'Spider',
  objective:
    'Build eight complete King-to-Ace runs of a single suit. Completed runs are removed automatically — clear them all to win.',

  rules: [
    '**Tableau:** 10 columns. Only the top card of each column starts face-up.',
    '**Stock:** Click the stock to deal one card face-up to every column.',
    '**Dealing:** You cannot deal while any column is empty — fill every column first.',
    '**Completed runs:** A full King→Ace run of one suit is removed to a foundation automatically.',
    '**Difficulty:** Choose 1, 2, or 4 suits. Fewer suits is easier; every game uses two decks (104 cards).',
  ],

  validMoves: [
    '**Placing a card:** Place a card on any card of the next rank up, regardless of suit (any 9 onto any 10).',
    '**Moving a run:** You can pick up several cards at once only if they form a descending run of the same suit (10♠ 9♠ 8♠).',
    '**Empty columns:** Any card or valid run may be placed on an empty column.',
    '**Revealing cards:** When you move cards off a column, the newly exposed card flips face-up.',
  ],

  tips: [
    'Try to build runs in a single suit so they can be removed and free up space.',
    'Uncover face-down cards early to give yourself more options.',
    'Keep a column empty when you can — it is the most flexible place to maneuver.',
    'Avoid dealing too early; clear up the board first so the new row is more useful.',
    'Start with the 1-suit game to learn the flow, then work up to 2 and 4 suits.',
  ],

  keyboardShortcuts: [
    { key: 'U', action: 'Undo last move' },
    { key: 'Ctrl+Z', action: 'Undo last move' },
    { key: 'R', action: 'Redo move' },
    { key: 'Ctrl+Y', action: 'Redo move' },
    { key: 'Esc', action: 'Close modals' },
  ],
};
