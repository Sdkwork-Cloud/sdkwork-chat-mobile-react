import { APP_SDK_AUTH_TOKEN_STORAGE_KEY, createAppSdkCoreConfig, getAppSdkCoreClientWithSession, resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { SdkworkAppClient } from '@sdkwork/app-sdk';
import type { DriveFile, DriveStats, FileType } from '../types';

const TAG = 'DriveSdkService';

interface SdkApiResult<T> {
  data: T;
  code: string;
  msg: string;
  requestId?: string;
}

interface SdkDriveItemVO {
  id?: string | number;
  itemId?: string | number;
  itemUuid?: string;
  name?: string;
  itemName?: string;
  filename?: string;
  type?: string;
  fileType?: string;
  mimeType?: string;
  size?: number | string;
  url?: string;
  parentId?: string | number | null;
  parentItemId?: string | number | null;
  createTime?: number | string;
  updateTime?: number | string;
  createdAt?: number | string;
  updatedAt?: number | string;
  resource?: {
    url?: string;
  };
}

interface SdkFileVO {
  fileId?: string;
  fileName?: string;
  fileSize?: number;
  accessUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface SdkFileSystemDiskVO {
  totalSize?: number | string;
  usedSize?: number | string;
  usageRate?: number | string;
  fileCount?: number | string;
}

interface DriveFileFallback {
  id?: string;
  name?: string;
  parentId?: string | null;
  size?: number;
  url?: string;
  createTime?: number;
  updateTime?: number;
}

export interface IDriveSdkService {
  hasSdkBaseUrl(): boolean;
  listFiles(parentId: string | null): Promise<DriveFile[] | null>;
  uploadFile(file: File, parentId: string | null): Promise<DriveFile | null>;
  deleteFile(id: string): Promise<boolean | null>;
  getStats(): Promise<DriveStats | null>;
}

class DriveSdkServiceImpl implements IDriveSdkService {
  private readonly deps: ServiceFactoryRuntimeDeps;

  constructor(deps?: ServiceFactoryDeps) {
    this.deps = resolveServiceFactoryRuntimeDeps(deps);
  }

  private async getClient(): Promise<SdkworkAppClient> {
    return getAppSdkCoreClientWithSession({
      storage: this.deps.storage,
      authStorageKey: APP_SDK_AUTH_TOKEN_STORAGE_KEY,
    });
  }

  hasSdkBaseUrl(): boolean {
    return (createAppSdkCoreConfig().baseUrl || '').trim().length > 0;
  }

  private isSuccessCode(code: string | undefined): boolean {
    return code === '2000';
  }

  private toTimestamp(value: unknown, fallback: number): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = Date.parse(value);
      return Number.isNaN(parsed) ? fallback : parsed;
    }
    return fallback;
  }

  private toNumber(value: unknown, fallback = 0): number {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
    return fallback;
  }

  private normalizeFileType(type: string | undefined, mimeType: string | undefined): FileType {
    const rawType = (type || '').toLowerCase();
    const rawMime = (mimeType || '').toLowerCase();

    const typeMapping: Record<string, FileType> = {
      image: 'image',
      video: 'video',
      audio: 'audio',
      document: 'document',
      doc: 'document',
      folder: 'folder',
      directory: 'folder',
      file: 'document',
    };
    if (typeMapping[rawType]) return typeMapping[rawType];

    if (rawMime.startsWith('image/')) return 'image';
    if (rawMime.startsWith('video/')) return 'video';
    if (rawMime.startsWith('audio/')) return 'audio';
    return 'document';
  }

  private extractDriveItemList(data: unknown): SdkDriveItemVO[] {
    if (Array.isArray(data)) return data as SdkDriveItemVO[];
    if (data && typeof data === 'object') {
      const source = data as Record<string, unknown>;
      const keys = ['list', 'items', 'records', 'content'];
      for (const key of keys) {
        const value = source[key];
        if (Array.isArray(value)) return value as SdkDriveItemVO[];
      }
    }
    return [];
  }

  private mapRemoteDriveFile(remote: SdkDriveItemVO | null | undefined, fallback?: DriveFileFallback): DriveFile | null {
    if (!remote || typeof remote !== 'object') return null;

    const idRaw = remote.id ?? remote.itemId ?? remote.itemUuid ?? fallback?.id;
    if (idRaw === undefined || idRaw === null) return null;

    const now = this.deps.clock.now();
    const name = (remote.itemName || remote.name || remote.filename || fallback?.name || '').trim();
    if (!name) return null;

    const parentRaw = remote.parentId ?? remote.parentItemId ?? fallback?.parentId ?? null;
    const parentId = parentRaw === null || parentRaw === undefined ? null : String(parentRaw);
    const type = this.normalizeFileType(remote.fileType || remote.type, remote.mimeType);

    return {
      id: String(idRaw),
      name,
      type,
      size: this.toNumber(remote.size, fallback?.size || 0),
      url: (remote.resource?.url || remote.url || fallback?.url || '').trim() || undefined,
      parentId,
      createTime: this.toTimestamp(remote.createTime ?? remote.createdAt, fallback?.createTime || now),
      updateTime: this.toTimestamp(remote.updateTime ?? remote.updatedAt, now),
    } as DriveFile;
  }

  private mapUploadFile(upload: SdkFileVO, file: File, parentId: string | null): DriveFile {
    const now = this.deps.clock.now();
    return {
      id: upload.fileId || this.deps.idGenerator.next('drive_upload'),
      name: upload.fileName || file.name,
      type: this.normalizeFileType(undefined, file.type),
      size: this.toNumber(upload.fileSize, file.size),
      url: (upload.accessUrl || '').trim() || undefined,
      parentId,
      createTime: this.toTimestamp(upload.createdAt, now),
      updateTime: this.toTimestamp(upload.updatedAt, now),
    } as DriveFile;
  }

  private async fileToBase64DataUrl(file: File): Promise<string | null> {
    if (typeof FileReader === 'undefined') {
      return null;
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const value = typeof reader.result === 'string' ? reader.result : '';
        resolve(value || null);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }

  async listFiles(parentId: string | null): Promise<DriveFile[] | null> {
    if (!this.hasSdkBaseUrl()) return null;

    try {
      const client = await this.getClient();
      const result = await client.drive.listItems({
        parentId: parentId || undefined,
        page: 0,
        size: 200,
      }) as SdkApiResult<unknown>;
      if (!this.isSuccessCode(result.code)) {
        this.deps.logger.warn(TAG, 'SDK listFiles business failure', { code: result.code, message: result.msg });
        return null;
      }

      return this.extractDriveItemList(result.data)
        .map((item) => this.mapRemoteDriveFile(item))
        .filter((item): item is DriveFile => item !== null);
    } catch (error) {
      this.deps.logger.warn(TAG, 'SDK listFiles request failed', error);
      return null;
    }
  }

  async uploadFile(file: File, parentId: string | null): Promise<DriveFile | null> {
    if (!this.hasSdkBaseUrl()) return null;

    try {
      const client = await this.getClient();
      const fileData = await this.fileToBase64DataUrl(file);
      if (!fileData) {
        this.deps.logger.warn(TAG, 'SDK uploadFile file conversion failed');
        return null;
      }

      const uploadResult = await client.upload.file({ file: fileData }) as SdkApiResult<SdkFileVO>;
      if (!this.isSuccessCode(uploadResult.code) || !uploadResult.data) {
        this.deps.logger.warn(TAG, 'SDK upload register business failure', {
          code: uploadResult.code,
          message: uploadResult.msg
        });
        return null;
      }
      return this.mapUploadFile(uploadResult.data, file, parentId);
    } catch (error) {
      this.deps.logger.warn(TAG, 'SDK uploadFile request failed', error);
      return null;
    }
  }

  async deleteFile(id: string): Promise<boolean | null> {
    if (!this.hasSdkBaseUrl()) return null;

    try {
      const client = await this.getClient();
      const result = await client.drive.deleteItem(id) as SdkApiResult<unknown>;
      if (!this.isSuccessCode(result.code)) {
        this.deps.logger.warn(TAG, 'SDK deleteFile business failure', { code: result.code, message: result.msg, id });
        return false;
      }
      return true;
    } catch (error) {
      this.deps.logger.warn(TAG, 'SDK deleteFile request failed', { id, error });
      return false;
    }
  }

  async getStats(): Promise<DriveStats | null> {
    if (!this.hasSdkBaseUrl()) return null;

    try {
      const client = await this.getClient();
      const result = await client.fileSystem.getPrimaryDisk() as SdkApiResult<SdkFileSystemDiskVO>;
      if (!this.isSuccessCode(result.code)) {
        this.deps.logger.warn(TAG, 'SDK getStats business failure', { code: result.code, message: result.msg });
        return null;
      }

      const total = this.toNumber(result.data?.totalSize, 0);
      const used = this.toNumber(result.data?.usedSize ?? result.data?.usageRate, 0);
      return {
        total,
        used,
        image: 0,
        video: 0,
        document: 0,
        audio: 0,
        other: 0,
      };
    } catch (error) {
      this.deps.logger.warn(TAG, 'SDK getStats request failed', { error });
      return null;
    }
  }
}

export function createDriveSdkService(_deps?: ServiceFactoryDeps): IDriveSdkService {
  return new DriveSdkServiceImpl(_deps);
}

export const driveSdkService: IDriveSdkService = createDriveSdkService();
