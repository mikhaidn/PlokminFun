import { describe, test, expect } from 'vitest';
import { createDeck, shuffleWithSeed } from '../deck';
import { SUITS, VALUES } from '../types';

describe('createDeck', () => {
  test('creates 52 cards', () => {
    const deck = createDeck();
    expect(deck).toHaveLength(52);
  });

  test('has 13 ranks of each suit', () => {
    const deck = createDeck();

    SUITS.forEach(suit => {
      const suitCards = deck.filter(c => c.suit === suit);
      expect(suitCards).toHaveLength(13);
    });
  });

  test('has 4 cards of each value', () => {
    const deck = createDeck();

    VALUES.forEach(value => {
      const valueCards = deck.filter(c => c.value === value);
      expect(valueCards).toHaveLength(4);
    });
  });

  test('each card has unique id', () => {
    const deck = createDeck();
    const ids = deck.map(c => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(52);
  });

  test('cards have correct rank values', () => {
    const deck = createDeck();
    const ace = deck.find(c => c.value === 'A');
    const king = deck.find(c => c.value === 'K');
    const five = deck.find(c => c.value === '5');

    expect(ace?.rank).toBe(1);
    expect(king?.rank).toBe(13);
    expect(five?.rank).toBe(5);
  });

  test('card IDs follow format "VALUE+SUIT"', () => {
    const deck = createDeck();
    const aceOfSpades = deck.find(c => c.value === 'A' && c.suit === '♠');
    const kingOfHearts = deck.find(c => c.value === 'K' && c.suit === '♥');

    expect(aceOfSpades?.id).toBe('A♠');
    expect(kingOfHearts?.id).toBe('K♥');
  });
});

describe('shuffleWithSeed', () => {
  test('shuffles deck deterministically', () => {
    const deck = createDeck();
    const shuffled1 = shuffleWithSeed(deck, 12345);
    const shuffled2 = shuffleWithSeed(deck, 12345);

    expect(shuffled1).toEqual(shuffled2);
  });

  test('different seeds produce different shuffles', () => {
    const deck = createDeck();
    const shuffled1 = shuffleWithSeed(deck, 11111);
    const shuffled2 = shuffleWithSeed(deck, 99999);

    expect(shuffled1).not.toEqual(shuffled2);
  });

  test('does not modify original deck', () => {
    const deck = createDeck();
    const original = [...deck];
    shuffleWithSeed(deck, 12345);

    expect(deck).toEqual(original);
  });

  test('shuffled deck contains all original cards', () => {
    const deck = createDeck();
    const shuffled = shuffleWithSeed(deck, 777);

    expect(shuffled).toHaveLength(deck.length);

    // Check all cards are present
    deck.forEach(card => {
      const found = shuffled.find(c => c.id === card.id);
      expect(found).toBeDefined();
    });
  });

  test('shuffle actually changes card order', () => {
    const deck = createDeck();
    const shuffled = shuffleWithSeed(deck, 42);

    // Very unlikely to be in same order after shuffle
    const sameOrder = deck.every((card, i) => card.id === shuffled[i].id);
    expect(sameOrder).toBe(false);
  });

  test('same seed produces same shuffle across multiple decks', () => {
    const deck1 = createDeck();
    const deck2 = createDeck();

    const shuffled1 = shuffleWithSeed(deck1, 555);
    const shuffled2 = shuffleWithSeed(deck2, 555);

    expect(shuffled1.map(c => c.id)).toEqual(shuffled2.map(c => c.id));
  });
});
