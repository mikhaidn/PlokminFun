/**
 * Wire protocol spoken over the WebRTC data channel.
 *
 * Every frame is a JSON envelope. Document changes are Yjs updates
 * (binary, base64-encoded) — Yjs is a CRDT, so updates are commutative and
 * idempotent, which is what lets the host simply relay them to everyone
 * else without any conflict resolution of its own.
 */

export interface PeerInfo {
  id: string;
  name: string;
}

export type Message =
  /** guest → host, first frame after the channel opens */
  | { type: 'hello'; id: string; name: string }
  /** host → guest, in reply to hello (followed by a full-state update) */
  | { type: 'welcome'; hostId: string; peers: PeerInfo[] }
  /** host → all guests whenever the roster changes */
  | { type: 'presence'; peers: PeerInfo[] }
  /** either direction: a base64 Yjs update */
  | { type: 'update'; data: string };

export function encodeMessage(message: Message): string {
  return JSON.stringify(message);
}

function isPeerList(value: unknown): value is PeerInfo[] {
  return (
    Array.isArray(value) &&
    value.every(
      (p) =>
        typeof p === 'object' &&
        p !== null &&
        typeof (p as PeerInfo).id === 'string' &&
        typeof (p as PeerInfo).name === 'string'
    )
  );
}

/** Parses a frame, returning null for anything malformed (never throws). */
export function decodeMessage(text: string): Message | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null) return null;
  const msg = parsed as Record<string, unknown>;

  switch (msg.type) {
    case 'hello':
      return typeof msg.id === 'string' && typeof msg.name === 'string'
        ? { type: 'hello', id: msg.id, name: msg.name }
        : null;
    case 'welcome':
      return typeof msg.hostId === 'string' && isPeerList(msg.peers)
        ? { type: 'welcome', hostId: msg.hostId, peers: msg.peers }
        : null;
    case 'presence':
      return isPeerList(msg.peers) ? { type: 'presence', peers: msg.peers } : null;
    case 'update':
      return typeof msg.data === 'string' ? { type: 'update', data: msg.data } : null;
    default:
      return null;
  }
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function base64ToBytes(base64: string): Uint8Array | null {
  try {
    return Uint8Array.from(atob(base64), (ch) => ch.charCodeAt(0));
  } catch {
    return null;
  }
}

/** Short random id for a participant (not security sensitive). */
export function newPeerId(): string {
  return Math.random().toString(36).slice(2, 10);
}
