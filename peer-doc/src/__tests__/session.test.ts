import { describe, it, expect } from 'vitest';
import * as Y from 'yjs';
import type { Link } from '../peer';
import { HostSession, GuestSession, createDocument, type GuestState } from '../session';
import type { PeerInfo } from '../protocol';

/** In-memory link pair with asynchronous delivery, like a real data channel. */
function linkPair(): [Link, Link] {
  const make = (): Link & {
    peer?: Link;
    handlers: ((t: string) => void)[];
    closers: (() => void)[];
    open: boolean;
  } => {
    const self = {
      peer: undefined as Link | undefined,
      handlers: [] as ((t: string) => void)[],
      closers: [] as (() => void)[],
      open: true,
      send(text: string) {
        const target = self.peer as ReturnType<typeof make> | undefined;
        if (!self.open || !target?.open) return;
        queueMicrotask(() => target.handlers.forEach((h) => h(text)));
      },
      close() {
        if (!self.open) return;
        self.open = false;
        const target = self.peer as ReturnType<typeof make> | undefined;
        queueMicrotask(() => {
          self.closers.forEach((c) => c());
          if (target?.open) {
            target.open = false;
            target.closers.forEach((c) => c());
          }
        });
      },
      onMessage(h: (t: string) => void) {
        self.handlers.push(h);
      },
      onClose(c: () => void) {
        self.closers.push(c);
      },
    };
    return self;
  };
  const a = make();
  const b = make();
  a.peer = b;
  b.peer = a;
  return [a, b];
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

function connectGuest(host: HostSession, name: string) {
  const [hostEnd, guestEnd] = linkPair();
  const { doc, title, body } = createDocument();
  host.addGuest(hostEnd);
  const session = new GuestSession(doc, name, guestEnd);
  return { session, doc, title, body };
}

describe('host + guests', () => {
  it('sends the full document to a joining guest and marks it connected', async () => {
    const h = createDocument();
    h.title.insert(0, 'Notes');
    h.body.insert(0, 'first line');
    const host = new HostSession(h.doc, 'Host');

    const g = connectGuest(host, 'Ada');
    const states: GuestState[] = [];
    g.session.onState((s) => states.push(s));
    await flush();

    expect(g.session.state).toBe('connected');
    expect(states).toEqual(['connecting', 'connected']);
    expect(g.title.toString()).toBe('Notes');
    expect(g.body.toString()).toBe('first line');
  });

  it('keeps the roster in sync on the host and every guest', async () => {
    const host = new HostSession(createDocument().doc, 'Host');
    const hostRosters: PeerInfo[][] = [];
    host.onPeers((p) => hostRosters.push(p));

    const a = connectGuest(host, 'Ada');
    await flush();
    const b = connectGuest(host, 'Bob');
    await flush();

    const names = (peers: PeerInfo[]) => peers.map((p) => p.name);
    expect(names(host.peers())).toEqual(['Host', 'Ada', 'Bob']);
    expect(names(a.session.peers())).toEqual(['Host', 'Ada', 'Bob']);
    expect(names(b.session.peers())).toEqual(['Host', 'Ada', 'Bob']);
    expect(hostRosters.map(names)).toEqual([['Host'], ['Host', 'Ada'], ['Host', 'Ada', 'Bob']]);
  });

  it('relays edits between guests through the host', async () => {
    const h = createDocument();
    const host = new HostSession(h.doc, 'Host');
    const a = connectGuest(host, 'Ada');
    const b = connectGuest(host, 'Bob');
    await flush();

    a.body.insert(0, 'from ada');
    await flush();
    expect(h.body.toString()).toBe('from ada');
    expect(b.body.toString()).toBe('from ada');

    b.body.insert(8, ' + bob');
    h.body.insert(0, '[host] ');
    await flush();
    const expected = '[host] from ada + bob';
    expect(h.body.toString()).toBe(expected);
    expect(a.body.toString()).toBe(expected);
    expect(b.body.toString()).toBe(expected);
  });

  it('converges when everyone edits concurrently before hearing from each other', async () => {
    const h = createDocument();
    h.body.insert(0, 'base');
    const host = new HostSession(h.doc, 'Host');
    const a = connectGuest(host, 'Ada');
    const b = connectGuest(host, 'Bob');
    await flush();

    // Three concurrent edits, none delivered yet.
    h.body.insert(0, 'H');
    a.body.insert(4, 'A');
    b.body.delete(0, 2);
    await flush();

    const result = h.body.toString();
    expect(a.body.toString()).toBe(result);
    expect(b.body.toString()).toBe(result);
    expect(result).toContain('H');
    expect(result).toContain('A');
    expect(result).not.toContain('ba');
  });

  it('drops a guest from the roster when its link closes', async () => {
    const host = new HostSession(createDocument().doc, 'Host');
    const a = connectGuest(host, 'Ada');
    const b = connectGuest(host, 'Bob');
    await flush();

    a.session.leave();
    await flush();

    expect(a.session.state).toBe('disconnected');
    expect(host.peers().map((p) => p.name)).toEqual(['Host', 'Bob']);
    expect(b.session.peers().map((p) => p.name)).toEqual(['Host', 'Bob']);
  });

  it('lets a disconnected guest keep editing locally without errors', async () => {
    const host = new HostSession(createDocument().doc, 'Host');
    const a = connectGuest(host, 'Ada');
    await flush();
    a.session.leave();
    await flush();

    expect(() => a.body.insert(0, 'offline edit')).not.toThrow();
    expect(a.body.toString()).toBe('offline edit');
  });

  it('ignores malformed frames from a guest', async () => {
    const h = createDocument();
    const host = new HostSession(h.doc, 'Host');
    const [hostEnd, guestEnd] = linkPair();
    host.addGuest(hostEnd);
    guestEnd.send('not json');
    guestEnd.send(JSON.stringify({ type: 'update', data: '***' }));
    await flush();
    expect(host.peers()).toHaveLength(1);
    expect(h.body.toString()).toBe('');
  });

  it('does not echo a guest update back to its sender', async () => {
    const h = createDocument();
    const host = new HostSession(h.doc, 'Host');
    const [hostEnd, guestEnd] = linkPair();
    host.addGuest(hostEnd);
    const received: string[] = [];
    guestEnd.onMessage((t) => received.push(JSON.parse(t).type));
    guestEnd.send(JSON.stringify({ type: 'hello', id: 'g1', name: 'Ada' }));
    await flush();
    received.length = 0;

    const guestDoc = new Y.Doc();
    guestDoc.getText('body').insert(0, 'x');
    const update = Y.encodeStateAsUpdate(guestDoc);
    guestEnd.send(JSON.stringify({ type: 'update', data: btoa(String.fromCharCode(...update)) }));
    await flush();

    expect(h.body.toString()).toBe('x');
    expect(received).toEqual([]);
  });
});
