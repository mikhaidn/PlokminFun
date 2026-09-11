import { describe, it, expect, vi } from 'vitest';
import {
  waitForIceGathering,
  linkFromChannel,
  type IceGatherer,
  type ConnectionWatcher,
} from '../peer';

function fakeGatherer(initial: RTCIceGatheringState) {
  const listeners = new Set<() => void>();
  const pc: IceGatherer = {
    iceGatheringState: initial,
    addEventListener: (_t, l) => listeners.add(l),
    removeEventListener: (_t, l) => listeners.delete(l),
  };
  return {
    pc,
    setState(state: RTCIceGatheringState) {
      pc.iceGatheringState = state;
      listeners.forEach((l) => l());
    },
    listenerCount: () => listeners.size,
  };
}

describe('waitForIceGathering', () => {
  it('resolves immediately when already complete', async () => {
    const { pc } = fakeGatherer('complete');
    await expect(waitForIceGathering(pc)).resolves.toBeUndefined();
  });

  it('resolves when gathering completes and detaches its listener', async () => {
    const g = fakeGatherer('gathering');
    const promise = waitForIceGathering(g.pc, 10_000);
    g.setState('complete');
    await expect(promise).resolves.toBeUndefined();
    expect(g.listenerCount()).toBe(0);
  });

  it('gives up after the timeout', async () => {
    vi.useFakeTimers();
    const g = fakeGatherer('gathering');
    const promise = waitForIceGathering(g.pc, 500);
    vi.advanceTimersByTime(500);
    await expect(promise).resolves.toBeUndefined();
    expect(g.listenerCount()).toBe(0);
    vi.useRealTimers();
  });
});

describe('linkFromChannel', () => {
  it('only sends while the channel is open', () => {
    const channel = new EventTarget() as RTCDataChannel & { readyState: string };
    const send = vi.fn();
    Object.assign(channel, { readyState: 'connecting', send, close: vi.fn() });
    const link = linkFromChannel(channel);

    link.send('early');
    expect(send).not.toHaveBeenCalled();
    channel.readyState = 'open';
    link.send('now');
    expect(send).toHaveBeenCalledWith('now');
  });

  it('forwards message and close events', () => {
    const channel = new EventTarget() as RTCDataChannel;
    Object.assign(channel, { readyState: 'open', send: vi.fn(), close: vi.fn() });
    const link = linkFromChannel(channel);
    const onMessage = vi.fn();
    const onClose = vi.fn();
    link.onMessage(onMessage);
    link.onClose(onClose);

    channel.dispatchEvent(new MessageEvent('message', { data: 'hi' }));
    channel.dispatchEvent(new Event('close'));

    expect(onMessage).toHaveBeenCalledWith('hi');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('reports close once when the peer connection fails, closing the channel', () => {
    const channel = new EventTarget() as RTCDataChannel;
    const close = vi.fn(() => channel.dispatchEvent(new Event('close')));
    Object.assign(channel, { readyState: 'open', send: vi.fn(), close });
    const pcListeners = new Set<() => void>();
    const pc: ConnectionWatcher = {
      connectionState: 'connected',
      addEventListener: (_t, l) => pcListeners.add(l),
    };
    const link = linkFromChannel(channel, pc);
    const onClose = vi.fn();
    link.onClose(onClose);

    pc.connectionState = 'disconnected';
    pcListeners.forEach((l) => l());
    expect(onClose).not.toHaveBeenCalled();

    pc.connectionState = 'failed';
    pcListeners.forEach((l) => l());
    expect(close).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);

    link.close();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
