import type { BaseEntity } from '@sdkwork/react-mobile-core';

export type FileType = 'image' | 'video' | 'document' | 'audio' | 'folder';

export interface DriveFile extends BaseEntity {
  name: string;
  type: FileType;
  size: number;
  url?: string;
  parentId: string | null;
}

export interface DriveStats {
  total: number;
  used: number;
  image: number;
  video: number;
  document: number;
  audio: number;
  other: number;
}

export interface DriveState {
  files: DriveFile[];
  currentFolder: string | null;
  stats: DriveStats | null;
  isLoading: boolean;
  error: string | null;
}

export interface IFileService {
  getFiles(parentId?: string | null): Promise<DriveFile[]>;
  uploadFile(file: File, parentId?: string | null): Promise<DriveFile>;
  deleteFile(id: string): Promise<void>;
  getStats(): Promise<DriveStats>;
}
