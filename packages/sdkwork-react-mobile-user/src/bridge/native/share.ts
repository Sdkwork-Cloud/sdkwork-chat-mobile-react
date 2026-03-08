import { Share } from '@capacitor/share';
import type { ShareOptions, ShareResult } from '../types';

/**
 * Share Bridge
 * Encapsulates Capacitor Share plugin for user profile sharing
 */
export class ShareBridge {
  /**
   * Share content using native share sheet
   */
  static async share(options: ShareOptions): Promise<ShareResult> {
    try {
      await Share.share({
        title: options.title,
        text: options.text,
        url: options.url,
        files: options.files,
      });

      return { success: true };
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
        error: error instanceof Error ? error.message : 'Failed to share',
      };
    }
  }

  /**
   * Share user profile
   */
  static async shareProfile(userName: string, userId: string, _avatarUrl?: string): Promise<ShareResult> {
    return this.share({
      title: `${userName}的个人名片`,
      text: `添加 ${userName} 为好友，ID: ${userId}`,
      url: `https://openchat.app/user/${userId}`,
    });
  }

  /**
   * Share QR code
   */
  static async shareQRCode(qrData: string, title?: string): Promise<ShareResult> {
    return this.share({
      title: title || '我的二维码',
      text: '扫描二维码添加我为好友',
      url: qrData,
    });
  }

  /**
   * Check if sharing is available
   */
  static async canShare(): Promise<boolean> {
    try {
      // Share plugin is available on all platforms
      return true;
    } catch {
      return false;
    }
  }
}
