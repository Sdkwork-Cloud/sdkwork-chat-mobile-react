import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { FavoriteAddForm, FavoriteBatchCheckForm, FavoriteBatchMoveForm, FavoriteFolderCreateForm, FavoriteFolderUpdateForm, FavoriteMoveForm, PlusApiResultFavoriteCheckVO, PlusApiResultFavoriteDetailVO, PlusApiResultFavoriteFolderVO, PlusApiResultFavoriteStatisticsVO, PlusApiResultFavoriteVO, PlusApiResultListFavoriteCheckVO, PlusApiResultListFavoriteFolderVO, PlusApiResultListFavoriteItemVO, PlusApiResultListFavoriteTypeCountVO, PlusApiResultPageFavoriteItemVO, PlusApiResultVoid } from '../types';


export class FavoriteApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 移动收藏 */
  async moveFavoriteToFolder(favoriteId: string | number, body: FavoriteMoveForm): Promise<PlusApiResultFavoriteVO> {
    return this.client.put<PlusApiResultFavoriteVO>(appApiPath(`/favorite/${favoriteId}/move`), body);
  }

/** 更新收藏夹 */
  async updateFavoriteFolder(folderId: string | number, body: FavoriteFolderUpdateForm): Promise<PlusApiResultFavoriteFolderVO> {
    return this.client.put<PlusApiResultFavoriteFolderVO>(appApiPath(`/favorite/folders/${folderId}`), body);
  }

/** 删除收藏夹 */
  async deleteFavoriteFolder(folderId: string | number, params?: QueryParams): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/favorite/folders/${folderId}`), params);
  }

/** 批量移动收藏 */
  async batchMoveFavorites(body: FavoriteBatchMoveForm): Promise<PlusApiResultVoid> {
    return this.client.put<PlusApiResultVoid>(appApiPath(`/favorite/batch/move`), body);
  }

/** 收藏列表 */
  async listFavorites(params?: QueryParams): Promise<PlusApiResultPageFavoriteItemVO> {
    return this.client.get<PlusApiResultPageFavoriteItemVO>(appApiPath(`/favorite`), params);
  }

/** 添加收藏 */
  async add(body: FavoriteAddForm): Promise<PlusApiResultFavoriteVO> {
    return this.client.post<PlusApiResultFavoriteVO>(appApiPath(`/favorite`), body);
  }

/** 收藏夹列表 */
  async listFavoriteFolders(): Promise<PlusApiResultListFavoriteFolderVO> {
    return this.client.get<PlusApiResultListFavoriteFolderVO>(appApiPath(`/favorite/folders`));
  }

/** 创建收藏夹 */
  async createFavoriteFolder(body: FavoriteFolderCreateForm): Promise<PlusApiResultFavoriteFolderVO> {
    return this.client.post<PlusApiResultFavoriteFolderVO>(appApiPath(`/favorite/folders`), body);
  }

/** 批量检查收藏 */
  async batchCheckFavorites(body: FavoriteBatchCheckForm): Promise<PlusApiResultListFavoriteCheckVO> {
    return this.client.post<PlusApiResultListFavoriteCheckVO>(appApiPath(`/favorite/batch-check`), body);
  }

/** 收藏详情 */
  async getFavoriteDetail(favoriteId: string | number): Promise<PlusApiResultFavoriteDetailVO> {
    return this.client.get<PlusApiResultFavoriteDetailVO>(appApiPath(`/favorite/${favoriteId}`));
  }

/** 取消收藏 */
  async remove(favoriteId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/favorite/${favoriteId}`));
  }

/** 收藏统计 */
  async getFavoriteStatistics(): Promise<PlusApiResultFavoriteStatisticsVO> {
    return this.client.get<PlusApiResultFavoriteStatisticsVO>(appApiPath(`/favorite/statistics`));
  }

/** 最近收藏 */
  async getRecentFavorites(params?: QueryParams): Promise<PlusApiResultListFavoriteItemVO> {
    return this.client.get<PlusApiResultListFavoriteItemVO>(appApiPath(`/favorite/recent`), params);
  }

/** 各类型收藏数 */
  async getFavoriteCountByType(): Promise<PlusApiResultListFavoriteTypeCountVO> {
    return this.client.get<PlusApiResultListFavoriteTypeCountVO>(appApiPath(`/favorite/count/by-type`));
  }

/** 检查收藏状态 */
  async check(params?: QueryParams): Promise<PlusApiResultFavoriteCheckVO> {
    return this.client.get<PlusApiResultFavoriteCheckVO>(appApiPath(`/favorite/check`), params);
  }

/** 按目标取消收藏 */
  async removeFavoriteByTarget(params?: QueryParams): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/favorite/by-target`), params);
  }

/** 批量取消收藏 */
  async batchRemoveFavorites(): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/favorite/batch`));
  }
}

export function createFavoriteApi(client: HttpClient): FavoriteApi {
  return new FavoriteApi(client);
}
