/**
 * Klondike Help Content
 * Rules, valid moves, tips, and keyboard shortcuts
 */

import type { HelpContent } from '@plokmin/shared';

export const klondikeHelpContent: HelpContent = {
  gameName: 'Klondike',
  objective:
    'Move all 52 cards to the four foundation piles, building from Ace to King in each suit.',

  rules: [
    '**Tableau:** 7 columns with varying numbers of cards. Only the top card of each column starts face-up.',
    '**Stock:** Draw pile from which you can draw cards (Draw-1 or Draw-3 mode).',
    '**Waste:** Discard pile where drawn cards are placed.',
    '**Foundations:** 4 piles (one per suit) built from Ace to King.',
    '**Recycling:** When the stock is empty, you can recycle the waste pile back to the stock (unlimited).',
  ],

  validMoves: [
    '**Tableau to Tableau:** Stack cards in descending order (K, Q, J, 10...) with alternating colors (red/black).',
    '**Tableau to Foundation:** Move cards to foundations in ascending order (A, 2, 3...) of the same suit.',
    '**Waste to Tableau/Foundation:** Move the top card from waste following normal stacking rules.',
    '**Moving sequences:** You can move entire sequences of properly stacked cards together.',
    '**Empty columns:** Only Kings (or sequences starting with a King) can be placed on empty tableau columns.',
    '**Revealing cards:** When you move a face-up card from a tableau pile, the card beneath it flips face-up.',
  ],

  tips: [
    'Prioritize revealing face-down cards - they might contain cards you need.',
    'Keep at least one empty tableau column available when possible - it gives you more options.',
    'Move Aces and low cards to foundations early to free up tableau space.',
    "Don't rush to move all cards to foundations - sometimes you need them for building sequences.",
    'In Draw-3 mode, try to uncover buried cards by using cards that appear above them.',
    'Strategic use of the waste pile recycling can help you access cards in different orders.',
  ],

  keyboardShortcuts: [
    { key: 'U', action: 'Undo last move' },
    { key: 'Ctrl+Z', action: 'Undo last move' },
    { key: 'R', action: 'Redo move' },
    { key: 'Ctrl+Y', action: 'Redo move' },
    { key: 'Esc', action: 'Close modals' },
  ],
};
