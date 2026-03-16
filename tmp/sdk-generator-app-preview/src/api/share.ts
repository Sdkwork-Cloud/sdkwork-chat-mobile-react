import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { InviteLinkForm, PlusApiResultInviteInfoVO, PlusApiResultInviteLinkVO, PlusApiResultInviteRewardClaimVO, PlusApiResultListSharePlatformVO, PlusApiResultPageInviteRecordVO, PlusApiResultPageShareRecordVO, PlusApiResultPageShareVisitorVO, PlusApiResultShareCreateVO, PlusApiResultShareInfoVO, PlusApiResultSharePosterVO, PlusApiResultShareRecordVO, PlusApiResultShareStatisticsVO, PlusApiResultShareVerifyVO, PlusApiResultVoid, ShareCreateForm, SharePosterForm, ShareTrackForm, ShareUpdateForm, ShareVerifyForm, ShareVisitForm } from '../types';


export class ShareApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 更新分享设置 */
  async updateShareSettings(shareId: string | number, body: ShareUpdateForm): Promise<PlusApiResultShareRecordVO> {
    return this.client.put<PlusApiResultShareRecordVO>(appApiPath(`/share/${shareId}`), body);
  }

/** 取消分享 */
  async cancel(shareId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/share/${shareId}`));
  }

/** 创建分享 */
  async createShare(body: ShareCreateForm): Promise<PlusApiResultShareCreateVO> {
    return this.client.post<PlusApiResultShareCreateVO>(appApiPath(`/share`), body);
  }

/** 访问分享 */
  async visit(shareCode: string | number, body: ShareVisitForm): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/share/${shareCode}/visit`), body);
  }

/** 验证分享密码 */
  async verifySharePassword(shareCode: string | number, body: ShareVerifyForm): Promise<PlusApiResultShareVerifyVO> {
    return this.client.post<PlusApiResultShareVerifyVO>(appApiPath(`/share/${shareCode}/verify`), body);
  }

/** 上报分享 */
  async track(body: ShareTrackForm): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/share/track`), body);
  }

/** 生成分享海报 */
  async generateSharePoster(body: SharePosterForm): Promise<PlusApiResultSharePosterVO> {
    return this.client.post<PlusApiResultSharePosterVO>(appApiPath(`/share/poster`), body);
  }

/** 领取邀请奖励 */
  async claimInviteReward(rewardId: string | number): Promise<PlusApiResultInviteRewardClaimVO> {
    return this.client.post<PlusApiResultInviteRewardClaimVO>(appApiPath(`/share/invite/rewards/${rewardId}/claim`));
  }

/** 生成邀请链接 */
  async generateInviteLink(body: InviteLinkForm): Promise<PlusApiResultInviteLinkVO> {
    return this.client.post<PlusApiResultInviteLinkVO>(appApiPath(`/share/invite/link`), body);
  }

/** 获取访问记录 */
  async getShareVisitors(shareId: string | number, params?: QueryParams): Promise<PlusApiResultPageShareVisitorVO> {
    return this.client.get<PlusApiResultPageShareVisitorVO>(appApiPath(`/share/${shareId}/visitors`), params);
  }

/** 获取分享统计 */
  async getShareStatistics(shareId: string | number): Promise<PlusApiResultShareStatisticsVO> {
    return this.client.get<PlusApiResultShareStatisticsVO>(appApiPath(`/share/${shareId}/statistics`));
  }

/** 获取分享信息 */
  async getShareInfo(shareCode: string | number, params?: QueryParams): Promise<PlusApiResultShareInfoVO> {
    return this.client.get<PlusApiResultShareInfoVO>(appApiPath(`/share/${shareCode}`), params);
  }

/** 获取分享平台配置 */
  async getSharePlatforms(): Promise<PlusApiResultListSharePlatformVO> {
    return this.client.get<PlusApiResultListSharePlatformVO>(appApiPath(`/share/platforms`));
  }

/** 获取我的分享 */
  async listMyShares(params?: QueryParams): Promise<PlusApiResultPageShareRecordVO> {
    return this.client.get<PlusApiResultPageShareRecordVO>(appApiPath(`/share/my-shares`), params);
  }

/** 获取邀请记录 */
  async getInviteRecords(params?: QueryParams): Promise<PlusApiResultPageInviteRecordVO> {
    return this.client.get<PlusApiResultPageInviteRecordVO>(appApiPath(`/share/invite/records`), params);
  }

/** 获取邀请信息 */
  async getInviteInfo(): Promise<PlusApiResultInviteInfoVO> {
    return this.client.get<PlusApiResultInviteInfoVO>(appApiPath(`/share/invite/info`));
  }

/** 批量取消分享 */
  async batchCancelShares(): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/share/batch`));
  }
}

export function createShareApi(client: HttpClient): ShareApi {
  return new ShareApi(client);
}
