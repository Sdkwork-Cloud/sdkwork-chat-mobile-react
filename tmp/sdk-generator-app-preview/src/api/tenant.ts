import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { PlusApiResultListTenantTypeVO, PlusApiResultPageTenantVO, PlusApiResultTenantDetailVO, PlusApiResultTenantStatisticsVO, PlusApiResultTenantVO, TenantCreateForm, TenantUpdateForm } from '../types';


export class TenantApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 获取租户详情 */
  async getTenant(tenantId: string | number): Promise<PlusApiResultTenantDetailVO> {
    return this.client.get<PlusApiResultTenantDetailVO>(appApiPath(`/tenant/${tenantId}`));
  }

/** 更新租户 */
  async updateTenant(tenantId: string | number, body: TenantUpdateForm): Promise<PlusApiResultTenantVO> {
    return this.client.put<PlusApiResultTenantVO>(appApiPath(`/tenant/${tenantId}`), body);
  }

/** 创建租户 */
  async createTenant(body: TenantCreateForm): Promise<PlusApiResultTenantVO> {
    return this.client.post<PlusApiResultTenantVO>(appApiPath(`/tenant`), body);
  }

/** 冻结租户 */
  async freeze(tenantId: string | number): Promise<PlusApiResultTenantVO> {
    return this.client.post<PlusApiResultTenantVO>(appApiPath(`/tenant/${tenantId}/freeze`));
  }

/** 注销租户 */
  async close(tenantId: string | number): Promise<PlusApiResultTenantVO> {
    return this.client.post<PlusApiResultTenantVO>(appApiPath(`/tenant/${tenantId}/close`));
  }

/** 激活租户 */
  async activate(tenantId: string | number): Promise<PlusApiResultTenantVO> {
    return this.client.post<PlusApiResultTenantVO>(appApiPath(`/tenant/${tenantId}/activate`));
  }

/** 获取租户类型列表 */
  async getTenantTypes(): Promise<PlusApiResultListTenantTypeVO> {
    return this.client.get<PlusApiResultListTenantTypeVO>(appApiPath(`/tenant/types`));
  }

/** 获取租户统计 */
  async getTenantStatistics(): Promise<PlusApiResultTenantStatisticsVO> {
    return this.client.get<PlusApiResultTenantStatisticsVO>(appApiPath(`/tenant/statistics`));
  }

/** 获取根租户 */
  async getRoot(): Promise<PlusApiResultTenantDetailVO> {
    return this.client.get<PlusApiResultTenantDetailVO>(appApiPath(`/tenant/root`));
  }

/** 获取租户列表 */
  async getTenantList(params?: QueryParams): Promise<PlusApiResultPageTenantVO> {
    return this.client.get<PlusApiResultPageTenantVO>(appApiPath(`/tenant/list`), params);
  }

/** 根据编码获取租户 */
  async getTenantByCode(code: string | number): Promise<PlusApiResultTenantDetailVO> {
    return this.client.get<PlusApiResultTenantDetailVO>(appApiPath(`/tenant/code/${code}`));
  }

/** 获取云租户 */
  async getCloud(): Promise<PlusApiResultTenantDetailVO> {
    return this.client.get<PlusApiResultTenantDetailVO>(appApiPath(`/tenant/cloud`));
  }
}

export function createTenantApi(client: HttpClient): TenantApi {
  return new TenantApi(client);
}
