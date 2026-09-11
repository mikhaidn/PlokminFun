import { describe, it, expect } from 'vitest';
import { encodeSignal, decodeSignal, inviteUrl, parseInviteHash } from '../signaling';

const SDP =
  'v=0\r\no=- 123 2 IN IP4 127.0.0.1\r\ns=-\r\na=candidate:1 1 udp 2 192.168.0.2 5000 typ host\r\n';

describe('signal codes', () => {
  it('round-trips an offer', () => {
    expect(decodeSignal(encodeSignal({ kind: 'offer', sdp: SDP }))).toEqual({
      kind: 'offer',
      sdp: SDP,
    });
  });

  it('round-trips an answer with unicode', () => {
    const sdp = `${SDP}a=extmap:café ⚡\r\n`;
    expect(decodeSignal(encodeSignal({ kind: 'answer', sdp }))).toEqual({ kind: 'answer', sdp });
  });

  it('produces URL-safe codes', () => {
    expect(encodeSignal({ kind: 'offer', sdp: SDP.repeat(20) })).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('ignores whitespace and line breaks pasted around a code', () => {
    const code = encodeSignal({ kind: 'answer', sdp: SDP });
    const wrapped = `  ${code.slice(0, 10)}\n${code.slice(10)} \n`;
    expect(decodeSignal(wrapped)).toEqual({ kind: 'answer', sdp: SDP });
  });

  it('rejects garbage, wrong kinds and empty sdp', () => {
    expect(decodeSignal('not*base64!!')).toBeNull();
    expect(decodeSignal(btoa('"just a string"'))).toBeNull();
    expect(decodeSignal(btoa(JSON.stringify({ kind: 'bogus', sdp: SDP })))).toBeNull();
    expect(decodeSignal(btoa(JSON.stringify({ kind: 'offer', sdp: '' })))).toBeNull();
    expect(decodeSignal(btoa('{oops'))).toBeNull();
  });
});

describe('invite URLs', () => {
  const base = { origin: 'https://example.test', pathname: '/PlokminFun/peer-doc/' };

  it('builds a hash link on the current page', () => {
    expect(inviteUrl('abc-_1', base)).toBe('https://example.test/PlokminFun/peer-doc/#join=abc-_1');
  });

  it('parses the offer code back out of the hash', () => {
    const url = new URL(inviteUrl('abc-_1', base));
    expect(parseInviteHash(url.hash)).toBe('abc-_1');
  });

  it('returns null for non-invite hashes', () => {
    expect(parseInviteHash('')).toBeNull();
    expect(parseInviteHash('#other=1')).toBeNull();
    expect(parseInviteHash('#join=has space')).toBeNull();
  });
});
