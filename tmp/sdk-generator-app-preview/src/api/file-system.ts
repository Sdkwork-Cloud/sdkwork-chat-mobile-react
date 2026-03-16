import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { FileSystemContentUpdateForm, FileSystemCopyForm, FileSystemFileCreateForm, FileSystemFolderCreateForm, FileSystemMoveForm, FileSystemRenameForm, PlusApiResultFileSystemContentVO, PlusApiResultFileSystemDiskVO, PlusApiResultFileSystemNodeVO, PlusApiResultListFileSystemDiskVO, PlusApiResultPageFileSystemNodeVO, PlusApiResultVoid } from '../types';


export class FileSystemApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** Rename node */
  async renameNode(nodeId: string | number, body: FileSystemRenameForm): Promise<PlusApiResultFileSystemNodeVO> {
    return this.client.put<PlusApiResultFileSystemNodeVO>(appApiPath(`/filesystem/nodes/${nodeId}/rename`), body);
  }

/** Move node */
  async moveNode(nodeId: string | number, body: FileSystemMoveForm): Promise<PlusApiResultFileSystemNodeVO> {
    return this.client.put<PlusApiResultFileSystemNodeVO>(appApiPath(`/filesystem/nodes/${nodeId}/move`), body);
  }

/** Get file content */
  async getFileContent(fileId: string | number): Promise<PlusApiResultFileSystemContentVO> {
    return this.client.get<PlusApiResultFileSystemContentVO>(appApiPath(`/filesystem/files/${fileId}/content`));
  }

/** Update file content */
  async updateFileContent(fileId: string | number, body: FileSystemContentUpdateForm): Promise<PlusApiResultFileSystemContentVO> {
    return this.client.put<PlusApiResultFileSystemContentVO>(appApiPath(`/filesystem/files/${fileId}/content`), body);
  }

/** Copy node */
  async copyNode(nodeId: string | number, body: FileSystemCopyForm): Promise<PlusApiResultFileSystemNodeVO> {
    return this.client.post<PlusApiResultFileSystemNodeVO>(appApiPath(`/filesystem/nodes/${nodeId}/copy`), body);
  }

/** Create folder */
  async createFolder(body: FileSystemFolderCreateForm): Promise<PlusApiResultFileSystemNodeVO> {
    return this.client.post<PlusApiResultFileSystemNodeVO>(appApiPath(`/filesystem/folders`), body);
  }

/** Create file */
  async createFile(body: FileSystemFileCreateForm): Promise<PlusApiResultFileSystemNodeVO> {
    return this.client.post<PlusApiResultFileSystemNodeVO>(appApiPath(`/filesystem/files`), body);
  }

/** List nodes */
  async listNodes(params?: QueryParams): Promise<PlusApiResultPageFileSystemNodeVO> {
    return this.client.get<PlusApiResultPageFileSystemNodeVO>(appApiPath(`/filesystem/nodes`), params);
  }

/** Get node detail */
  async getNodeDetail(nodeId: string | number): Promise<PlusApiResultFileSystemNodeVO> {
    return this.client.get<PlusApiResultFileSystemNodeVO>(appApiPath(`/filesystem/nodes/${nodeId}`));
  }

/** Delete node */
  async deleteNode(nodeId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/filesystem/nodes/${nodeId}`));
  }

/** List disks */
  async listDisks(): Promise<PlusApiResultListFileSystemDiskVO> {
    return this.client.get<PlusApiResultListFileSystemDiskVO>(appApiPath(`/filesystem/disks`));
  }

/** Get primary disk */
  async getPrimaryDisk(): Promise<PlusApiResultFileSystemDiskVO> {
    return this.client.get<PlusApiResultFileSystemDiskVO>(appApiPath(`/filesystem/disks/default`));
  }
}

export function createFileSystemApi(client: HttpClient): FileSystemApi {
  return new FileSystemApi(client);
}
