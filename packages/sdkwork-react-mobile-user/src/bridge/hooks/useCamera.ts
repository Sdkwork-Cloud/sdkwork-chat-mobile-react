import { useState, useCallback } from 'react';
import { CameraBridge } from '../native/camera';
import type { CameraOptions, CameraResult } from '../types';

/**
 * Camera Hook
 * Provides camera functionality for user profile images
 */
export function useCamera() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastPhoto, setLastPhoto] = useState<CameraResult | null>(null);
  const [permissions, setPermissions] = useState<{ camera: boolean; photos: boolean }>({
    camera: false,
    photos: false,
  });

  /**
   * Take a photo using device camera
   */
  const takePhoto = useCallback(async (options?: CameraOptions): Promise<CameraResult> => {
    setIsLoading(true);
    try {
      const result = await CameraBridge.takePhoto(options);
      if (result.success) {
        setLastPhoto(result);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Pick image from photo gallery
   */
  const pickImage = useCallback(async (options?: CameraOptions): Promise<CameraResult> => {
    setIsLoading(true);
    try {
      const result = await CameraBridge.pickImage(options);
      if (result.success) {
        setLastPhoto(result);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Request camera permissions
   */
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    const perms = await CameraBridge.requestPermissions();
    setPermissions(perms);
    return perms.camera || perms.photos;
  }, []);

  /**
   * Check camera permissions
   */
  const checkPermissions = useCallback(async (): Promise<boolean> => {
    const perms = await CameraBridge.checkPermissions();
    setPermissions(perms);
    return perms.camera || perms.photos;
  }, []);

  /**
   * Pick avatar image (convenience method)
   */
  const pickAvatar = useCallback(async (): Promise<CameraResult> => {
    return pickImage({
      allowEditing: true,
      width: 400,
      height: 400,
    });
  }, [pickImage]);

  return {
    isLoading,
    lastPhoto,
    permissions,
    takePhoto,
    pickImage,
    pickAvatar,
    requestPermissions,
    checkPermissions,
  };
}
