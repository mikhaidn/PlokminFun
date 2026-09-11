# Peer Doc — WebRTC collaborative text (proof of concept)

Co-write a plain-text document directly between browsers. No server ever holds
the text: the host's browser is the hub, each guest holds a WebRTC data channel
to it, and the host relays changes. When you're done, anyone can download the
document as a `.txt` file.

**Live:** https://mikhaidn.github.io/PlokminFun/peer-doc/

## How a session works

1. **Host** enters a name and clicks *Host a new document*.
2. Host clicks *Create invite link* and sends the link to one collaborator
   (chat, email, anything). The link carries the WebRTC offer in its hash.
3. **Guest** opens the link, enters a name and clicks *Join*. The page shows a
   *reply code* (the WebRTC answer). The guest sends it back to the host.
4. Host pastes the reply code and clicks *Connect*. The data channel opens, the
   host sends the full document, and both sides edit live.
5. Repeat 2–4 for each additional collaborator. Each invite link connects
   exactly one person.
6. Anyone clicks *Download .txt* at any time.

There is no signaling server, so the offer/answer exchange is manual — one
round trip per guest. That is the price of running on static hosting.

## Design

```
src/
├── signaling.ts     Encode/decode offer & answer codes, invite URL (pure)
├── peer.ts          RTCPeerConnection wrapper, non-trickle ICE, Link adapter
├── protocol.ts      JSON frames over the data channel (pure)
├── session.ts       HostSession (relay + roster) / GuestSession (pure over Link)
├── text-binding.ts  Y.Text ⇄ <textarea>/<input> binding with caret mapping
├── download.ts      Filename + Blob download
└── main.ts          UI wiring
```

- **Topology:** star. Guests never connect to each other; the host forwards
  every update to all *other* guests. If the host leaves, guests keep their
  local copy (still editable, still downloadable) but stop syncing.
- **Merging:** the document is a [Yjs](https://github.com/yjs/yjs) CRDT
  (`title` and `body` are `Y.Text`). Updates are commutative and idempotent,
  so the relay needs no conflict resolution and concurrent edits converge.
- **ICE:** non-trickle. Each side waits for candidate gathering (public STUN,
  3 s cap) so one code carries everything. No TURN — peers behind symmetric
  NATs may fail to connect.
- **Liveness:** a guest whose tab vanishes is dropped when the connection
  reports `failed`/`closed`, not only on the (slow) data-channel close.
- **Testability:** session logic depends only on a tiny `Link` interface, so
  the host/guest/relay behaviour is unit-tested over in-memory link pairs.

## Limitations (it's a PoC)

- Manual signaling: a copy/paste round trip per guest.
- Host-centric: no host migration, no reconnect.
- Plain text only; no cursors/presence beyond the roster; no persistence
  other than download.
- No TURN server.

## Commands

```bash
npm run dev:peer-doc          # from the repo root
npm test -w peer-doc
npm run validate              # full CI check
```
