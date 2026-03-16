import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { AssetMoveForm, AssetRenameForm, FolderCreateForm, PlusApiResultAssetDetailVO, PlusApiResultAssetStatisticsVO, PlusApiResultDownloadUrlVO, PlusApiResultFolderVO, PlusApiResultListFolderVO, PlusApiResultPageAssetVO, PlusApiResultVoid } from '../types';


export class AssetsApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 重命名资产 */
  async renameAsset(assetId: string | number, body: AssetRenameForm): Promise<PlusApiResultVoid> {
    return this.client.put<PlusApiResultVoid>(appApiPath(`/assets/${assetId}/rename`), body);
  }

/** 移动资产 */
  async moveAsset(assetId: string | number, body: AssetMoveForm): Promise<PlusApiResultVoid> {
    return this.client.put<PlusApiResultVoid>(appApiPath(`/assets/${assetId}/move`), body);
  }

/** 收藏资产 */
  async favoriteAsset(assetId: string | number): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/assets/${assetId}/favorite`));
  }

/** 取消收藏 */
  async unfavoriteAsset(assetId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/assets/${assetId}/favorite`));
  }

/** 获取文件夹列表 */
  async listFolders(): Promise<PlusApiResultListFolderVO> {
    return this.client.get<PlusApiResultListFolderVO>(appApiPath(`/assets/folders`));
  }

/** 创建文件夹 */
  async createFolder(body: FolderCreateForm): Promise<PlusApiResultFolderVO> {
    return this.client.post<PlusApiResultFolderVO>(appApiPath(`/assets/folders`), body);
  }

/** 获取资产列表 */
  async listAssets(params?: QueryParams): Promise<PlusApiResultPageAssetVO> {
    return this.client.get<PlusApiResultPageAssetVO>(appApiPath(`/assets`), params);
  }

/** 获取资产详情 */
  async getAssetDetail(assetId: string | number): Promise<PlusApiResultAssetDetailVO> {
    return this.client.get<PlusApiResultAssetDetailVO>(appApiPath(`/assets/${assetId}`));
  }

/** 删除资产 */
  async deleteAsset(assetId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/assets/${assetId}`));
  }

/** 下载资产 */
  async getDownloadUrl(assetId: string | number, params?: QueryParams): Promise<PlusApiResultDownloadUrlVO> {
    return this.client.get<PlusApiResultDownloadUrlVO>(appApiPath(`/assets/${assetId}/download`), params);
  }

/** 获取资产统计 */
  async getStatistics(): Promise<PlusApiResultAssetStatisticsVO> {
    return this.client.get<PlusApiResultAssetStatisticsVO>(appApiPath(`/assets/statistics`));
  }

/** 删除文件夹 */
  async deleteFolder(folderId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/assets/folders/${folderId}`));
  }

/** 批量删除资产 */
  async batchDelete(): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/assets/batch`));
  }
}

export function createAssetsApi(client: HttpClient): AssetsApi {
  return new AssetsApi(client);
}
