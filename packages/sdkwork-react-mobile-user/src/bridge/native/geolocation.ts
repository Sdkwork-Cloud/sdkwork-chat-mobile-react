import { Geolocation } from '@capacitor/geolocation';
import type {
  GeolocationCoordinates,
  GeolocationOptions,
  GeolocationPermissionResult,
  GeolocationResult,
  GeolocationWatcher,
} from '../types';

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

function isGranted(value: string | undefined): boolean {
  return value === 'granted';
}

function mapCoordinates(position: { coords: GeolocationCoordinates; timestamp: number }): GeolocationResult {
  return {
    success: true,
    position: {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      altitudeAccuracy: position.coords.altitudeAccuracy,
      heading: position.coords.heading,
      speed: position.coords.speed,
    },
    timestamp: position.timestamp,
  };
}

/**
 * Geolocation Bridge
 * Encapsulates Capacitor Geolocation plugin for location-based features.
 */
export class GeolocationBridge {
  static async getCurrentPosition(options?: GeolocationOptions): Promise<GeolocationResult> {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: options?.enableHighAccuracy ?? true,
        timeout: options?.timeout ?? 15000,
        maximumAge: options?.maximumAge ?? 0,
      });

      return mapCoordinates(position as unknown as { coords: GeolocationCoordinates; timestamp: number });
    } catch (error) {
      return {
        success: false,
        error: toErrorMessage(error, 'Failed to get current position'),
      };
    }
  }

  static async requestPermissions(): Promise<GeolocationPermissionResult> {
    try {
      const permissions = await Geolocation.requestPermissions();
      return {
        location: isGranted(permissions.location),
        coarseLocation: isGranted((permissions as { coarseLocation?: string }).coarseLocation),
      };
    } catch (error) {
      console.error('Failed to request geolocation permissions:', error);
      return { location: false, coarseLocation: false };
    }
  }

  static async checkPermissions(): Promise<GeolocationPermissionResult> {
    try {
      const permissions = await Geolocation.checkPermissions();
      return {
        location: isGranted(permissions.location),
        coarseLocation: isGranted((permissions as { coarseLocation?: string }).coarseLocation),
      };
    } catch (error) {
      console.error('Failed to check geolocation permissions:', error);
      return { location: false, coarseLocation: false };
    }
  }

  static async watchPosition(callback: GeolocationWatcher, options?: GeolocationOptions): Promise<string | null> {
    try {
      const watchId = await Geolocation.watchPosition(
        {
          enableHighAccuracy: options?.enableHighAccuracy ?? true,
          timeout: options?.timeout ?? 15000,
          maximumAge: options?.maximumAge ?? 0,
        },
        (position, error) => {
          if (error) {
            callback({
              success: false,
              error: toErrorMessage(error, 'Failed to watch position'),
            });
            return;
          }

          if (!position) {
            callback({
              success: false,
              error: 'No geolocation position payload received',
            });
            return;
          }

          callback(mapCoordinates(position as unknown as { coords: GeolocationCoordinates; timestamp: number }));
        },
      );

      return watchId;
    } catch (error) {
      callback({
        success: false,
        error: toErrorMessage(error, 'Failed to start location watcher'),
      });
      return null;
    }
  }

  static async clearWatch(watchId: string): Promise<void> {
    try {
      await Geolocation.clearWatch({ id: watchId });
    } catch (error) {
      console.error('Failed to clear geolocation watcher:', error);
    }
  }
}
