import { describe, it, expect } from 'vitest';
import type { Card } from '../../types/Card';
import {
  isRed,
  isBlack,
  hasAlternatingColors,
  hasSameSuit,
  canStackDescending,
  canStackOnFoundation,
  isValidSequence,
  isValidTableauSequence,
} from '../solitaireRules';

// Test helper: create a card
function card(rank: number, suit: '♠' | '♥' | '♦' | '♣'): Card {
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;
  const value = values[rank - 1];
  return {
    suit,
    value,
    rank,
    id: `${value}${suit}`,
  };
}

describe('isRed', () => {
  it('should return true for hearts', () => {
    expect(isRed(card(7, '♥'))).toBe(true);
  });

  it('should return true for diamonds', () => {
    expect(isRed(card(7, '♦'))).toBe(true);
  });

  it('should return false for spades', () => {
    expect(isRed(card(7, '♠'))).toBe(false);
  });

  it('should return false for clubs', () => {
    expect(isRed(card(7, '♣'))).toBe(false);
  });
});

describe('isBlack', () => {
  it('should return true for spades', () => {
    expect(isBlack(card(7, '♠'))).toBe(true);
  });

  it('should return true for clubs', () => {
    expect(isBlack(card(7, '♣'))).toBe(true);
  });

  it('should return false for hearts', () => {
    expect(isBlack(card(7, '♥'))).toBe(false);
  });

  it('should return false for diamonds', () => {
    expect(isBlack(card(7, '♦'))).toBe(false);
  });
});

describe('hasAlternatingColors', () => {
  it('should return true for red on black', () => {
    const redCard = card(7, '♥');
    const blackCard = card(8, '♠');
    expect(hasAlternatingColors(redCard, blackCard)).toBe(true);
  });

  it('should return true for black on red', () => {
    const blackCard = card(5, '♣');
    const redCard = card(6, '♦');
    expect(hasAlternatingColors(blackCard, redCard)).toBe(true);
  });

  it('should return false for red on red', () => {
    const red1 = card(7, '♥');
    const red2 = card(8, '♦');
    expect(hasAlternatingColors(red1, red2)).toBe(false);
  });

  it('should return false for black on black', () => {
    const black1 = card(5, '♠');
    const black2 = card(6, '♣');
    expect(hasAlternatingColors(black1, black2)).toBe(false);
  });
});

describe('hasSameSuit', () => {
  it('should return true for same suit', () => {
    const card1 = card(5, '♥');
    const card2 = card(8, '♥');
    expect(hasSameSuit(card1, card2)).toBe(true);
  });

  it('should return false for different suit', () => {
    const card1 = card(5, '♥');
    const card2 = card(8, '♠');
    expect(hasSameSuit(card1, card2)).toBe(false);
  });

  it('should work for all four suits', () => {
    expect(hasSameSuit(card(1, '♠'), card(2, '♠'))).toBe(true);
    expect(hasSameSuit(card(1, '♥'), card(2, '♥'))).toBe(true);
    expect(hasSameSuit(card(1, '♦'), card(2, '♦'))).toBe(true);
    expect(hasSameSuit(card(1, '♣'), card(2, '♣'))).toBe(true);
  });
});

describe('canStackDescending', () => {
  describe('with default options (alternating colors, allow empty)', () => {
    it('should allow valid descending stack (red on black)', () => {
      const redSeven = card(7, '♥');
      const blackEight = card(8, '♠');
      expect(canStackDescending(redSeven, blackEight)).toBe(true);
    });

    it('should allow valid descending stack (black on red)', () => {
      const blackFive = card(5, '♣');
      const redSix = card(6, '♦');
      expect(canStackDescending(blackFive, redSix)).toBe(true);
    });

    it('should reject same color', () => {
      const red1 = card(7, '♥');
      const red2 = card(8, '♦');
      expect(canStackDescending(red1, red2)).toBe(false);
    });

    it('should reject wrong rank (off by 2)', () => {
      const redFive = card(5, '♥');
      const blackEight = card(8, '♠');
      expect(canStackDescending(redFive, blackEight)).toBe(false);
    });

    it('should reject ascending rank', () => {
      const redNine = card(9, '♥');
      const blackEight = card(8, '♠');
      expect(canStackDescending(redNine, blackEight)).toBe(false);
    });

    it('should handle edge case: Ace on 2', () => {
      const ace = card(1, '♥');
      const two = card(2, '♠');
      expect(canStackDescending(ace, two)).toBe(true);
    });

    it('should allow null target with allowEmpty=true (default)', () => {
      const anyCard = card(7, '♥');
      expect(canStackDescending(anyCard, null)).toBe(true);
    });

    it('should reject null target with allowEmpty=false', () => {
      const anyCard = card(7, '♥');
      expect(canStackDescending(anyCard, null, { allowEmpty: false })).toBe(false);
    });
  });

  describe('with requireAlternatingColors=false', () => {
    it('should allow same color when option disabled', () => {
      const red1 = card(7, '♥');
      const red2 = card(8, '♦');
      expect(canStackDescending(red1, red2, { requireAlternatingColors: false })).toBe(true);
    });

    it('should still check rank when color check disabled', () => {
      const card1 = card(5, '♥');
      const card2 = card(8, '♦');
      expect(canStackDescending(card1, card2, { requireAlternatingColors: false })).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle King → Queen correctly', () => {
      const queen = card(12, '♥');
      const king = card(13, '♠');
      expect(canStackDescending(queen, king)).toBe(true);
    });

    it('should reject 2 → Ace (not valid descending)', () => {
      const two = card(2, '♥');
      const ace = card(1, '♠');
      expect(canStackDescending(two, ace)).toBe(false);
    });
  });
});

describe('canStackOnFoundation', () => {
  describe('empty foundation', () => {
    it('should allow Ace on empty foundation', () => {
      const ace = card(1, '♠');
      expect(canStackOnFoundation(ace, [])).toBe(true);
    });

    it('should reject non-Ace on empty foundation', () => {
      const two = card(2, '♠');
      expect(canStackOnFoundation(two, [])).toBe(false);
    });

    it('should reject King on empty foundation', () => {
      const king = card(13, '♠');
      expect(canStackOnFoundation(king, [])).toBe(false);
    });
  });

  describe('non-empty foundation', () => {
    it('should allow valid ascending (2 on Ace)', () => {
      const ace = card(1, '♠');
      const two = card(2, '♠');
      expect(canStackOnFoundation(two, [ace])).toBe(true);
    });

    it('should allow valid ascending (3 on 2)', () => {
      const ace = card(1, '♥');
      const two = card(2, '♥');
      const three = card(3, '♥');
      expect(canStackOnFoundation(three, [ace, two])).toBe(true);
    });

    it('should reject wrong suit', () => {
      const ace = card(1, '♠');
      const two = card(2, '♥'); // Different suit
      expect(canStackOnFoundation(two, [ace])).toBe(false);
    });

    it('should reject wrong rank (skipping a card)', () => {
      const ace = card(1, '♠');
      const three = card(3, '♠'); // Skipped 2
      expect(canStackOnFoundation(three, [ace])).toBe(false);
    });

    it('should reject descending rank', () => {
      const three = card(3, '♠');
      const two = card(2, '♠');
      expect(canStackOnFoundation(two, [three])).toBe(false);
    });

    it('should allow King on Queen (completion)', () => {
      const queen = card(12, '♥');
      const king = card(13, '♥');
      expect(canStackOnFoundation(king, [queen])).toBe(true);
    });
  });

  describe('with requireSameSuit=false (for Spider)', () => {
    it('should allow different suit when option disabled', () => {
      const ace = card(1, '♠');
      const two = card(2, '♥'); // Different suit
      expect(canStackOnFoundation(two, [ace], { requireSameSuit: false })).toBe(true);
    });

    it('should still check rank when suit check disabled', () => {
      const ace = card(1, '♠');
      const three = card(3, '♥'); // Wrong rank
      expect(canStackOnFoundation(three, [ace], { requireSameSuit: false })).toBe(false);
    });
  });
});

describe('isValidSequence', () => {
  const descendingValidator = (card: Card, target: Card) =>
    card.rank === target.rank - 1 && hasAlternatingColors(card, target);

  it('should return true for empty array', () => {
    expect(isValidSequence([], descendingValidator)).toBe(true);
  });

  it('should return true for single card', () => {
    const singleCard = card(5, '♥');
    expect(isValidSequence([singleCard], descendingValidator)).toBe(true);
  });

  it('should return true for valid 2-card sequence', () => {
    const cards = [card(8, '♠'), card(7, '♥')];
    expect(isValidSequence(cards, descendingValidator)).toBe(true);
  });

  it('should return true for valid 5-card sequence', () => {
    const cards = [
      card(10, '♠'),
      card(9, '♥'),
      card(8, '♣'),
      card(7, '♦'),
      card(6, '♠'),
    ];
    expect(isValidSequence(cards, descendingValidator)).toBe(true);
  });

  it('should return false for invalid sequence (break in middle)', () => {
    const cards = [
      card(10, '♠'),
      card(9, '♥'),
      card(7, '♣'), // Should be 8
      card(6, '♦'),
    ];
    expect(isValidSequence(cards, descendingValidator)).toBe(false);
  });

  it('should return false for invalid sequence (break at start)', () => {
    const cards = [
      card(10, '♠'),
      card(8, '♥'), // Should be 9
      card(7, '♣'),
    ];
    expect(isValidSequence(cards, descendingValidator)).toBe(false);
  });
});

describe('isValidTableauSequence', () => {
  it('should validate FreeCell-style sequence (descending, alternating)', () => {
    const cards = [
      card(8, '♠'),
      card(7, '♥'),
      card(6, '♣'),
      card(5, '♦'),
    ];
    expect(isValidTableauSequence(cards)).toBe(true);
  });

  it('should validate Klondike-style sequence (descending, alternating)', () => {
    const cards = [
      card(10, '♦'),
      card(9, '♠'),
      card(8, '♥'),
    ];
    expect(isValidTableauSequence(cards)).toBe(true);
  });

  it('should reject invalid color break', () => {
    const cards = [
      card(8, '♠'),
      card(7, '♣'), // Same color
      card(6, '♥'),
    ];
    expect(isValidTableauSequence(cards)).toBe(false);
  });

  it('should reject invalid rank break', () => {
    const cards = [
      card(8, '♠'),
      card(6, '♥'), // Skipped 7
      card(5, '♣'),
    ];
    expect(isValidTableauSequence(cards)).toBe(false);
  });

  it('should return true for single card', () => {
    expect(isValidTableauSequence([card(5, '♥')])).toBe(true);
  });

  it('should return true for empty array', () => {
    expect(isValidTableauSequence([])).toBe(true);
  });
});
