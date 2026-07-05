import { describe, it, expect } from 'vitest';
import { runCode, formatValue } from '../repl';

describe('runCode', () => {
  it('echoes the value of a final expression', () => {
    const result = runCode('2 + 2');
    expect(result.hasValue).toBe(true);
    expect(result.value).toBe('4');
    expect(result.error).toBeNull();
  });

  it('captures console.log output in order', () => {
    const result = runCode(`console.log('a'); console.log('b');`);
    expect(result.logs.map((l) => l.text)).toEqual(['a', 'b']);
  });

  it('joins multiple console arguments with spaces', () => {
    const result = runCode(`console.log('x =', 42, true)`);
    expect(result.logs[0]).toEqual({ level: 'log', text: 'x = 42 true' });
  });

  it('records console level (warn/error/info)', () => {
    const result = runCode(`console.warn('w'); console.error('e'); console.info('i');`);
    expect(result.logs).toEqual([
      { level: 'warn', text: 'w' },
      { level: 'error', text: 'e' },
      { level: 'info', text: 'i' },
    ]);
  });

  it('runs statement blocks and reports no echoed value', () => {
    const result = runCode(
      `let total = 0;\nfor (let i = 1; i <= 3; i++) total += i;\nconsole.log(total);`
    );
    expect(result.hasValue).toBe(false);
    expect(result.logs[0].text).toBe('6');
    expect(result.error).toBeNull();
  });

  it('echoes the final expression even after preceding statements', () => {
    const result = runCode(`console.log('side effect');\n2 ** 10;`);
    expect(result.logs[0].text).toBe('side effect');
    expect(result.hasValue).toBe(true);
    expect(result.value).toBe('1024');
  });

  it('runs a console.log-only snippet exactly once', () => {
    const result = runCode(`console.log('once')`);
    expect(result.logs).toEqual([{ level: 'log', text: 'once' }]);
    expect(result.hasValue).toBe(false);
  });

  it('treats an object literal as an expression, not a block', () => {
    const result = runCode('{ a: 1, b: 2 }');
    expect(result.value).toBe('{ a: 1, b: 2 }');
  });

  it('reports runtime errors without throwing', () => {
    const result = runCode('notDefined()');
    expect(result.error).toMatch(/ReferenceError/);
    expect(result.hasValue).toBe(false);
  });

  it('reports syntax errors without throwing', () => {
    const result = runCode('function (');
    expect(result.error).toMatch(/SyntaxError/);
  });

  it('captures logs even when the code later throws', () => {
    const result = runCode(`console.log('before'); throw new Error('boom');`);
    expect(result.logs[0].text).toBe('before');
    expect(result.error).toBe('Error: boom');
  });

  it('returns cleanly for empty input', () => {
    const result = runCode('   \n  ');
    expect(result).toEqual({ logs: [], value: null, hasValue: false, error: null });
  });

  it('does not echo a final expression that evaluates to undefined', () => {
    const result = runCode('void 0');
    expect(result.hasValue).toBe(false);
    expect(result.value).toBeNull();
  });
});

describe('formatValue', () => {
  it('formats primitives', () => {
    expect(formatValue(1)).toBe('1');
    expect(formatValue(true)).toBe('true');
    expect(formatValue(null)).toBe('null');
    expect(formatValue(undefined)).toBe('undefined');
    expect(formatValue(10n)).toBe('10n');
  });

  it('renders top-level strings bare but nested strings quoted', () => {
    expect(formatValue('hi')).toBe('hi');
    expect(formatValue(['hi'])).toBe('["hi"]');
  });

  it('formats arrays and nested objects', () => {
    expect(formatValue([1, 2, 3])).toBe('[1, 2, 3]');
    expect(formatValue({ a: 1, b: [2, 3] })).toBe('{ a: 1, b: [2, 3] }');
  });

  it('formats Map and Set', () => {
    expect(formatValue(new Map([['k', 1]]))).toBe('Map(1) { "k" => 1 }');
    expect(formatValue(new Set([1, 2]))).toBe('Set(2) { 1, 2 }');
  });

  it('formats functions and errors', () => {
    expect(formatValue(function named() {})).toBe('[Function: named]');
    expect(formatValue(new TypeError('nope'))).toBe('TypeError: nope');
  });

  it('handles circular references safely', () => {
    const obj: Record<string, unknown> = { name: 'x' };
    obj.self = obj;
    expect(formatValue(obj)).toBe('{ name: "x", self: [Circular] }');
  });
});
