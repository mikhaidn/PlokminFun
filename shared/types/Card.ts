/**
 * Card types shared across all solitaire games
 */

export type Suit = '♠' | '♥' | '♦' | '♣';
export type Value = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  value: Value;
  rank: number; // 1-13 (A=1, K=13)
  id: string;   // e.g., "A♠", "K♥"
}

export const SUITS = ['♠', '♥', '♦', '♣'] as const;
export const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;
