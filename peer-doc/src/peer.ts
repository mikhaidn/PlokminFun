/**
 * Thin wrapper around RTCPeerConnection for a data-channel-only link.
 *
 * Uses "non-trickle" ICE: we wait for candidate gathering to finish before
 * handing out the SDP, so a single offer/answer exchange carries everything
 * needed and no further signaling round trips are required.
 *
 * Topology is a star: the host holds one connection per guest and relays.
 * Guests never talk to each other directly.
 */

/** A minimal message pipe. RTCDataChannel is wrapped into this so session logic is testable. */
export interface Link {
  send(text: string): void;
  close(): void;
  onMessage(handler: (text: string) => void): void;
  onClose(handler: () => void): void;
}

const RTC_CONFIG: RTCConfiguration = {
  // Public STUN only. Peers behind symmetric NATs may need TURN, which is out of scope for this PoC.
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

const CHANNEL_LABEL = 'peer-doc';

/** The subset of RTCPeerConnection used for liveness — keeps this testable. */
export interface ConnectionWatcher {
  connectionState: RTCPeerConnectionState;
  addEventListener(type: 'connectionstatechange', listener: () => void): void;
}

/**
 * Adapts an open RTCDataChannel to the Link interface.
 *
 * A tab that vanishes (crash, closed window, lost network) never sends a
 * graceful close, and the channel's own `close` event only fires after the
 * ICE consent timeout (~30s). Watching the connection for `failed`/`closed`
 * reports the drop much sooner. Close is reported exactly once either way.
 */
export function linkFromChannel(channel: RTCDataChannel, pc?: ConnectionWatcher): Link {
  const closeHandlers: Array<() => void> = [];
  let closed = false;
  const emitClose = () => {
    if (closed) return;
    closed = true;
    for (const handler of closeHandlers) handler();
  };
  channel.addEventListener('close', emitClose);
  pc?.addEventListener('connectionstatechange', () => {
    if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
      channel.close();
      emitClose();
    }
  });

  return {
    send: (text) => {
      if (channel.readyState === 'open') channel.send(text);
    },
    close: () => {
      channel.close();
      emitClose();
    },
    onMessage: (handler) => channel.addEventListener('message', (e) => handler(String(e.data))),
    onClose: (handler) => {
      closeHandlers.push(handler);
    },
  };
}

/** The subset of RTCPeerConnection that ICE gathering needs — keeps this testable. */
export interface IceGatherer {
  iceGatheringState: RTCIceGatheringState;
  addEventListener(type: 'icegatheringstatechange', listener: () => void): void;
  removeEventListener(type: 'icegatheringstatechange', listener: () => void): void;
}

/**
 * Resolves once ICE gathering completes, or after `timeoutMs` — a slow STUN
 * server shouldn't block the invite forever; whatever candidates exist by then
 * are usually enough on a LAN.
 */
export function waitForIceGathering(pc: IceGatherer, timeoutMs = 3000): Promise<void> {
  if (pc.iceGatheringState === 'complete') return Promise.resolve();
  return new Promise((resolve) => {
    const finish = () => {
      clearTimeout(timer);
      pc.removeEventListener('icegatheringstatechange', onChange);
      resolve();
    };
    const onChange = () => {
      if (pc.iceGatheringState === 'complete') finish();
    };
    const timer = setTimeout(finish, timeoutMs);
    pc.addEventListener('icegatheringstatechange', onChange);
  });
}

export interface PendingOffer {
  pc: RTCPeerConnection;
  channel: RTCDataChannel;
  /** Full local SDP (with ICE candidates) to hand to the guest. */
  sdp: string;
}

/** Host side: opens a connection + data channel and produces an offer. */
export async function createOffer(): Promise<PendingOffer> {
  const pc = new RTCPeerConnection(RTC_CONFIG);
  const channel = pc.createDataChannel(CHANNEL_LABEL, { ordered: true });
  await pc.setLocalDescription(await pc.createOffer());
  await waitForIceGathering(pc);
  return { pc, channel, sdp: pc.localDescription!.sdp };
}

export interface PendingAnswer {
  pc: RTCPeerConnection;
  /** Resolves with the host's data channel once it is announced. */
  channel: Promise<RTCDataChannel>;
  /** Full local SDP (with ICE candidates) to send back to the host. */
  sdp: string;
}

/** Guest side: consumes the host's offer and produces an answer. */
export async function acceptOffer(offerSdp: string): Promise<PendingAnswer> {
  const pc = new RTCPeerConnection(RTC_CONFIG);
  const channel = new Promise<RTCDataChannel>((resolve) => {
    pc.ondatachannel = (event) => resolve(event.channel);
  });
  await pc.setRemoteDescription({ type: 'offer', sdp: offerSdp });
  await pc.setLocalDescription(await pc.createAnswer());
  await waitForIceGathering(pc);
  return { pc, channel, sdp: pc.localDescription!.sdp };
}

/** Host side: completes the handshake with the guest's answer. */
export async function acceptAnswer(pc: RTCPeerConnection, answerSdp: string): Promise<void> {
  await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });
}

/** Resolves when the channel opens; rejects if it errors/closes first or times out. */
export function waitForOpen(channel: RTCDataChannel, timeoutMs = 20000): Promise<void> {
  if (channel.readyState === 'open') return Promise.resolve();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error('Timed out waiting for the connection')),
      timeoutMs
    );
    channel.addEventListener('open', () => {
      clearTimeout(timer);
      resolve();
    });
    const fail = () => {
      clearTimeout(timer);
      reject(new Error('Connection failed'));
    };
    channel.addEventListener('error', fail);
    channel.addEventListener('close', fail);
  });
}
