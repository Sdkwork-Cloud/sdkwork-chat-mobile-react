import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import type { FileSystemOptions, FileResult, DirectoryResult, FileInfo } from '../types';

/**
 * File System Bridge
 * Encapsulates Capacitor Filesystem plugin for user data storage
 */
export class FileSystemBridge {
  private static readonly USER_DIRECTORY = 'user_data';

  /**
   * Get user data directory path
   */
  private static getUserPath(path: string): string {
    return `${this.USER_DIRECTORY}/${path}`;
  }

  /**
   * Write file to user data directory
   */
  static async writeFile(
    path: string,
    data: string,
    options?: FileSystemOptions
  ): Promise<FileResult> {
    try {
      const fullPath = this.getUserPath(path);
      
      // Ensure directory exists
      await this.ensureDirectory(this.USER_DIRECTORY);

      const result = await Filesystem.writeFile({
        path: fullPath,
        data,
        directory: Directory.Documents,
        encoding: options?.encoding ?? Encoding.UTF8,
        recursive: true,
      });

      return {
        success: true,
        uri: result.uri,
      };
    } catch (error) {
      console.error('Failed to write file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to write file',
      };
    }
  }

  /**
   * Read file from user data directory
   */
  static async readFile(path: string, options?: FileSystemOptions): Promise<FileResult> {
    try {
      const fullPath = this.getUserPath(path);
      
      const result = await Filesystem.readFile({
        path: fullPath,
        directory: Directory.Documents,
        encoding: options?.encoding ?? Encoding.UTF8,
      });

      return {
        success: true,
        data: result.data as string,
      };
    } catch (error) {
      console.error('Failed to read file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to read file',
      };
    }
  }

  /**
   * Delete file from user data directory
   */
  static async deleteFile(path: string): Promise<FileResult> {
    try {
      const fullPath = this.getUserPath(path);
      
      await Filesystem.deleteFile({
        path: fullPath,
        directory: Directory.Documents,
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to delete file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete file',
      };
    }
  }

  /**
   * Check if file exists
   */
  static async exists(path: string): Promise<boolean> {
    try {
      const fullPath = this.getUserPath(path);
      
      await Filesystem.stat({
        path: fullPath,
        directory: Directory.Documents,
      });
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Create directory
   */
  static async mkdir(path: string): Promise<FileResult> {
    try {
      const fullPath = this.getUserPath(path);
      
      await Filesystem.mkdir({
        path: fullPath,
        directory: Directory.Documents,
        recursive: true,
      });

      return {
        success: true,
      };
    } catch (error) {
      console.error('Failed to create directory:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create directory',
      };
    }
  }

  /**
   * Read directory contents
   */
  static async readdir(path: string): Promise<DirectoryResult> {
    try {
      const fullPath = this.getUserPath(path);
      
      const result = await Filesystem.readdir({
        path: fullPath,
        directory: Directory.Documents,
      });

      const files: FileInfo[] = result.files.map((f) => {
        if (typeof f === 'string') {
          return {
            name: f,
            type: 'unknown',
            size: 0,
            mtime: 0,
            uri: '',
          };
        }
        return {
          name: f.name,
          type: f.type as 'file' | 'directory' | 'unknown',
          size: f.size || 0,
          mtime: f.mtime || 0,
          uri: f.uri || '',
        };
      });

      return {
        success: true,
        files,
      };
    } catch (error) {
      console.error('Failed to read directory:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to read directory',
        files: [],
      };
    }
  }

  /**
   * Ensure directory exists
   */
  private static async ensureDirectory(path: string): Promise<void> {
    try {
      await Filesystem.mkdir({
        path,
        directory: Directory.Documents,
        recursive: true,
      });
    } catch {
      // Directory may already exist
    }
  }

  /**
   * Get file URI
   */
  static async getUri(path: string): Promise<string | null> {
    try {
      const fullPath = this.getUserPath(path);
      
      const result = await Filesystem.getUri({
        path: fullPath,
        directory: Directory.Documents,
      });

      return result.uri;
    } catch (error) {
      console.error('Failed to get URI:', error);
      return null;
    }
  }
}
