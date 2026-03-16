import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { PlusApiResultListLong, PlusApiResultPageVoteDetailVO, PlusApiResultVoid, PlusApiResultVoteDetailVO, PlusApiResultVoteStatisticsVO, PlusApiResultVoteStatusVO, PlusApiResultVoteVO, VoteForm } from '../types';


export class VoteApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 投票 */
  async vote(body: VoteForm): Promise<PlusApiResultVoteVO> {
    return this.client.post<PlusApiResultVoteVO>(appApiPath(`/vote`), body);
  }

/** 取消投票 */
  async cancel(params?: QueryParams): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/vote`), params);
  }

/** 切换投票 */
  async toggle(body: VoteForm): Promise<PlusApiResultVoteVO> {
    return this.client.post<PlusApiResultVoteVO>(appApiPath(`/vote/toggle`), body);
  }

/** 点赞 */
  async like(params?: QueryParams): Promise<PlusApiResultVoteVO> {
    return this.client.post<PlusApiResultVoteVO>(appApiPath(`/vote/like`), undefined, params);
  }

/** 点踩 */
  async dislike(params?: QueryParams): Promise<PlusApiResultVoteVO> {
    return this.client.post<PlusApiResultVoteVO>(appApiPath(`/vote/dislike`), undefined, params);
  }

/** 获取投票详情 */
  async getVoteDetail(voteId: string | number): Promise<PlusApiResultVoteDetailVO> {
    return this.client.get<PlusApiResultVoteDetailVO>(appApiPath(`/vote/${voteId}`));
  }

/** 获取热门内容 */
  async getTopLikedContent(params?: QueryParams): Promise<PlusApiResultListLong> {
    return this.client.get<PlusApiResultListLong>(appApiPath(`/vote/top-liked`), params);
  }

/** 获取投票状态 */
  async getVoteStatus(params?: QueryParams): Promise<PlusApiResultVoteStatusVO> {
    return this.client.get<PlusApiResultVoteStatusVO>(appApiPath(`/vote/status`), params);
  }

/** 获取投票统计 */
  async getVoteStatistics(params?: QueryParams): Promise<PlusApiResultVoteStatisticsVO> {
    return this.client.get<PlusApiResultVoteStatisticsVO>(appApiPath(`/vote/statistics`), params);
  }

/** 获取我的投票历史 */
  async getMyVotes(params?: QueryParams): Promise<PlusApiResultPageVoteDetailVO> {
    return this.client.get<PlusApiResultPageVoteDetailVO>(appApiPath(`/vote/my-votes`), params);
  }
}

export function createVoteApi(client: HttpClient): VoteApi {
  return new VoteApi(client);
}
