import { describe, it, expect } from 'vitest';
import { filenameFor } from '../download';

describe('filenameFor', () => {
  it('slugifies the title', () => {
    expect(filenameFor('Meeting Notes: Q3 / Plans!')).toBe('meeting-notes-q3-plans.txt');
  });

  it('falls back for empty or symbol-only titles', () => {
    expect(filenameFor('')).toBe('document.txt');
    expect(filenameFor('   ')).toBe('document.txt');
    expect(filenameFor('***')).toBe('document.txt');
  });

  it('caps very long titles', () => {
    expect(filenameFor('a'.repeat(200)).length).toBe(64);
  });
});
