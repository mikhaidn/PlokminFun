import { describe, it, expect } from 'vitest';
import {
  encodeMessage,
  decodeMessage,
  bytesToBase64,
  base64ToBytes,
  newPeerId,
  type Message,
} from '../protocol';

describe('message frames', () => {
  const frames: Message[] = [
    { type: 'hello', id: 'a1', name: 'Ada' },
    { type: 'welcome', hostId: 'h0', peers: [{ id: 'h0', name: 'Host' }] },
    { type: 'presence', peers: [] },
    { type: 'update', data: 'AAEC' },
  ];

  it.each(frames)('round-trips %o', (frame) => {
    expect(decodeMessage(encodeMessage(frame))).toEqual(frame);
  });

  it('rejects malformed frames without throwing', () => {
    expect(decodeMessage('{')).toBeNull();
    expect(decodeMessage('null')).toBeNull();
    expect(decodeMessage('"str"')).toBeNull();
    expect(decodeMessage(JSON.stringify({ type: 'nope' }))).toBeNull();
    expect(decodeMessage(JSON.stringify({ type: 'hello', id: 1 }))).toBeNull();
    expect(
      decodeMessage(JSON.stringify({ type: 'welcome', hostId: 'h', peers: [{ id: 1 }] }))
    ).toBeNull();
    expect(decodeMessage(JSON.stringify({ type: 'presence', peers: 'x' }))).toBeNull();
    expect(decodeMessage(JSON.stringify({ type: 'update' }))).toBeNull();
  });
});

describe('binary encoding', () => {
  it('round-trips bytes including 0 and 255', () => {
    const bytes = Uint8Array.from([0, 1, 127, 128, 254, 255]);
    expect(base64ToBytes(bytesToBase64(bytes))).toEqual(bytes);
  });

  it('returns null for invalid base64', () => {
    expect(base64ToBytes('***')).toBeNull();
  });
});

describe('newPeerId', () => {
  it('generates distinct, non-empty ids', () => {
    const ids = new Set(Array.from({ length: 50 }, newPeerId));
    expect(ids.size).toBe(50);
    for (const id of ids) expect(id.length).toBeGreaterThan(0);
  });
});
