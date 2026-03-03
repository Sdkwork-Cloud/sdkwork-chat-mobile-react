import { useEffect } from 'react';
import { useDriveStore } from '../stores/driveStore';

export function useDrive() {
  const files = useDriveStore((state) => state.files);
  const currentFolder = useDriveStore((state) => state.currentFolder);
  const stats = useDriveStore((state) => state.stats);
  const isLoading = useDriveStore((state) => state.isLoading);
  const error = useDriveStore((state) => state.error);

  const loadFiles = useDriveStore((state) => state.loadFiles);
  const loadStats = useDriveStore((state) => state.loadStats);
  const setCurrentFolder = useDriveStore((state) => state.setCurrentFolder);
  const uploadFile = useDriveStore((state) => state.uploadFile);
  const deleteFile = useDriveStore((state) => state.deleteFile);

  useEffect(() => {
    void loadFiles();
    void loadStats();
  }, [loadFiles, loadStats]);

  return {
    files,
    currentFolder,
    stats,
    isLoading,
    error,
    loadFiles,
    loadStats,
    setCurrentFolder,
    uploadFile,
    deleteFile,
  };
}

export function useDriveStats() {
  const stats = useDriveStore((state) => state.stats);
  const loadStats = useDriveStore((state) => state.loadStats);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  return { stats };
}
