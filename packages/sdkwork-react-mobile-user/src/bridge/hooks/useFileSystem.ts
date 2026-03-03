import { useState, useCallback } from 'react';
import { FileSystemBridge } from '../native/fileSystem';
import type { FileSystemOptions, FileResult, DirectoryResult, FileInfo } from '../types';

/**
 * File System Hook
 * Provides file system operations for user data
 */
export function useFileSystem() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<FileResult | null>(null);

  /**
   * Write file to user data directory
   */
  const writeFile = useCallback(async (
    path: string,
    data: string,
    options?: FileSystemOptions
  ): Promise<FileResult> => {
    setIsLoading(true);
    try {
      const result = await FileSystemBridge.writeFile(path, data, options);
      setLastResult(result);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Read file from user data directory
   */
  const readFile = useCallback(async (
    path: string,
    options?: FileSystemOptions
  ): Promise<FileResult> => {
    setIsLoading(true);
    try {
      const result = await FileSystemBridge.readFile(path, options);
      setLastResult(result);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Delete file from user data directory
   */
  const deleteFile = useCallback(async (path: string): Promise<FileResult> => {
    setIsLoading(true);
    try {
      const result = await FileSystemBridge.deleteFile(path);
      setLastResult(result);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Check if file exists
   */
  const exists = useCallback(async (path: string): Promise<boolean> => {
    return await FileSystemBridge.exists(path);
  }, []);

  /**
   * Create directory
   */
  const mkdir = useCallback(async (path: string): Promise<FileResult> => {
    setIsLoading(true);
    try {
      const result = await FileSystemBridge.mkdir(path);
      setLastResult(result);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Read directory contents
   */
  const readdir = useCallback(async (path: string): Promise<DirectoryResult> => {
    setIsLoading(true);
    try {
      return await FileSystemBridge.readdir(path);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get file URI
   */
  const getUri = useCallback(async (path: string): Promise<string | null> => {
    return await FileSystemBridge.getUri(path);
  }, []);

  /**
   * Save user avatar to file system
   */
  const saveAvatar = useCallback(async (userId: string, base64Data: string): Promise<FileResult> => {
    return writeFile(`avatars/${userId}.png`, base64Data);
  }, [writeFile]);

  /**
   * Load user avatar from file system
   */
  const loadAvatar = useCallback(async (userId: string): Promise<FileResult> => {
    return readFile(`avatars/${userId}.png`);
  }, [readFile]);

  return {
    isLoading,
    lastResult,
    writeFile,
    readFile,
    deleteFile,
    exists,
    mkdir,
    readdir,
    getUri,
    saveAvatar,
    loadAvatar,
  };
}
