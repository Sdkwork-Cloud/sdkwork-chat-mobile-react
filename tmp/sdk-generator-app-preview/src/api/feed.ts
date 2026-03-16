import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { FeedCreateForm, PlusApiResultBoolean, PlusApiResultFeedItemVO, PlusApiResultListFeedItemVO } from '../types';


export class FeedApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** Create feed */
  async create(body: FeedCreateForm): Promise<PlusApiResultFeedItemVO> {
    return this.client.post<PlusApiResultFeedItemVO>(appApiPath(`/feeds`), body);
  }

/** Unlike feed */
  async unlike(id: string | number): Promise<PlusApiResultFeedItemVO> {
    return this.client.post<PlusApiResultFeedItemVO>(appApiPath(`/feeds/unlike/${id}`));
  }

/** Uncollect feed */
  async uncollect(id: string | number): Promise<PlusApiResultFeedItemVO> {
    return this.client.post<PlusApiResultFeedItemVO>(appApiPath(`/feeds/uncollect/${id}`));
  }

/** Share feed */
  async share(id: string | number): Promise<PlusApiResultFeedItemVO> {
    return this.client.post<PlusApiResultFeedItemVO>(appApiPath(`/feeds/share/${id}`));
  }

/** Like feed */
  async like(id: string | number): Promise<PlusApiResultFeedItemVO> {
    return this.client.post<PlusApiResultFeedItemVO>(appApiPath(`/feeds/like/${id}`));
  }

/** Collect feed */
  async collect(id: string | number, params?: QueryParams): Promise<PlusApiResultFeedItemVO> {
    return this.client.post<PlusApiResultFeedItemVO>(appApiPath(`/feeds/collect/${id}`), undefined, params);
  }

/** Get top feeds */
  async getTopFeeds(params?: QueryParams): Promise<PlusApiResultListFeedItemVO> {
    return this.client.get<PlusApiResultListFeedItemVO>(appApiPath(`/feeds/top`), params);
  }

/** Search feeds */
  async searchFeeds(params?: QueryParams): Promise<PlusApiResultListFeedItemVO> {
    return this.client.get<PlusApiResultListFeedItemVO>(appApiPath(`/feeds/search`), params);
  }

/** Get recommended feeds */
  async getRecommendedFeeds(params?: QueryParams): Promise<PlusApiResultListFeedItemVO> {
    return this.client.get<PlusApiResultListFeedItemVO>(appApiPath(`/feeds/recommend`), params);
  }

/** Get most viewed feeds */
  async getMostViewedFeeds(params?: QueryParams): Promise<PlusApiResultListFeedItemVO> {
    return this.client.get<PlusApiResultListFeedItemVO>(appApiPath(`/feeds/most-viewed`), params);
  }

/** Get most liked feeds */
  async getMostLikedFeeds(params?: QueryParams): Promise<PlusApiResultListFeedItemVO> {
    return this.client.get<PlusApiResultListFeedItemVO>(appApiPath(`/feeds/most-liked`), params);
  }

/** Get feed list */
  async getFeedList(params?: QueryParams): Promise<PlusApiResultListFeedItemVO> {
    return this.client.get<PlusApiResultListFeedItemVO>(appApiPath(`/feeds/list`), params);
  }

/** Get hot feeds */
  async getHotFeeds(params?: QueryParams): Promise<PlusApiResultListFeedItemVO> {
    return this.client.get<PlusApiResultListFeedItemVO>(appApiPath(`/feeds/hot`), params);
  }

/** Get feed detail */
  async getFeedDetail(id: string | number): Promise<PlusApiResultFeedItemVO> {
    return this.client.get<PlusApiResultFeedItemVO>(appApiPath(`/feeds/detail/${id}`));
  }

/** Check collected status */
  async checkCollected(id: string | number): Promise<PlusApiResultBoolean> {
    return this.client.get<PlusApiResultBoolean>(appApiPath(`/feeds/check-collected/${id}`));
  }

/** Get feeds by category */
  async getFeedsByCategory(categoryId: string | number, params?: QueryParams): Promise<PlusApiResultListFeedItemVO> {
    return this.client.get<PlusApiResultListFeedItemVO>(appApiPath(`/feeds/category/${categoryId}`), params);
  }

/** Delete feed */
  async delete(id: string | number): Promise<PlusApiResultBoolean> {
    return this.client.delete<PlusApiResultBoolean>(appApiPath(`/feeds/${id}`));
  }
}

export function createFeedApi(client: HttpClient): FeedApi {
  return new FeedApi(client);
}
