import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { DriveBatchDeleteForm, DriveContentUpdateForm, DriveCopyForm, DriveFolderCreateForm, DriveMoveForm, DriveRenameForm, DriveUploadCompleteForm, DriveUploadInitForm, PlusApiResultDriveContentVO, PlusApiResultDriveItemDetailVO, PlusApiResultDriveItemVO, PlusApiResultDriveUploadInitVO, PlusApiResultPageDriveItemVO, PlusApiResultVoid } from '../types';


export class DriveApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** Restore drive item */
  async restoreItem(itemId: string | number): Promise<PlusApiResultDriveItemVO> {
    return this.client.put<PlusApiResultDriveItemVO>(appApiPath(`/drive/items/${itemId}/restore`));
  }

/** Rename drive item */
  async renameItem(itemId: string | number, body: DriveRenameForm): Promise<PlusApiResultDriveItemVO> {
    return this.client.put<PlusApiResultDriveItemVO>(appApiPath(`/drive/items/${itemId}/rename`), body);
  }

/** Move drive item */
  async moveItem(itemId: string | number, body: DriveMoveForm): Promise<PlusApiResultDriveItemVO> {
    return this.client.put<PlusApiResultDriveItemVO>(appApiPath(`/drive/items/${itemId}/move`), body);
  }

/** Get drive file content */
  async getItemContent(itemId: string | number): Promise<PlusApiResultDriveContentVO> {
    return this.client.get<PlusApiResultDriveContentVO>(appApiPath(`/drive/items/${itemId}/content`));
  }

/** Update drive file content */
  async updateItemContent(itemId: string | number, body: DriveContentUpdateForm): Promise<PlusApiResultDriveContentVO> {
    return this.client.put<PlusApiResultDriveContentVO>(appApiPath(`/drive/items/${itemId}/content`), body);
  }

/** Archive drive item */
  async archiveItem(itemId: string | number): Promise<PlusApiResultDriveItemVO> {
    return this.client.put<PlusApiResultDriveItemVO>(appApiPath(`/drive/items/${itemId}/archive`));
  }

/** Favorite drive item */
  async favoriteItem(itemId: string | number): Promise<PlusApiResultDriveItemVO> {
    return this.client.post<PlusApiResultDriveItemVO>(appApiPath(`/drive/items/${itemId}/favorite`));
  }

/** Unfavorite drive item */
  async unfavoriteItem(itemId: string | number): Promise<PlusApiResultDriveItemVO> {
    return this.client.delete<PlusApiResultDriveItemVO>(appApiPath(`/drive/items/${itemId}/favorite`));
  }

/** Copy drive item */
  async copyItem(itemId: string | number, body: DriveCopyForm): Promise<PlusApiResultDriveItemVO> {
    return this.client.post<PlusApiResultDriveItemVO>(appApiPath(`/drive/items/${itemId}/copy`), body);
  }

/** Batch delete drive items */
  async batchDeleteItems(body: DriveBatchDeleteForm): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/drive/items/batch-delete`), body);
  }

/** Create drive folder */
  async createFolder(body: DriveFolderCreateForm): Promise<PlusApiResultDriveItemVO> {
    return this.client.post<PlusApiResultDriveItemVO>(appApiPath(`/drive/folders`), body);
  }

/** List drive items */
  async listItems(params?: QueryParams): Promise<PlusApiResultPageDriveItemVO> {
    return this.client.get<PlusApiResultPageDriveItemVO>(appApiPath(`/drive/items`), params);
  }

/** Get drive item detail */
  async getItemDetail(itemId: string | number): Promise<PlusApiResultDriveItemDetailVO> {
    return this.client.get<PlusApiResultDriveItemDetailVO>(appApiPath(`/drive/items/${itemId}`));
  }

/** Delete drive item */
  async deleteItem(itemId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/drive/items/${itemId}`));
  }

/** Upload file directly into drive */
  async uploadItem(body: FormData): Promise<PlusApiResultDriveItemVO> {
    return this.client.post<PlusApiResultDriveItemVO>(appApiPath(`/drive/items/upload`), body);
  }

/** Initialize resumable drive upload */
  async initUpload(body: DriveUploadInitForm): Promise<PlusApiResultDriveUploadInitVO> {
    return this.client.post<PlusApiResultDriveUploadInitVO>(appApiPath(`/drive/items/upload/init`), body);
  }

/** Complete resumable upload and create drive item */
  async completeUpload(uploadId: string | number, body: DriveUploadCompleteForm): Promise<PlusApiResultDriveItemVO> {
    return this.client.post<PlusApiResultDriveItemVO>(appApiPath(`/drive/items/upload/${uploadId}/complete`), body);
  }
}

export function createDriveApi(client: HttpClient): DriveApi {
  return new DriveApi(client);
}
