import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  inspectCallMediaPermissions,
  prepareCallMediaSession,
  requestCallMediaPermissions,
} from '../src/platform/callPermissions';

const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');

function setNavigator(value: unknown): void {
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value,
  });
}

function restoreNavigator(): void {
  if (originalNavigator) {
    Object.defineProperty(globalThis, 'navigator', originalNavigator);
    return;
  }
  Reflect.deleteProperty(globalThis as Record<string, unknown>, 'navigator');
}

function createTrack(kind: 'audio' | 'video') {
  return {
    kind,
    stop: vi.fn(),
  };
}

function createStream(tracks: Array<ReturnType<typeof createTrack>>) {
  return {
    getTracks: () => tracks,
    getAudioTracks: () => tracks.filter((track) => track.kind === 'audio'),
    getVideoTracks: () => tracks.filter((track) => track.kind === 'video'),
  };
}

describe('call media permissions', () => {
  afterEach(() => {
    restoreNavigator();
  });

  it('reports unsupported when getUserMedia is unavailable', async () => {
    setNavigator({});

    const result = await inspectCallMediaPermissions();
    expect(result).toEqual({
      supported: false,
      camera: 'unsupported',
      microphone: 'unsupported',
    });
  });

  it('uses Permissions API to inspect camera/microphone states', async () => {
    const query = vi.fn(async ({ name }: { name: string }) => {
      if (name === 'camera') {
        return { state: 'granted' as const };
      }
      return { state: 'prompt' as const };
    });

    setNavigator({
      mediaDevices: {
        getUserMedia: vi.fn(),
      },
      permissions: { query },
    });

    const result = await inspectCallMediaPermissions();
    expect(result).toEqual({
      supported: true,
      camera: 'granted',
      microphone: 'prompt',
    });
    expect(query).toHaveBeenCalledTimes(2);
  });

  it('requests permission and stops tracks on success', async () => {
    const audioTrack = createTrack('audio');
    const videoTrack = createTrack('video');
    const getUserMedia = vi.fn(async () => createStream([audioTrack, videoTrack]));

    setNavigator({
      mediaDevices: {
        getUserMedia,
      },
      permissions: {
        query: vi.fn(async () => ({ state: 'prompt' as const })),
      },
    });

    const result = await requestCallMediaPermissions();
    expect(result).toEqual({
      supported: true,
      camera: 'granted',
      microphone: 'granted',
    });
    expect(getUserMedia).toHaveBeenCalledWith({
      video: true,
      audio: true,
    });
    expect(audioTrack.stop).toHaveBeenCalledTimes(1);
    expect(videoTrack.stop).toHaveBeenCalledTimes(1);
  });

  it('maps NotAllowedError to denied for requested permissions', async () => {
    const getUserMedia = vi.fn(async () => {
      const error = new Error('Permission denied');
      Object.defineProperty(error, 'name', { value: 'NotAllowedError' });
      throw error;
    });

    setNavigator({
      mediaDevices: {
        getUserMedia,
      },
      permissions: {
        query: vi.fn(async () => ({ state: 'prompt' as const })),
      },
    });

    const result = await requestCallMediaPermissions({
      requireCamera: false,
      requireMicrophone: true,
    });
    expect(result).toEqual({
      supported: true,
      camera: 'granted',
      microphone: 'denied',
    });
  });

  it('downgrades video call to audio mode when camera path is denied but microphone path succeeds', async () => {
    const requestPermissions = vi
      .fn()
      .mockResolvedValueOnce({
        supported: true,
        camera: 'denied',
        microphone: 'denied',
      })
      .mockResolvedValueOnce({
        supported: true,
        camera: 'granted',
        microphone: 'granted',
      });

    const result = await prepareCallMediaSession(
      { preferredMode: 'video', allowAudioFallback: true },
      { requestPermissions },
    );

    expect(result).toEqual({
      ready: true,
      mode: 'audio',
      fallbackApplied: true,
      reason: 'camera_denied',
      permissions: {
        supported: true,
        camera: 'granted',
        microphone: 'granted',
      },
    });
    expect(requestPermissions).toHaveBeenNthCalledWith(1, {
      requireCamera: true,
      requireMicrophone: true,
    });
    expect(requestPermissions).toHaveBeenNthCalledWith(2, {
      requireCamera: false,
      requireMicrophone: true,
    });
  });

  it('fails call preflight when microphone permission is denied', async () => {
    const requestPermissions = vi.fn().mockResolvedValue({
      supported: true,
      camera: 'granted',
      microphone: 'denied',
    });

    const result = await prepareCallMediaSession(
      { preferredMode: 'video', allowAudioFallback: true },
      { requestPermissions },
    );

    expect(result).toEqual({
      ready: false,
      mode: 'video',
      fallbackApplied: false,
      reason: 'microphone_denied',
      permissions: {
        supported: true,
        camera: 'granted',
        microphone: 'denied',
      },
    });
    expect(requestPermissions).toHaveBeenCalledTimes(2);
    expect(requestPermissions).toHaveBeenNthCalledWith(1, {
      requireCamera: true,
      requireMicrophone: true,
    });
    expect(requestPermissions).toHaveBeenNthCalledWith(2, {
      requireCamera: false,
      requireMicrophone: true,
    });
  });

  it('requests microphone-only permission when preferred mode is audio', async () => {
    const requestPermissions = vi.fn().mockResolvedValue({
      supported: true,
      camera: 'granted',
      microphone: 'granted',
    });

    const result = await prepareCallMediaSession(
      { preferredMode: 'audio' },
      { requestPermissions },
    );

    expect(result).toEqual({
      ready: true,
      mode: 'audio',
      fallbackApplied: false,
      permissions: {
        supported: true,
        camera: 'granted',
        microphone: 'granted',
      },
    });
    expect(requestPermissions).toHaveBeenCalledTimes(1);
    expect(requestPermissions).toHaveBeenCalledWith({
      requireCamera: false,
      requireMicrophone: true,
    });
  });
});
