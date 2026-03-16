import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { CommissionForm, PartnerCreateForm, PartnerUpdateForm, PlusApiResultPagePartnerVO, PlusApiResultPartnerDetailVO, PlusApiResultPartnerStatisticsVO, PlusApiResultPartnerVO, PlusApiResultVoid } from '../types';


export class PartnerApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 获取合作伙伴详情 */
  async getPartner(partnerId: string | number): Promise<PlusApiResultPartnerDetailVO> {
    return this.client.get<PlusApiResultPartnerDetailVO>(appApiPath(`/partner/${partnerId}`));
  }

/** 更新合作伙伴 */
  async updatePartner(partnerId: string | number, body: PartnerUpdateForm): Promise<PlusApiResultPartnerVO> {
    return this.client.put<PlusApiResultPartnerVO>(appApiPath(`/partner/${partnerId}`), body);
  }

/** 删除合作伙伴 */
  async deletePartner(partnerId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/partner/${partnerId}`));
  }

/** 申请成为合作伙伴 */
  async createPartner(body: PartnerCreateForm): Promise<PlusApiResultPartnerVO> {
    return this.client.post<PlusApiResultPartnerVO>(appApiPath(`/partner`), body);
  }

/** 提现佣金 */
  async withdrawCommission(partnerId: string | number, body: CommissionForm): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/partner/${partnerId}/withdraw`), body);
  }

/** 审批拒绝 */
  async reject(partnerId: string | number): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/partner/${partnerId}/reject`));
  }

/** 添加佣金 */
  async addCommission(partnerId: string | number, body: CommissionForm): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/partner/${partnerId}/commission`), body);
  }

/** 审批通过 */
  async approve(partnerId: string | number): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/partner/${partnerId}/approve`));
  }

/** 获取下级合作伙伴 */
  async getSubordinates(partnerId: string | number, params?: QueryParams): Promise<PlusApiResultPagePartnerVO> {
    return this.client.get<PlusApiResultPagePartnerVO>(appApiPath(`/partner/subordinates/${partnerId}`), params);
  }

/** 获取合作伙伴统计 */
  async getPartnerStatistics(): Promise<PlusApiResultPartnerStatisticsVO> {
    return this.client.get<PlusApiResultPartnerStatisticsVO>(appApiPath(`/partner/statistics`));
  }

/** 搜索合作伙伴 */
  async searchPartners(params?: QueryParams): Promise<PlusApiResultPagePartnerVO> {
    return this.client.get<PlusApiResultPagePartnerVO>(appApiPath(`/partner/search`), params);
  }

/** 获取我的合作伙伴信息 */
  async getMy(): Promise<PlusApiResultPartnerDetailVO> {
    return this.client.get<PlusApiResultPartnerDetailVO>(appApiPath(`/partner/my`));
  }

/** 根据推广码查询 */
  async getByPromotionCode(promotionCode: string | number): Promise<PlusApiResultPartnerVO> {
    return this.client.get<PlusApiResultPartnerVO>(appApiPath(`/partner/code/${promotionCode}`));
  }
}

export function createPartnerApi(client: HttpClient): PartnerApi {
  return new PartnerApi(client);
}
