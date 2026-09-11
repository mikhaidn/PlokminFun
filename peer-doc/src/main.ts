import './styles.css';
import { createOffer, acceptOffer, acceptAnswer, waitForOpen, linkFromChannel } from './peer';
import { encodeSignal, decodeSignal, inviteUrl, parseInviteHash } from './signaling';
import { HostSession, GuestSession, createDocument } from './session';
import { bindText } from './text-binding';
import { filenameFor, downloadText } from './download';
import type { PeerInfo } from './protocol';

const NAME_KEY = 'peer-doc:name';

const $ = <T extends HTMLElement>(selector: string): T => document.querySelector<T>(selector)!;

const statusEl = $('#status');
const lobby = $('#lobby');
const nameInput = $<HTMLInputElement>('#name');
const hostPanel = $('#host-panel');
const joinPanel = $('#join-panel');
const hostBtn = $<HTMLButtonElement>('#host-btn');
const joinBtn = $<HTMLButtonElement>('#join-btn');

const replySection = $('#reply');
const replyCode = $<HTMLTextAreaElement>('#reply-code');
const copyReplyBtn = $<HTMLButtonElement>('#copy-reply');
const replyStatus = $('#reply-status');

const editor = $('#editor');
const titleInput = $<HTMLInputElement>('#title');
const bodyInput = $<HTMLTextAreaElement>('#body');
const downloadBtn = $<HTMLButtonElement>('#download');
const peersList = $('#peers');
const invitePanel = $('#invite');
const inviteBtn = $<HTMLButtonElement>('#invite-btn');
const inviteError = $('#invite-error');
const invitePending = $('#invite-pending');
const inviteLink = $<HTMLTextAreaElement>('#invite-link');
const copyInviteBtn = $<HTMLButtonElement>('#copy-invite');
const answerCode = $<HTMLTextAreaElement>('#answer-code');
const connectBtn = $<HTMLButtonElement>('#connect-btn');
const cancelInviteBtn = $<HTMLButtonElement>('#cancel-invite');
const guestNote = $('#guest-note');

const { doc, title, body } = createDocument();

// ---------------------------------------------------------------------------
// Small UI helpers

function setStatus(text: string, tone: 'ok' | 'warn' | '' = ''): void {
  statusEl.textContent = text;
  statusEl.className = `status ${tone}`.trim();
}

function show(section: HTMLElement): void {
  for (const el of [lobby, replySection, editor]) el.hidden = el !== section;
}

function currentName(): string {
  const name = nameInput.value.trim() || 'Anonymous';
  try {
    localStorage.setItem(NAME_KEY, name);
  } catch {
    /* private mode etc. — not important */
  }
  return name;
}

async function copyToClipboard(text: string, button: HTMLButtonElement): Promise<void> {
  const original = button.textContent;
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = 'Copied!';
  } catch {
    button.textContent = 'Select & copy manually';
  }
  setTimeout(() => {
    button.textContent = original;
  }, 1500);
}

function renderPeers(peers: PeerInfo[], selfId: string, hostId: string | null): void {
  peersList.replaceChildren(
    ...peers.map((peer) => {
      const li = document.createElement('li');
      const dot = document.createElement('span');
      dot.className = 'dot';
      li.append(dot, document.createTextNode(peer.name));
      if (peer.id === hostId) li.append(tag('host'));
      if (peer.id === selfId) li.append(tag('you'));
      return li;
    })
  );
}

function tag(text: string): HTMLSpanElement {
  const span = document.createElement('span');
  span.className = 'tag';
  span.textContent = text;
  return span;
}

function openEditor(): void {
  bindText(title, titleInput);
  bindText(body, bodyInput);
  show(editor);
  bodyInput.focus();
}

downloadBtn.addEventListener('click', () => {
  downloadText(filenameFor(title.toString()), body.toString());
});

// ---------------------------------------------------------------------------
// Host flow

function startHosting(): void {
  const host = new HostSession(doc, currentName());
  host.onPeers((peers) => {
    renderPeers(peers, host.self.id, host.self.id);
    const guests = peers.length - 1;
    setStatus(
      guests === 0 ? 'Hosting · no one connected yet' : `Hosting · ${guests} connected`,
      guests === 0 ? 'warn' : 'ok'
    );
  });
  invitePanel.hidden = false;
  openEditor();

  let pending: Awaited<ReturnType<typeof createOffer>> | null = null;

  const resetInvite = () => {
    pending?.pc.close();
    pending = null;
    invitePending.hidden = true;
    inviteBtn.hidden = false;
    inviteBtn.disabled = false;
    answerCode.value = '';
    inviteError.hidden = true;
  };

  inviteBtn.addEventListener('click', async () => {
    inviteBtn.disabled = true;
    inviteError.hidden = true;
    try {
      pending = await createOffer();
      inviteLink.value = inviteUrl(encodeSignal({ kind: 'offer', sdp: pending.sdp }), location);
      inviteBtn.hidden = true;
      invitePending.hidden = false;
      inviteLink.focus();
      inviteLink.select();
    } catch (err) {
      inviteError.textContent = `Could not create an invite: ${(err as Error).message}`;
      inviteError.hidden = false;
      inviteBtn.disabled = false;
    }
  });

  copyInviteBtn.addEventListener('click', () => copyToClipboard(inviteLink.value, copyInviteBtn));
  cancelInviteBtn.addEventListener('click', resetInvite);

  connectBtn.addEventListener('click', async () => {
    if (!pending) return;
    const signal = decodeSignal(answerCode.value);
    if (!signal || signal.kind !== 'answer') {
      inviteError.textContent = "That doesn't look like a reply code. Paste the whole thing.";
      inviteError.hidden = false;
      return;
    }
    const { pc, channel } = pending;
    connectBtn.disabled = true;
    inviteError.hidden = true;
    try {
      await acceptAnswer(pc, signal.sdp);
      await waitForOpen(channel);
      host.addGuest(linkFromChannel(channel, pc));
      pending = null; // now owned by the session; don't close it
      resetInvite();
    } catch (err) {
      inviteError.textContent = `Connection failed: ${(err as Error).message}. Create a fresh invite and try again.`;
      inviteError.hidden = false;
    } finally {
      connectBtn.disabled = false;
    }
  });
}

// ---------------------------------------------------------------------------
// Guest flow

async function joinFromInvite(offerCode: string): Promise<void> {
  const offer = decodeSignal(offerCode);
  if (!offer || offer.kind !== 'offer') {
    setStatus('Invalid invite link', 'warn');
    joinPanel.hidden = true;
    hostPanel.hidden = false;
    return;
  }

  joinBtn.disabled = true;
  setStatus('Preparing reply…');
  let answer: Awaited<ReturnType<typeof acceptOffer>>;
  try {
    answer = await acceptOffer(offer.sdp);
  } catch (err) {
    setStatus(`Could not join: ${(err as Error).message}`, 'warn');
    joinBtn.disabled = false;
    return;
  }

  replyCode.value = encodeSignal({ kind: 'answer', sdp: answer.sdp });
  show(replySection);
  setStatus('Waiting for host', 'warn');
  // Drop the offer from the address bar so a refresh doesn't re-answer a used invite.
  history.replaceState(null, '', location.pathname);

  const name = currentName();
  try {
    const channel = await answer.channel;
    await waitForOpen(channel);
    const guest = new GuestSession(doc, name, linkFromChannel(channel, answer.pc));
    guest.onPeers((peers) => renderPeers(peers, guest.self.id, peers[0]?.id ?? null));
    guest.onState((state) => {
      if (state === 'connected') {
        guestNote.hidden = false;
        openEditor();
        setStatus('Connected to host', 'ok');
      } else if (state === 'disconnected') {
        setStatus('Disconnected — you can still edit and download locally', 'warn');
      }
    });
  } catch (err) {
    replyStatus.textContent = `Connection failed: ${(err as Error).message}. Ask the host for a new link.`;
    setStatus('Connection failed', 'warn');
  }
}

copyReplyBtn.addEventListener('click', () => copyToClipboard(replyCode.value, copyReplyBtn));

// ---------------------------------------------------------------------------
// Boot

try {
  nameInput.value = localStorage.getItem(NAME_KEY) ?? '';
} catch {
  /* ignore */
}

const offerCode = parseInviteHash(location.hash);
if (offerCode) {
  hostPanel.hidden = true;
  joinPanel.hidden = false;
  joinBtn.addEventListener('click', () => joinFromInvite(offerCode));
} else {
  hostBtn.addEventListener('click', startHosting);
}
show(lobby);
