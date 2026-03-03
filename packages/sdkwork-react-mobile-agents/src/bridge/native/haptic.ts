import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import type { HapticOptions, HapticResult } from '../types';

/**
 * Haptic Bridge
 * Encapsulates Capacitor Haptics plugin for tactile feedback
 */
export class HapticBridge {
  /**
   * Trigger haptic feedback
   */
  static async vibrate(options: HapticOptions): Promise<HapticResult> {
    try {
      switch (options.type) {
        case 'light':
          await Haptics.impact({ style: ImpactStyle.Light });
          break;
        case 'medium':
          await Haptics.impact({ style: ImpactStyle.Medium });
          break;
        case 'heavy':
          await Haptics.impact({ style: ImpactStyle.Heavy });
          break;
        case 'selection':
          await Haptics.selectionStart();
          break;
        case 'success':
          await Haptics.notification({ type: NotificationType.Success });
          break;
        case 'warning':
          await Haptics.notification({ type: NotificationType.Warning });
          break;
        case 'error':
          await Haptics.notification({ type: NotificationType.Error });
          break;
        default:
          await Haptics.impact({ style: ImpactStyle.Light });
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to trigger haptic:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to trigger haptic',
      };
    }
  }

  /**
   * Light impact feedback
   */
  static async light(): Promise<HapticResult> {
    return this.vibrate({ type: 'light' });
  }

  /**
   * Medium impact feedback
   */
  static async medium(): Promise<HapticResult> {
    return this.vibrate({ type: 'medium' });
  }

  /**
   * Heavy impact feedback
   */
  static async heavy(): Promise<HapticResult> {
    return this.vibrate({ type: 'heavy' });
  }

  /**
   * Selection feedback
   */
  static async selection(): Promise<HapticResult> {
    return this.vibrate({ type: 'selection' });
  }

  /**
   * Success notification
   */
  static async success(): Promise<HapticResult> {
    return this.vibrate({ type: 'success' });
  }

  /**
   * Check if haptics is available
   */
  static async isAvailable(): Promise<boolean> {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
      return true;
    } catch {
      return false;
    }
  }
}
