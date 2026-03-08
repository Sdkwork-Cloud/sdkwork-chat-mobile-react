import { beforeEach, describe, expect, it, vi } from 'vitest';

const geolocationMocks = vi.hoisted(() => ({
  getCurrentPosition: vi.fn(),
  requestPermissions: vi.fn(),
  checkPermissions: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
}));

vi.mock('@capacitor/geolocation', () => ({
  Geolocation: {
    getCurrentPosition: geolocationMocks.getCurrentPosition,
    requestPermissions: geolocationMocks.requestPermissions,
    checkPermissions: geolocationMocks.checkPermissions,
    watchPosition: geolocationMocks.watchPosition,
    clearWatch: geolocationMocks.clearWatch,
  },
}));

import { GeolocationBridge } from './geolocation';

describe('GeolocationBridge', () => {
  beforeEach(() => {
    Object.values(geolocationMocks).forEach((mockFn) => mockFn.mockReset());
  });

  it('returns normalized coordinates when current position succeeds', async () => {
    geolocationMocks.getCurrentPosition.mockResolvedValue({
      coords: {
        latitude: 31.2304,
        longitude: 121.4737,
        accuracy: 18,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: 1710000000000,
    });

    const result = await GeolocationBridge.getCurrentPosition();

    expect(result.success).toBe(true);
    expect(result.position).toMatchObject({
      latitude: 31.2304,
      longitude: 121.4737,
      accuracy: 18,
    });
    expect(result.timestamp).toBe(1710000000000);
  });

  it('returns failed result when current position throws', async () => {
    geolocationMocks.getCurrentPosition.mockRejectedValue(new Error('permission denied'));

    const result = await GeolocationBridge.getCurrentPosition();

    expect(result).toMatchObject({
      success: false,
      error: 'permission denied',
    });
  });

  it('maps permission states into boolean flags', async () => {
    geolocationMocks.requestPermissions.mockResolvedValue({
      location: 'granted',
      coarseLocation: 'prompt',
    });

    geolocationMocks.checkPermissions.mockResolvedValue({
      location: 'denied',
      coarseLocation: 'granted',
    });

    const requested = await GeolocationBridge.requestPermissions();
    const checked = await GeolocationBridge.checkPermissions();

    expect(requested).toEqual({ location: true, coarseLocation: false });
    expect(checked).toEqual({ location: false, coarseLocation: true });
  });
});
