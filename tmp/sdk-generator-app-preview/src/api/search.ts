import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { AdvancedSearchRequest, PlusApiResultGlobalSearchVO, PlusApiResultListHotSearchVO, PlusApiResultListSearchHistoryVO, PlusApiResultListSearchSuggestionVO, PlusApiResultPageAssetSearchResult, PlusApiResultPageNoteSearchResult, PlusApiResultPageProjectSearchResult, PlusApiResultPageSearchResult, PlusApiResultPageUserSearchResult, PlusApiResultSearchFiltersVO, PlusApiResultSearchStatisticsVO, PlusApiResultVoid, SearchHistoryAddRequest } from '../types';


export class SearchApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 搜索历史 */
  async getSearchHistory(params?: QueryParams): Promise<PlusApiResultListSearchHistoryVO> {
    return this.client.get<PlusApiResultListSearchHistoryVO>(appApiPath(`/search/history`), params);
  }

/** 添加搜索历史 */
  async addSearchHistory(body: SearchHistoryAddRequest): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/search/history`), body);
  }

/** 清空搜索历史 */
  async clearSearchHistory(): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/search/history`));
  }

/** 高级搜索 */
  async advanced(body: AdvancedSearchRequest): Promise<PlusApiResultPageSearchResult> {
    return this.client.post<PlusApiResultPageSearchResult>(appApiPath(`/search/advanced`), body);
  }

/** 全局搜索 */
  async global(params?: QueryParams): Promise<PlusApiResultGlobalSearchVO> {
    return this.client.get<PlusApiResultGlobalSearchVO>(appApiPath(`/search`), params);
  }

/** 搜索用户 */
  async users(params?: QueryParams): Promise<PlusApiResultPageUserSearchResult> {
    return this.client.get<PlusApiResultPageUserSearchResult>(appApiPath(`/search/users`), params);
  }

/** 搜索建议 */
  async getSearchSuggestions(params?: QueryParams): Promise<PlusApiResultListSearchSuggestionVO> {
    return this.client.get<PlusApiResultListSearchSuggestionVO>(appApiPath(`/search/suggestions`), params);
  }

/** 搜索统计 */
  async getSearchStatistics(): Promise<PlusApiResultSearchStatisticsVO> {
    return this.client.get<PlusApiResultSearchStatisticsVO>(appApiPath(`/search/statistics`));
  }

/** 搜索项目 */
  async projects(params?: QueryParams): Promise<PlusApiResultPageProjectSearchResult> {
    return this.client.get<PlusApiResultPageProjectSearchResult>(appApiPath(`/search/projects`), params);
  }

/** 搜索笔记 */
  async notes(params?: QueryParams): Promise<PlusApiResultPageNoteSearchResult> {
    return this.client.get<PlusApiResultPageNoteSearchResult>(appApiPath(`/search/notes`), params);
  }

/** 热门搜索 */
  async getHotSearches(params?: QueryParams): Promise<PlusApiResultListHotSearchVO> {
    return this.client.get<PlusApiResultListHotSearchVO>(appApiPath(`/search/hot`), params);
  }

/** 筛选条件 */
  async getSearchFilters(params?: QueryParams): Promise<PlusApiResultSearchFiltersVO> {
    return this.client.get<PlusApiResultSearchFiltersVO>(appApiPath(`/search/filters`), params);
  }

/** 搜索资源 */
  async assets(params?: QueryParams): Promise<PlusApiResultPageAssetSearchResult> {
    return this.client.get<PlusApiResultPageAssetSearchResult>(appApiPath(`/search/assets`), params);
  }

/** 删除搜索历史 */
  async deleteSearchHistory(keyword: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/search/history/${keyword}`));
  }
}

export function createSearchApi(client: HttpClient): SearchApi {
  return new SearchApi(client);
}
