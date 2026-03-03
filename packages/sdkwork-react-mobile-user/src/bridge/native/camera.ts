import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import type { CameraOptions, CameraResult } from '../types';

/**
 * Camera Bridge
 * Encapsulates Capacitor Camera plugin for user profile images
 */
export class CameraBridge {
  /**
   * Take a photo using device camera
   */
  static async takePhoto(options?: CameraOptions): Promise<CameraResult> {
    try {
      const photo = await Camera.getPhoto({
        quality: options?.quality ?? 90,
        allowEditing: options?.allowEditing ?? true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        width: options?.width ?? 800,
        height: options?.height ?? 800,
      });

      return {
        success: true,
        uri: photo.webPath || photo.path || '',
        format: photo.format,
        base64: photo.base64String,
      };
    } catch (error) {
      // User cancelled or error occurred
      if ((error as Error).message?.includes('cancelled') || (error as Error).message?.includes('canceled')) {
        return {
          success: false,
          error: 'User cancelled',
        };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to take photo',
      };
    }
  }

  /**
   * Pick image from photo gallery
   */
  static async pickImage(options?: CameraOptions): Promise<CameraResult> {
    try {
      const photo = await Camera.getPhoto({
        quality: options?.quality ?? 90,
        allowEditing: options?.allowEditing ?? true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
        width: options?.width ?? 800,
        height: options?.height ?? 800,
      });

      return {
        success: true,
        uri: photo.webPath || photo.path || '',
        format: photo.format,
        base64: photo.base64String,
      };
    } catch (error) {
      if ((error as Error).message?.includes('cancelled') || (error as Error).message?.includes('canceled')) {
        return {
          success: false,
          error: 'User cancelled',
        };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to pick image',
      };
    }
  }

  /**
   * Request camera permissions
   */
  static async requestPermissions(): Promise<{ camera: boolean; photos: boolean }> {
    try {
      const permissions = await Camera.requestPermissions();
      return {
        camera: permissions.camera === 'granted',
        photos: permissions.photos === 'granted',
      };
    } catch (error) {
      console.error('Failed to request camera permissions:', error);
      return { camera: false, photos: false };
    }
  }

  /**
   * Check camera permissions
   */
  static async checkPermissions(): Promise<{ camera: boolean; photos: boolean }> {
    try {
      const permissions = await Camera.checkPermissions();
      return {
        camera: permissions.camera === 'granted',
        photos: permissions.photos === 'granted',
      };
    } catch (error) {
      console.error('Failed to check camera permissions:', error);
      return { camera: false, photos: false };
    }
  }

  /**
   * Check if camera is available
   */
  static async isAvailable(): Promise<boolean> {
    const permissions = await this.checkPermissions();
    return permissions.camera || permissions.photos;
  }
}
