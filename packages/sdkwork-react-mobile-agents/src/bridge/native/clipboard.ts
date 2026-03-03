import { Clipboard } from '@capacitor/clipboard';
import type { ClipboardOptions, ClipboardResult } from '../types';

/**
 * Clipboard Bridge
 * Encapsulates Capacitor Clipboard plugin
 */
export class ClipboardBridge {
  /**
   * Write text to clipboard
   */
  static async write(options: ClipboardOptions): Promise<ClipboardResult> {
    try {
      await Clipboard.write({
        string: options.text,
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to write to clipboard:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to write to clipboard',
      };
    }
  }

  /**
   * Read text from clipboard
   */
  static async read(): Promise<ClipboardResult> {
    try {
      const result = await Clipboard.read();

      return {
        success: true,
        text: result.value,
      };
    } catch (error) {
      console.error('Failed to read from clipboard:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to read from clipboard',
      };
    }
  }

  /**
   * Copy message text (convenience method)
   */
  static async copyMessage(text: string): Promise<ClipboardResult> {
    return this.write({ text });
  }
}
