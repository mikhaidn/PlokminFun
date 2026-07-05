import { describe, it, expect } from 'vitest';
import { encodeCode, decodeCode } from '../share';

describe('share encoding', () => {
  it('round-trips ASCII code', () => {
    const code = `console.log('hello');\nconst x = 1 + 2;`;
    expect(decodeCode(encodeCode(code))).toBe(code);
  });

  it('round-trips unicode and emoji', () => {
    const code = `const s = 'café ⚡ 日本語';`;
    expect(decodeCode(encodeCode(code))).toBe(code);
  });

  it('produces URL-safe output (no +, /, or = padding)', () => {
    const encoded = encodeCode('a'.repeat(50));
    expect(encoded).not.toMatch(/[+/=]/);
  });

  it('returns null for malformed input', () => {
    expect(decodeCode('not*valid*base64!!')).toBeNull();
  });
});
