import { describe, expect, it, vi } from 'vitest';
import {
  resolveScanFlashlightCapability,
  toggleScanFlashlight,
  type CapacitorRuntimeLike,
} from './scanFlashlightSupport';

describe('resolveScanFlashlightCapability', () => {
  it('returns unsupported when runtime is missing or not native', () => {
    expect(resolveScanFlashlightCapability(undefined).supported).toBe(false);
    expect(resolveScanFlashlightCapability(null).supported).toBe(false);
    expect(resolveScanFlashlightCapability({
      isNativePlatform: () => false,
    }).supported).toBe(false);
  });

  it('detects supported flashlight plugin from Capacitor runtime', () => {
    const runtime: CapacitorRuntimeLike = {
      isNativePlatform: () => true,
      isPluginAvailable: (name: string) => name === 'Flashlight',
      Plugins: {
        Flashlight: {
          setEnabled: vi.fn(),
        },
      },
    };

    const capability = resolveScanFlashlightCapability(runtime);
    expect(capability.supported).toBe(true);
    expect(capability.pluginName).toBe('Flashlight');
  });
});

describe('toggleScanFlashlight', () => {
  it('prefers setEnabled api and flips state', async () => {
    const setEnabled = vi.fn();
    const runtime: CapacitorRuntimeLike = {
      isNativePlatform: () => true,
      isPluginAvailable: (name: string) => name === 'Torch',
      Plugins: {
        Torch: {
          setEnabled,
        },
      },
    };

    await expect(toggleScanFlashlight(runtime, false)).resolves.toBe(true);
    expect(setEnabled).toHaveBeenCalledWith({ enabled: true });
  });

  it('falls back to toggle api when setEnabled is not available', async () => {
    const toggle = vi.fn();
    const runtime: CapacitorRuntimeLike = {
      isNativePlatform: () => true,
      Plugins: {
        Torch: {
          toggle,
        },
      },
    };

    await expect(toggleScanFlashlight(runtime, true)).resolves.toBe(false);
    expect(toggle).toHaveBeenCalledTimes(1);
  });

  it('throws when flashlight is unsupported', async () => {
    const runtime: CapacitorRuntimeLike = {
      isNativePlatform: () => true,
      Plugins: {},
    };

    await expect(toggleScanFlashlight(runtime, false)).rejects.toThrow('Flashlight plugin is not available');
  });
});
