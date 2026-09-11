/**
 * Session logic on top of a Link — pure of any WebRTC or DOM concerns.
 *
 * The document is a Yjs doc. Every local transaction emits an update which
 * is sent to the other side; incoming updates are applied with the sending
 * Link as the transaction origin so they are never echoed back to it. On the
 * host that same rule makes it a relay: a guest's update is applied locally
 * and forwarded to every *other* guest.
 */
import * as Y from 'yjs';
import type { Link } from './peer';
import {
  base64ToBytes,
  bytesToBase64,
  decodeMessage,
  encodeMessage,
  newPeerId,
  type PeerInfo,
} from './protocol';

type PeersListener = (peers: PeerInfo[]) => void;

function sendUpdate(link: Link, update: Uint8Array): void {
  link.send(encodeMessage({ type: 'update', data: bytesToBase64(update) }));
}

function applyRemoteUpdate(doc: Y.Doc, data: string, origin: Link): void {
  const bytes = base64ToBytes(data);
  if (bytes) Y.applyUpdate(doc, bytes, origin);
}

/** Shared document state. Both text fields are CRDT strings. */
export function createDocument(): { doc: Y.Doc; title: Y.Text; body: Y.Text } {
  const doc = new Y.Doc();
  return { doc, title: doc.getText('title'), body: doc.getText('body') };
}

export class HostSession {
  readonly self: PeerInfo;
  private readonly guests = new Map<Link, PeerInfo>();
  private readonly peersListeners = new Set<PeersListener>();

  constructor(
    private readonly doc: Y.Doc,
    name: string
  ) {
    this.self = { id: newPeerId(), name };
    doc.on('update', (update: Uint8Array, origin: unknown) => {
      for (const link of this.guests.keys()) {
        if (link !== origin) sendUpdate(link, update);
      }
    });
  }

  peers(): PeerInfo[] {
    return [this.self, ...this.guests.values()];
  }

  onPeers(listener: PeersListener): () => void {
    this.peersListeners.add(listener);
    listener(this.peers());
    return () => this.peersListeners.delete(listener);
  }

  /** Attach a freshly opened guest link. The guest joins the roster once it says hello. */
  addGuest(link: Link): void {
    link.onMessage((text) => {
      const msg = decodeMessage(text);
      if (!msg) return;
      if (msg.type === 'hello') {
        this.guests.set(link, { id: msg.id, name: msg.name });
        link.send(encodeMessage({ type: 'welcome', hostId: this.self.id, peers: this.peers() }));
        sendUpdate(link, Y.encodeStateAsUpdate(this.doc));
        this.broadcastPresence();
      } else if (msg.type === 'update') {
        applyRemoteUpdate(this.doc, msg.data, link);
      }
    });
    link.onClose(() => {
      if (this.guests.delete(link)) this.broadcastPresence();
    });
  }

  private broadcastPresence(): void {
    const peers = this.peers();
    const frame = encodeMessage({ type: 'presence', peers });
    for (const link of this.guests.keys()) link.send(frame);
    for (const listener of this.peersListeners) listener(peers);
  }
}

export type GuestState = 'connecting' | 'connected' | 'disconnected';

export class GuestSession {
  readonly self: PeerInfo;
  state: GuestState = 'connecting';
  private roster: PeerInfo[] = [];
  private readonly peersListeners = new Set<PeersListener>();
  private readonly stateListeners = new Set<(state: GuestState) => void>();

  constructor(
    doc: Y.Doc,
    name: string,
    private readonly link: Link
  ) {
    this.self = { id: newPeerId(), name };

    doc.on('update', (update: Uint8Array, origin: unknown) => {
      if (origin !== link && this.state !== 'disconnected') sendUpdate(link, update);
    });

    link.onMessage((text) => {
      const msg = decodeMessage(text);
      if (!msg) return;
      switch (msg.type) {
        case 'welcome':
          this.roster = msg.peers;
          this.setState('connected');
          this.emitPeers();
          break;
        case 'presence':
          this.roster = msg.peers;
          this.emitPeers();
          break;
        case 'update':
          applyRemoteUpdate(doc, msg.data, link);
          break;
      }
    });
    link.onClose(() => this.setState('disconnected'));

    link.send(encodeMessage({ type: 'hello', id: this.self.id, name: this.self.name }));
  }

  peers(): PeerInfo[] {
    return this.roster;
  }

  onPeers(listener: PeersListener): () => void {
    this.peersListeners.add(listener);
    listener(this.roster);
    return () => this.peersListeners.delete(listener);
  }

  onState(listener: (state: GuestState) => void): () => void {
    this.stateListeners.add(listener);
    listener(this.state);
    return () => this.stateListeners.delete(listener);
  }

  leave(): void {
    this.link.close();
    this.setState('disconnected');
  }

  private emitPeers(): void {
    for (const listener of this.peersListeners) listener(this.roster);
  }

  private setState(state: GuestState): void {
    if (this.state === state) return;
    this.state = state;
    for (const listener of this.stateListeners) listener(state);
  }
}
