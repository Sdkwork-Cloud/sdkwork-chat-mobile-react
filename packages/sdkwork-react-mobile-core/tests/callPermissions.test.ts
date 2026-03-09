import { afterEach, describe, expect, it, vi } from 'vitest';
import { inspectCallMediaPermissions, requestCallMediaPermissions } from '../src/platform/callPermissions';

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
    const stopAudio = vi.fn();
    const stopVideo = vi.fn();
    const getUserMedia = vi.fn(async () => ({
      getTracks: () => [{ stop: stopAudio }, { stop: stopVideo }],
    }));

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
    expect(stopAudio).toHaveBeenCalledTimes(1);
    expect(stopVideo).toHaveBeenCalledTimes(1);
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
});
