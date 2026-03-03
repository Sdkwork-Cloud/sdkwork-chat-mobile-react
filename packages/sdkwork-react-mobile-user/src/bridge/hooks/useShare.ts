import { useState, useCallback } from 'react';
import { ShareBridge } from '../native/share';
import type { ShareOptions, ShareResult } from '../types';

/**
 * Share Hook
 * Provides sharing functionality for user profile
 */
export function useShare() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<ShareResult | null>(null);

  /**
   * Share content using native share sheet
   */
  const share = useCallback(async (options: ShareOptions): Promise<ShareResult> => {
    setIsLoading(true);
    try {
      const result = await ShareBridge.share(options);
      setLastResult(result);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Share user profile
   */
  const shareProfile = useCallback(async (
    userName: string,
    userId: string,
    avatarUrl?: string
  ): Promise<ShareResult> => {
    setIsLoading(true);
    try {
      const result = await ShareBridge.shareProfile(userName, userId, avatarUrl);
      setLastResult(result);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Share QR code
   */
  const shareQRCode = useCallback(async (qrData: string, title?: string): Promise<ShareResult> => {
    setIsLoading(true);
    try {
      const result = await ShareBridge.shareQRCode(qrData, title);
      setLastResult(result);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Check if sharing is available
   */
  const canShare = useCallback(async (): Promise<boolean> => {
    return await ShareBridge.canShare();
  }, []);

  return {
    isLoading,
    lastResult,
    share,
    shareProfile,
    shareQRCode,
    canShare,
  };
}
