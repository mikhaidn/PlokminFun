/**
 * Manual ("copy/paste") WebRTC signaling.
 *
 * WebRTC needs a side channel to exchange session descriptions before the
 * peer-to-peer link exists. This app is static (GitHub Pages) and has no
 * signaling server, so the descriptions travel as opaque codes that people
 * send each other over whatever channel they already have (chat, email…).
 *
 * - The host's offer is packed into an invite URL (`#join=<code>`).
 * - The guest's answer is a "reply code" pasted back into the host's page.
 *
 * Codes are base64url over UTF-8 JSON so any SDP survives the round trip.
 */

export type SignalKind = 'offer' | 'answer';

export interface Signal {
  kind: SignalKind;
  sdp: string;
}

const JOIN_PARAM = 'join';

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(encoded: string): string | null {
  try {
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

export function encodeSignal(signal: Signal): string {
  return toBase64Url(JSON.stringify(signal));
}

/** Decodes a signal code, tolerating surrounding whitespace/line breaks. */
export function decodeSignal(code: string): Signal | null {
  const json = fromBase64Url(code.replace(/\s+/g, ''));
  if (json === null) return null;
  try {
    const parsed: unknown = JSON.parse(json);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const { kind, sdp } = parsed as Record<string, unknown>;
    if ((kind !== 'offer' && kind !== 'answer') || typeof sdp !== 'string' || sdp === '') {
      return null;
    }
    return { kind, sdp };
  } catch {
    return null;
  }
}

/** Builds the invite URL a guest opens to join: current page + `#join=<offer>`. */
export function inviteUrl(offerCode: string, base: { origin: string; pathname: string }): string {
  return `${base.origin}${base.pathname}#${JOIN_PARAM}=${offerCode}`;
}

/** Extracts the offer code from a URL hash, or null if this isn't an invite. */
export function parseInviteHash(hash: string): string | null {
  const match = hash.match(new RegExp(`^#${JOIN_PARAM}=([A-Za-z0-9_-]+)$`));
  return match ? match[1] : null;
}
