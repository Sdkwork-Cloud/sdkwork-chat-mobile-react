import { afterEach, describe, expect, it, vi } from 'vitest';
import { requestCallMediaPermissions } from './callPermissions';

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

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('requestCallMediaPermissions', () => {
  it('marks camera as unsupported when requested stream has no video track', async () => {
    const audioTrack = createTrack('audio');
    const getUserMedia = vi.fn().mockResolvedValue(createStream([audioTrack]));

    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia,
      },
    });

    const result = await requestCallMediaPermissions({
      requireCamera: true,
      requireMicrophone: true,
    });

    expect(result).toEqual({
      supported: true,
      camera: 'unsupported',
      microphone: 'granted',
    });
    expect(audioTrack.stop).toHaveBeenCalledTimes(1);
  });

  it('uses denied state when permission api reports denied for a missing track', async () => {
    const audioTrack = createTrack('audio');
    const getUserMedia = vi.fn().mockResolvedValue(createStream([audioTrack]));
    const query = vi.fn().mockResolvedValue({ state: 'denied' });

    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia,
      },
      permissions: {
        query,
      },
    });

    const result = await requestCallMediaPermissions({
      requireCamera: true,
      requireMicrophone: true,
    });

    expect(result).toEqual({
      supported: true,
      camera: 'denied',
      microphone: 'granted',
    });
    expect(audioTrack.stop).toHaveBeenCalledTimes(1);
  });

  it('keeps both permissions granted when requested tracks are present', async () => {
    const audioTrack = createTrack('audio');
    const videoTrack = createTrack('video');
    const getUserMedia = vi.fn().mockResolvedValue(createStream([audioTrack, videoTrack]));

    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia,
      },
    });

    const result = await requestCallMediaPermissions({
      requireCamera: true,
      requireMicrophone: true,
    });

    expect(result).toEqual({
      supported: true,
      camera: 'granted',
      microphone: 'granted',
    });
    expect(audioTrack.stop).toHaveBeenCalledTimes(1);
    expect(videoTrack.stop).toHaveBeenCalledTimes(1);
  });
});
