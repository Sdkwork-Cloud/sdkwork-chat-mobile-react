import { AbstractStorageService, resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { DriveFile, DriveStats, FileType, IFileService } from '../types';
import { createDriveSdkService } from './DriveSdkService';
import type { IDriveSdkService } from './DriveSdkService';

const TAG = 'FileService';

const createSeedFiles = (now: number): Partial<DriveFile>[] => [
  { id: 'f1', name: 'Work Docs', type: 'folder', size: 0, parentId: null, createTime: now, updateTime: now },
  { id: 'f2', name: 'Personal Photos', type: 'folder', size: 0, parentId: null, createTime: now, updateTime: now },
  { id: 'f3', name: 'ProjectSpec.pdf', type: 'document', size: 2.5 * 1024 * 1024, parentId: 'f1', createTime: now, updateTime: now },
  { id: 'f4', name: 'MeetingAudio.mp3', type: 'audio', size: 15 * 1024 * 1024, parentId: 'f1', createTime: now, updateTime: now },
  { id: 'f5', name: 'Scenery.jpg', type: 'image', size: 3.2 * 1024 * 1024, parentId: 'f2', createTime: now, updateTime: now },
];

class FileServiceImpl extends AbstractStorageService<DriveFile> implements IFileService {
  protected STORAGE_KEY = 'sys_drive_files_v1';
  private readonly deps: ServiceFactoryRuntimeDeps;
  private readonly sdkService: IDriveSdkService;

  constructor(deps?: ServiceFactoryDeps) {
    super();
    this.deps = resolveServiceFactoryRuntimeDeps(deps);
    this.sdkService = createDriveSdkService(deps);
  }

  protected async onInitialize() {
    const list = this.cache || [];
    if (list.length === 0 && !this.sdkService.hasSdkBaseUrl()) {
      this.cache = createSeedFiles(this.deps.clock.now()) as DriveFile[];
      await this.commit();
      this.deps.logger.info(TAG, 'Mock files initialized');
    }
  }

  async getFiles(parentId: string | null = null): Promise<DriveFile[]> {
    const remoteFiles = await this.sdkService.listFiles(parentId);
    if (remoteFiles !== null) {
      return [...remoteFiles].sort((a, b) => b.createTime - a.createTime);
    }

    const list = await this.findAll({
      sort: { field: 'createTime', order: 'desc' },
    });
    return (list.content || []).filter((f) => f.parentId === parentId);
  }

  async uploadFile(file: File, parentId: string | null = null): Promise<DriveFile> {
    const remoteFile = await this.sdkService.uploadFile(file, parentId);
    if (remoteFile) {
      await this.save(remoteFile);
      this.deps.logger.info(TAG, 'File uploaded through SDK', { fileId: remoteFile.id });
      return remoteFile;
    }

    const now = this.deps.clock.now();
    const type = this.getFileType(file.type);

    const newFile: DriveFile = {
      id: this.deps.idGenerator.next('file'),
      name: file.name,
      type,
      size: file.size,
      parentId,
      createTime: now,
      updateTime: now,
    };

    await this.save(newFile);
    this.deps.logger.info(TAG, 'File uploaded', { fileId: newFile.id });
    return newFile;
  }

  async deleteFile(id: string): Promise<void> {
    const remoteResult = await this.sdkService.deleteFile(id);
    if (remoteResult === false) {
      this.deps.logger.warn(TAG, 'SDK deleteFile returned business failure, fallback to local delete', { id });
    }

    await this.deleteById(id);
    this.deps.logger.info(TAG, remoteResult ? 'File deleted through SDK' : 'File deleted', { fileId: id });
  }

  async getStats(): Promise<DriveStats> {
    const remoteStats = await this.sdkService.getStats();
    if (remoteStats) {
      return remoteStats;
    }

    const list = await this.findAll();
    const files = list.content.filter((f) => f.type !== 'folder');

    const stats: DriveStats = {
      total: 10737418240,
      used: files.reduce((sum, f) => sum + f.size, 0),
      image: files.filter((f) => f.type === 'image').reduce((sum, f) => sum + f.size, 0),
      video: files.filter((f) => f.type === 'video').reduce((sum, f) => sum + f.size, 0),
      document: files.filter((f) => f.type === 'document').reduce((sum, f) => sum + f.size, 0),
      audio: files.filter((f) => f.type === 'audio').reduce((sum, f) => sum + f.size, 0),
      other: files.filter((f) => !['image', 'video', 'document', 'audio'].includes(f.type)).reduce((sum, f) => sum + f.size, 0),
    };

    return stats;
  }

  private getFileType(mimeType: string): FileType {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document')) return 'document';
    return 'document';
  }
}

export function createFileService(_deps?: ServiceFactoryDeps): IFileService {
  return new FileServiceImpl(_deps);
}

export const fileService: IFileService = createFileService();
