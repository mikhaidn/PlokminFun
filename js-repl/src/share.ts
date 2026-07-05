/**
 * Shareable snippets: the code is packed into the URL hash so a link fully
 * reconstructs the playground with no server involved. Uses base64 (URL-safe)
 * over UTF-8 bytes so any characters survive the round trip.
 */

export function encodeCode(code: string): string {
  const bytes = new TextEncoder().encode(code);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeCode(encoded: string): string | null {
  try {
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}
