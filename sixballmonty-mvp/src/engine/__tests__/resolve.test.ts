import { describe, expect, it } from 'vitest';
import { applyColumnGravity, findPops, hasFloatingBalls, removeCells } from '../resolve';
import { makeGrid, testConfig } from './helpers';

const config = testConfig();

describe('findPops', () => {
  it('pops a 2x2 square of one color', () => {
    const grid = makeGrid(config, ['......', '......', '......', '......', 'RR....', 'RR....']);
    const { groups } = findPops(grid, config);
    expect(groups).toHaveLength(1);
    expect(groups[0]).toHaveLength(4);
  });

  it('pops an L-shaped group of four', () => {
    const grid = makeGrid(config, ['......', '......', '......', 'G.....', 'G.....', 'GG....']);
    expect(findPops(grid, config).groups).toHaveLength(1);
  });

  it('does not pop groups smaller than matchSize', () => {
    const grid = makeGrid(config, ['......', '......', '......', '......', 'B.....', 'BB....']);
    expect(findPops(grid, config).groups).toHaveLength(0);
  });

  it('finds multiple simultaneous groups', () => {
    const grid = makeGrid(config, ['......', '......', 'RR..GG', 'RR..GG', '......', '......']);
    // Rebuild with support so it's a realistic settled grid
    const settled = makeGrid(config, ['......', '......', '......', '......', 'RR..GG', 'RR..GG']);
    expect(findPops(grid, config).groups).toHaveLength(2);
    expect(findPops(settled, config).groups).toHaveLength(2);
  });

  it('counts oversized groups as one group', () => {
    const grid = makeGrid(config, ['......', '......', '......', '......', '.Y....', 'YYYY..']);
    const { groups } = findPops(grid, config);
    expect(groups).toHaveLength(1);
    expect(groups[0]).toHaveLength(5);
  });

  it('ignores balls in hidden rows', () => {
    // Vertical run of 4 but the top ball sits in the hidden spawn row:
    // only 3 visible cells -> no pop.
    const grid = makeGrid(
      config,
      ['R.....', 'R.....', 'R.....', '......', '......', '......'],
      ['R.....']
    );
    expect(findPops(grid, config).groups).toHaveLength(0);
  });

  it('collects garbage adjacent to a popping group, once, and leaves distant garbage', () => {
    const grid = makeGrid(config, ['......', '......', '......', 'X.....', 'RX...X', 'RRR...']);
    // R group: (4,0),(5,0),(5,1),(5,2)... build: rows visible 4/5 are grid rows 5/6
    const pops = findPops(grid, config);
    expect(pops.groups).toHaveLength(1);
    // Garbage at visible row 3 col 0 (above R) and row 4 col 1 (right of R) are adjacent;
    // garbage at row 4 col 5 is not.
    expect(pops.garbage).toHaveLength(2);
  });
});

describe('applyColumnGravity', () => {
  it('drops floating balls and preserves vertical order', () => {
    const grid = makeGrid(config, ['B.....', '......', 'G.....', '......', '......', '......']);
    const { grid: settled, moved } = applyColumnGravity(grid);
    expect(moved).toBe(true);
    expect(settled[6][0]).toBe(1); // G lands on the floor
    expect(settled[5][0]).toBe(2); // B stacks above it
    expect(hasFloatingBalls(settled)).toBe(false);
  });

  it('reports moved=false for a settled grid', () => {
    const grid = makeGrid(config, ['......', '......', '......', '......', 'R.....', 'RG....']);
    expect(applyColumnGravity(grid).moved).toBe(false);
  });

  it('garbage falls like any other ball', () => {
    const grid = makeGrid(config, ['X.....', '......', '......', '......', '......', '......']);
    const { grid: settled } = applyColumnGravity(grid);
    expect(settled[6][0]).toBe(-1);
  });
});

describe('removeCells', () => {
  it('empties exactly the given cells without mutating the input', () => {
    const grid = makeGrid(config, ['......', '......', '......', '......', '......', 'RG....']);
    const removed = removeCells(grid, [[6, 0]]);
    expect(removed[6][0]).toBeNull();
    expect(removed[6][1]).toBe(1);
    expect(grid[6][0]).toBe(0);
  });
});
