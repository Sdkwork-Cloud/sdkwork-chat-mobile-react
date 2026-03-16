import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { CommentCreateForm, CommentReplyForm, PlusApiResultCommentDetailVO, PlusApiResultCommentStatisticsVO, PlusApiResultCommentVO, PlusApiResultPageCommentVO, PlusApiResultVoid } from '../types';


export class CommentsApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 发表评论 */
  async createComment(body: CommentCreateForm): Promise<PlusApiResultCommentVO> {
    return this.client.post<PlusApiResultCommentVO>(appApiPath(`/comments`), body);
  }

/** 回复评论 */
  async replyComment(commentId: string | number, body: CommentReplyForm): Promise<PlusApiResultCommentVO> {
    return this.client.post<PlusApiResultCommentVO>(appApiPath(`/comments/${commentId}/reply`), body);
  }

/** 置顶评论 */
  async pinComment(commentId: string | number): Promise<PlusApiResultCommentVO> {
    return this.client.post<PlusApiResultCommentVO>(appApiPath(`/comments/${commentId}/pin`));
  }

/** 取消置顶 */
  async unpinComment(commentId: string | number): Promise<PlusApiResultCommentVO> {
    return this.client.delete<PlusApiResultCommentVO>(appApiPath(`/comments/${commentId}/pin`));
  }

/** 点赞评论 */
  async likeComment(commentId: string | number): Promise<PlusApiResultCommentVO> {
    return this.client.post<PlusApiResultCommentVO>(appApiPath(`/comments/${commentId}/like`));
  }

/** 取消点赞 */
  async unlikeComment(commentId: string | number): Promise<PlusApiResultCommentVO> {
    return this.client.delete<PlusApiResultCommentVO>(appApiPath(`/comments/${commentId}/like`));
  }

/** 获取评论详情 */
  async getCommentDetail(commentId: string | number): Promise<PlusApiResultCommentDetailVO> {
    return this.client.get<PlusApiResultCommentDetailVO>(appApiPath(`/comments/${commentId}`));
  }

/** 删除评论 */
  async deleteComment(commentId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/comments/${commentId}`));
  }

/** 获取回复列表 */
  async getReplies(commentId: string | number, params?: QueryParams): Promise<PlusApiResultPageCommentVO> {
    return this.client.get<PlusApiResultPageCommentVO>(appApiPath(`/comments/${commentId}/replies`), params);
  }

/** 获取评论统计 */
  async getCommentStatistics(params?: QueryParams): Promise<PlusApiResultCommentStatisticsVO> {
    return this.client.get<PlusApiResultCommentStatisticsVO>(appApiPath(`/comments/statistics`), params);
  }

/** 获取我的评论 */
  async getMy(params?: QueryParams): Promise<PlusApiResultPageCommentVO> {
    return this.client.get<PlusApiResultPageCommentVO>(appApiPath(`/comments/my`), params);
  }

/** 获取评论列表 */
  async getComments(params?: QueryParams): Promise<PlusApiResultPageCommentVO> {
    return this.client.get<PlusApiResultPageCommentVO>(appApiPath(`/comments/list`), params);
  }
}

export function createCommentsApi(client: HttpClient): CommentsApi {
  return new CommentsApi(client);
}
