import { describe, it, expect } from 'vitest';
import * as Y from 'yjs';
import { diffText, mapPosition, bindText, LOCAL_ORIGIN } from '../text-binding';

describe('diffText', () => {
  it('returns null when unchanged', () => {
    expect(diffText('abc', 'abc')).toBeNull();
  });

  it('detects an insertion', () => {
    expect(diffText('hello world', 'hello big world')).toEqual({
      index: 6,
      remove: 0,
      insert: 'big ',
    });
  });

  it('detects a deletion', () => {
    expect(diffText('hello big world', 'hello world')).toEqual({ index: 6, remove: 4, insert: '' });
  });

  it('detects a replacement', () => {
    expect(diffText('cat', 'cut')).toEqual({ index: 1, remove: 1, insert: 'u' });
  });

  it('handles repeated characters without over-matching the suffix', () => {
    // "aa" -> "aaa": the shared prefix consumes both a's, the suffix must not double count.
    expect(diffText('aa', 'aaa')).toEqual({ index: 2, remove: 0, insert: 'a' });
    expect(diffText('aaa', 'aa')).toEqual({ index: 2, remove: 1, insert: '' });
  });

  it('handles empty strings', () => {
    expect(diffText('', 'x')).toEqual({ index: 0, remove: 0, insert: 'x' });
    expect(diffText('x', '')).toEqual({ index: 0, remove: 1, insert: '' });
  });
});

describe('mapPosition', () => {
  it('shifts right for an insert before the caret', () => {
    expect(mapPosition([{ retain: 2 }, { insert: 'abc' }], 5)).toBe(8);
  });

  it('does not move for an insert after the caret', () => {
    expect(mapPosition([{ retain: 7 }, { insert: 'abc' }], 5)).toBe(5);
  });

  it('keeps the caret in place for an insert exactly at the caret', () => {
    expect(mapPosition([{ retain: 5 }, { insert: 'abc' }], 5)).toBe(5);
  });

  it('shifts left for a delete before the caret', () => {
    expect(mapPosition([{ retain: 1 }, { delete: 2 }], 5)).toBe(3);
  });

  it('clamps when the deletion spans the caret', () => {
    expect(mapPosition([{ retain: 3 }, { delete: 10 }], 5)).toBe(3);
  });

  it('ignores changes after the caret', () => {
    expect(mapPosition([{ retain: 9 }, { delete: 2 }, { insert: 'zz' }], 5)).toBe(5);
  });
});

describe('bindText', () => {
  function setup() {
    const doc = new Y.Doc();
    const text = doc.getText('t');
    const el = document.createElement('textarea');
    document.body.append(el);
    const unbind = bindText(text, el);
    return { doc, text, el, unbind };
  }

  it('seeds the element from the CRDT', () => {
    const doc = new Y.Doc();
    doc.getText('t').insert(0, 'seed');
    const el = document.createElement('textarea');
    bindText(doc.getText('t'), el);
    expect(el.value).toBe('seed');
  });

  it('pushes local typing into the CRDT with the local origin', () => {
    const { doc, text, el, unbind } = setup();
    const origins: unknown[] = [];
    doc.on('update', (_u: Uint8Array, origin: unknown) => origins.push(origin));

    el.value = 'hi';
    el.dispatchEvent(new Event('input'));
    el.value = 'hi there';
    el.dispatchEvent(new Event('input'));

    expect(text.toString()).toBe('hi there');
    expect(origins).toEqual([LOCAL_ORIGIN, LOCAL_ORIGIN]);
    unbind();
  });

  it('reflects remote changes and preserves the caret', () => {
    const { text, el, unbind } = setup();
    el.value = 'hello world';
    el.dispatchEvent(new Event('input'));
    el.focus();
    el.setSelectionRange(6, 6); // before "world"

    text.insert(0, '>> '); // remote (no origin)

    expect(el.value).toBe('>> hello world');
    expect(el.selectionStart).toBe(9);
    expect(el.selectionEnd).toBe(9);
    unbind();
  });

  it('stops listening after unbind', () => {
    const { text, el, unbind } = setup();
    unbind();
    el.value = 'x';
    el.dispatchEvent(new Event('input'));
    text.insert(0, 'remote');
    expect(text.toString()).toBe('remote');
    expect(el.value).toBe('x');
  });
});
