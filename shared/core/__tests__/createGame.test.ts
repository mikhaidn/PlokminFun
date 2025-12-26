/**
 * Tests for createGame factory
 *
 * RFC-005 Phase 2 Week 3
 */

import { describe, it, expect } from 'vitest';
import {
  createGame,
  defineGameConfig,
  createGameRegistry,
  supportsFeature,
} from '../createGame';
import type { GameConfig, GameActions } from '../../types/GameConfig';
import type { GameLocation } from '../../types/GameLocation';

// Mock game state for testing
interface MockGameState {
  value: number;
  won: boolean;
}

// Mock game actions
class MockGameActions implements GameActions<MockGameState> {
  validateMove(): boolean {
    return true;
  }

  executeMove(state: MockGameState): MockGameState | null {
    return { ...state, value: state.value + 1 };
  }

  getCardAt(): null {
    return null;
  }

  isCardFaceUp(): boolean {
    return true;
  }

  initializeGame(seed: number): MockGameState {
    return { value: seed, won: false };
  }

  isGameWon(state: MockGameState): boolean {
    return state.won;
  }

  getValidMoves(): GameLocation[] {
    return [{ type: 'foundation', index: 0 }];
  }

  getHint(): { from: GameLocation; to: GameLocation } | null {
    return {
      from: { type: 'tableau', index: 0 },
      to: { type: 'foundation', index: 0 },
    };
  }

  getAutoMoves(): Array<{ from: GameLocation; to: GameLocation }> {
    return [
      {
        from: { type: 'tableau', index: 0 },
        to: { type: 'foundation', index: 0 },
      },
    ];
  }
}

// Create a mock config
function createMockConfig(): GameConfig<MockGameState> {
  return {
    metadata: {
      id: 'mock',
      name: 'Mock Game',
      description: 'A mock game for testing',
      difficulty: 'easy',
      version: '1.0.0',
    },
    layout: {
      numTableauColumns: 7,
      numFoundations: 4,
      specialAreas: [],
    },
    rules: {
      tableauStackRule: 'alternatingColors',
      emptyTableauRule: 'kingOnly',
      foundationRule: 'sameSuit',
      tableauDirection: 'descending',
      foundationDirection: 'ascending',
    },
    cardDisplay: {
      cardBackTheme: 'blue',
    },
    actions: new MockGameActions(),
  };
}

describe('createGame', () => {
  it('should create a game instance from config', () => {
    const config = createMockConfig();
    const game = createGame(config);

    expect(game).toBeDefined();
    expect(game.metadata).toEqual(config.metadata);
    expect(game.config).toEqual(config);
  });

  it('should throw error if config is missing metadata', () => {
    const invalidConfig = {
      layout: {},
      rules: {},
      actions: {},
    } as any;

    expect(() => createGame(invalidConfig)).toThrow('must include metadata');
  });

  it('should throw error if config is missing actions', () => {
    const invalidConfig = {
      metadata: {},
      layout: {},
      rules: {},
    } as any;

    expect(() => createGame(invalidConfig)).toThrow('must include actions');
  });

  it('should delegate initializeGame to actions', () => {
    const config = createMockConfig();
    const game = createGame(config);
    const state = game.initializeGame(12345);

    expect(state.value).toBe(12345);
  });

  it('should delegate validateMove to actions', () => {
    const config = createMockConfig();
    const game = createGame(config);
    const state: MockGameState = { value: 1, won: false };
    const from: GameLocation = { type: 'tableau', index: 0 };
    const to: GameLocation = { type: 'foundation', index: 0 };

    const result = game.validateMove(state, from, to);

    expect(result).toBe(true);
  });

  it('should delegate executeMove to actions', () => {
    const config = createMockConfig();
    const game = createGame(config);
    const state: MockGameState = { value: 1, won: false };
    const from: GameLocation = { type: 'tableau', index: 0 };
    const to: GameLocation = { type: 'foundation', index: 0 };

    const newState = game.executeMove(state, from, to);

    expect(newState).toBeDefined();
    expect(newState!.value).toBe(2);
  });

  it('should delegate isGameWon to actions', () => {
    const config = createMockConfig();
    const game = createGame(config);
    const state: MockGameState = { value: 1, won: true };

    const result = game.isGameWon(state);

    expect(result).toBe(true);
  });

  it('should include optional getValidMoves if available', () => {
    const config = createMockConfig();
    const game = createGame(config);

    expect(game.getValidMoves).toBeDefined();

    const state: MockGameState = { value: 1, won: false };
    const from: GameLocation = { type: 'tableau', index: 0 };
    const moves = game.getValidMoves!(state, from);

    expect(moves).toHaveLength(1);
  });

  it('should include optional getHint if available', () => {
    const config = createMockConfig();
    const game = createGame(config);

    expect(game.getHint).toBeDefined();

    const state: MockGameState = { value: 1, won: false };
    const hint = game.getHint!(state);

    expect(hint).toBeDefined();
    expect(hint!.from.type).toBe('tableau');
  });

  it('should include optional getAutoMoves if available', () => {
    const config = createMockConfig();
    const game = createGame(config);

    expect(game.getAutoMoves).toBeDefined();

    const state: MockGameState = { value: 1, won: false };
    const autoMoves = game.getAutoMoves!(state);

    expect(autoMoves).toHaveLength(1);
  });

  it('should handle missing optional methods', () => {
    const minimalActions: GameActions<MockGameState> = {
      validateMove: () => true,
      executeMove: (state) => state,
      getCardAt: () => null,
      isCardFaceUp: () => true,
      initializeGame: (seed) => ({ value: seed, won: false }),
      isGameWon: () => false,
    };

    const config: GameConfig<MockGameState> = {
      ...createMockConfig(),
      actions: minimalActions,
    };

    const game = createGame(config);

    expect(game.getValidMoves).toBeUndefined();
    expect(game.getHint).toBeUndefined();
    expect(game.getAutoMoves).toBeUndefined();
  });
});

describe('defineGameConfig', () => {
  it('should return the same config object', () => {
    const config = createMockConfig();
    const definedConfig = defineGameConfig(config);

    expect(definedConfig).toBe(config);
  });

  it('should provide type safety at compile time', () => {
    // This test verifies TypeScript compilation
    const config = defineGameConfig<MockGameState>({
      metadata: {
        id: 'test',
        name: 'Test',
        description: 'Test game',
        version: '1.0.0',
      },
      layout: {
        numTableauColumns: 7,
        numFoundations: 4,
        specialAreas: [],
      },
      rules: {
        tableauStackRule: 'alternatingColors',
        emptyTableauRule: 'kingOnly',
        foundationRule: 'sameSuit',
        tableauDirection: 'descending',
        foundationDirection: 'ascending',
      },
      cardDisplay: {
        cardBackTheme: 'blue',
      },
      actions: new MockGameActions(),
    });

    expect(config).toBeDefined();
  });
});

describe('createGameRegistry', () => {
  it('should create a registry from multiple configs', () => {
    const config1 = createMockConfig();
    config1.metadata.id = 'game1';

    const config2 = createMockConfig();
    config2.metadata.id = 'game2';

    const registry = createGameRegistry([config1, config2]);

    expect(registry.size).toBe(2);
  });

  it('should get game by ID', () => {
    const config = createMockConfig();
    config.metadata.id = 'test-game';

    const registry = createGameRegistry([config]);
    const game = registry.getById('test-game');

    expect(game).toBeDefined();
    expect(game!.metadata.id).toBe('test-game');
  });

  it('should return undefined for unknown ID', () => {
    const registry = createGameRegistry([]);
    const game = registry.getById('nonexistent');

    expect(game).toBeUndefined();
  });

  it('should get all games', () => {
    const config1 = createMockConfig();
    config1.metadata.id = 'game1';

    const config2 = createMockConfig();
    config2.metadata.id = 'game2';

    const registry = createGameRegistry([config1, config2]);
    const allGames = registry.getAll();

    expect(allGames).toHaveLength(2);
  });

  it('should get all metadata', () => {
    const config1 = createMockConfig();
    config1.metadata.id = 'game1';
    config1.metadata.name = 'Game 1';

    const config2 = createMockConfig();
    config2.metadata.id = 'game2';
    config2.metadata.name = 'Game 2';

    const registry = createGameRegistry([config1, config2]);
    const metadata = registry.getAllMetadata();

    expect(metadata).toHaveLength(2);
    expect(metadata[0].name).toBe('Game 1');
    expect(metadata[1].name).toBe('Game 2');
  });

  it('should check if game exists', () => {
    const config = createMockConfig();
    config.metadata.id = 'test-game';

    const registry = createGameRegistry([config]);

    expect(registry.has('test-game')).toBe(true);
    expect(registry.has('nonexistent')).toBe(false);
  });
});

describe('supportsFeature', () => {
  it('should return true for supported features', () => {
    const config = createMockConfig();
    const game = createGame(config);

    expect(supportsFeature(game, 'getValidMoves')).toBe(true);
    expect(supportsFeature(game, 'getHint')).toBe(true);
    expect(supportsFeature(game, 'getAutoMoves')).toBe(true);
  });

  it('should return false for unsupported features', () => {
    const minimalActions: GameActions<MockGameState> = {
      validateMove: () => true,
      executeMove: (state) => state,
      getCardAt: () => null,
      isCardFaceUp: () => true,
      initializeGame: (seed) => ({ value: seed, won: false }),
      isGameWon: () => false,
    };

    const config: GameConfig<MockGameState> = {
      ...createMockConfig(),
      actions: minimalActions,
    };

    const game = createGame(config);

    expect(supportsFeature(game, 'getValidMoves')).toBe(false);
    expect(supportsFeature(game, 'getHint')).toBe(false);
    expect(supportsFeature(game, 'getAutoMoves')).toBe(false);
  });
});
