import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { NewsCreateForm, NewsUpdateForm, PlusApiResultNewsDetailVO, PlusApiResultNewsVO, PlusApiResultPageNewsVO, PlusApiResultVoid } from '../types';


export class NewsApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 获取新闻详情 */
  async getNews(newsId: string | number): Promise<PlusApiResultNewsDetailVO> {
    return this.client.get<PlusApiResultNewsDetailVO>(appApiPath(`/news/${newsId}`));
  }

/** 更新新闻 */
  async updateNews(newsId: string | number, body: NewsUpdateForm): Promise<PlusApiResultNewsVO> {
    return this.client.put<PlusApiResultNewsVO>(appApiPath(`/news/${newsId}`), body);
  }

/** 删除新闻 */
  async deleteNews(newsId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/news/${newsId}`));
  }

/** 创建新闻 */
  async createNews(body: NewsCreateForm): Promise<PlusApiResultNewsVO> {
    return this.client.post<PlusApiResultNewsVO>(appApiPath(`/news`), body);
  }

/** 搜索新闻 */
  async search(params?: QueryParams): Promise<PlusApiResultPageNewsVO> {
    return this.client.get<PlusApiResultPageNewsVO>(appApiPath(`/news/search`), params);
  }

/** 获取我的新闻 */
  async getMy(params?: QueryParams): Promise<PlusApiResultPageNewsVO> {
    return this.client.get<PlusApiResultPageNewsVO>(appApiPath(`/news/my`), params);
  }

/** 获取最新新闻 */
  async getLatest(params?: QueryParams): Promise<PlusApiResultPageNewsVO> {
    return this.client.get<PlusApiResultPageNewsVO>(appApiPath(`/news/latest`), params);
  }

/** 获取分类新闻 */
  async getCategory(categoryId: string | number, params?: QueryParams): Promise<PlusApiResultPageNewsVO> {
    return this.client.get<PlusApiResultPageNewsVO>(appApiPath(`/news/category/${categoryId}`), params);
  }
}

export function createNewsApi(client: HttpClient): NewsApi {
  return new NewsApi(client);
}
