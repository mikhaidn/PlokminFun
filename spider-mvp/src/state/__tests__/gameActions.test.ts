import { describe, test, expect } from 'vitest';
import { type CardType as Card, VALUES } from '@plokmin/shared';
import {
  type SpiderGameState,
  type TableauColumn,
  createInitialState,
  NUM_COLUMNS,
} from '../gameState';
import { canDeal, dealFromStock, moveCards, getValidMoves } from '../gameActions';

function card(rank: number, suit: Card['suit'], copy = 0): Card {
  return { rank, suit, value: VALUES[rank - 1], id: `${VALUES[rank - 1]}${suit}#${copy}` };
}

function col(cards: Card[], faceUpCount = cards.length): TableauColumn {
  return { cards, faceUpCount };
}

/** Build a state from the given columns, padding to 10 columns. */
function makeState(columns: TableauColumn[], stock: Card[] = []): SpiderGameState {
  const tableau = [...columns];
  while (tableau.length < NUM_COLUMNS) tableau.push(col([], 0));
  return { tableau, stock, foundations: [], seed: 1, moves: 0, suitCount: 1 };
}

describe('dealFromStock', () => {
  test('deals one face-up card to every column', () => {
    const state = createInitialState(42);
    const before = state.tableau.map((c) => c.cards.length);

    const after = dealFromStock(state);

    expect(after.stock).toHaveLength(state.stock.length - NUM_COLUMNS);
    expect(after.moves).toBe(state.moves + 1);
    after.tableau.forEach((c, i) => {
      expect(c.cards).toHaveLength(before[i] + 1);
      expect(c.faceUpCount).toBe(state.tableau[i].faceUpCount + 1);
    });
  });

  test('refuses to deal while a column is empty', () => {
    const state = createInitialState(42);
    const withEmptyColumn: SpiderGameState = {
      ...state,
      tableau: state.tableau.map((c, i) => (i === 0 ? col([], 0) : c)),
    };
    expect(canDeal(withEmptyColumn)).toBe(false);
    expect(dealFromStock(withEmptyColumn)).toBe(withEmptyColumn);
  });

  test('refuses to deal when the stock is empty', () => {
    const state = makeState([col([card(5, '♠')])], []);
    expect(canDeal(state)).toBe(false);
    expect(dealFromStock(state)).toBe(state);
  });
});

describe('moveCards', () => {
  test('moves a single card onto the next-higher card of any suit', () => {
    const state = makeState([col([card(9, '♠')]), col([card(10, '♥')])]);

    const result = moveCards(state, { type: 'tableau', index: 0 }, { type: 'tableau', index: 1 });

    expect(result).not.toBeNull();
    expect(result!.tableau[0].cards).toHaveLength(0);
    expect(result!.tableau[1].cards.map((c) => c.id)).toEqual(['10♥#0', '9♠#0']);
    expect(result!.moves).toBe(1);
  });

  test('flips the newly exposed card after a move', () => {
    const state = makeState([col([card(4, '♣'), card(9, '♠')], 1), col([card(10, '♥')])]);

    const result = moveCards(state, { type: 'tableau', index: 0 }, { type: 'tableau', index: 1 });

    expect(result).not.toBeNull();
    expect(result!.tableau[0].cards.map((c) => c.id)).toEqual(['4♣#0']);
    expect(result!.tableau[0].faceUpCount).toBe(1); // exposed card flipped face-up
  });

  test('rejects an illegal move', () => {
    const state = makeState([col([card(9, '♠')]), col([card(9, '♥')])]);
    expect(
      moveCards(state, { type: 'tableau', index: 0 }, { type: 'tableau', index: 1 })
    ).toBeNull();
  });

  test('moves a same-suit run together', () => {
    const state = makeState([
      col([card(10, '♠'), card(9, '♠'), card(8, '♠')]),
      col([card(11, '♦')]),
    ]);

    const result = moveCards(
      state,
      { type: 'tableau', index: 0 },
      { type: 'tableau', index: 1 },
      3
    );

    expect(result).not.toBeNull();
    expect(result!.tableau[0].cards).toHaveLength(0);
    expect(result!.tableau[1].cards.map((c) => c.id)).toEqual(['J♦#0', '10♠#0', '9♠#0', '8♠#0']);
  });

  test('allows any card onto an empty column', () => {
    const state = makeState([col([card(7, '♥')]), col([], 0)]);
    const result = moveCards(state, { type: 'tableau', index: 0 }, { type: 'tableau', index: 1 });
    expect(result).not.toBeNull();
    expect(result!.tableau[1].cards.map((c) => c.id)).toEqual(['7♥#0']);
  });

  test('collects a completed King→Ace run to the foundations', () => {
    // Column 0 holds K..2 (12 cards); moving the Ace onto it completes the run.
    const kingToTwo = Array.from({ length: 12 }, (_, i) => card(13 - i, '♠'));
    const state = makeState([col(kingToTwo), col([card(1, '♠')])]);

    const result = moveCards(state, { type: 'tableau', index: 1 }, { type: 'tableau', index: 0 });

    expect(result).not.toBeNull();
    expect(result!.foundations).toHaveLength(1);
    expect(result!.foundations[0]).toHaveLength(13);
    expect(result!.tableau[0].cards).toHaveLength(0); // run removed from the column
  });
});

describe('getValidMoves', () => {
  test('returns the columns a card can legally move to', () => {
    const state = makeState([
      col([card(9, '♠')]), // 0: source
      col([card(10, '♥')]), // 1: valid (9 on 10)
      col([card(10, '♣')]), // 2: valid (9 on 10)
      col([card(9, '♦')]), // 3: invalid (9 on 9)
    ]);

    const moves = getValidMoves(state, { type: 'tableau', index: 0 });

    expect(moves).toContainEqual({ type: 'tableau', index: 1 });
    expect(moves).toContainEqual({ type: 'tableau', index: 2 });
    expect(moves).not.toContainEqual({ type: 'tableau', index: 3 });
    expect(moves).not.toContainEqual({ type: 'tableau', index: 0 }); // never itself
  });
});
