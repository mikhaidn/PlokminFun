/**
 * FreeCell Help Content
 * Rules, valid moves, tips, and keyboard shortcuts
 */

import type { HelpContent } from '@cardgames/shared';

export const freecellHelpContent: HelpContent = {
  gameName: 'FreeCell',
  objective:
    'Move all 52 cards to the four foundation piles, building from Ace to King in each suit.',

  rules: [
    '**Tableau:** 8 columns of cards. All cards are face-up from the start.',
    '**Free Cells:** 4 empty cells that can each hold one card temporarily.',
    '**Foundations:** 4 piles (one per suit) built from Ace to King.',
    '**All cards visible:** Unlike other solitaire games, you can see all cards from the beginning.',
  ],

  validMoves: [
    '**Tableau to Tableau:** Stack cards in descending order (K, Q, J, 10...) with alternating colors (red/black).',
    '**Tableau to Foundation:** Move cards to foundations in ascending order (A, 2, 3...) of the same suit.',
    '**Any card to Free Cell:** Move any single card to an empty free cell.',
    '**Free Cell to Tableau/Foundation:** Move cards from free cells following normal stacking rules.',
    '**Moving sequences:** You can move multiple cards at once. Maximum sequence size = (empty free cells + 1) × 2^(empty columns).',
    '**Empty columns:** Any card or valid sequence can be placed on an empty tableau column.',
  ],

  tips: [
    'Try to keep free cells available - they give you flexibility for complex moves.',
    'Empty tableau columns are very valuable - use them strategically.',
    'Plan ahead! Look for sequences you can build to free up cards.',
    'Move Aces to foundations early to create more tableau space.',
    "Don't fill all free cells at once - you'll limit your move options.",
    'Almost all FreeCell deals are solvable with the right strategy!',
  ],

  keyboardShortcuts: [
    { key: 'U', action: 'Undo last move' },
    { key: 'Ctrl+Z', action: 'Undo last move' },
    { key: 'R', action: 'Redo move' },
    { key: 'Ctrl+Y', action: 'Redo move' },
    { key: 'Esc', action: 'Close modals' },
  ],
};
