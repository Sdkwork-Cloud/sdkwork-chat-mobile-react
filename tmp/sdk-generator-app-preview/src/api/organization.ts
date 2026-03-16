import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { DepartmentCreateForm, OrganizationCreateForm, PlusApiResultDepartmentDetailVO, PlusApiResultDepartmentVO, PlusApiResultListDepartmentDetailVO, PlusApiResultListDepartmentVO, PlusApiResultListOrganizationVO, PlusApiResultListPositionDetailVO, PlusApiResultListPositionVO, PlusApiResultMemberVO, PlusApiResultOrganizationDetailVO, PlusApiResultOrganizationStatisticsVO, PlusApiResultOrganizationVO, PlusApiResultPageMemberVO, PlusApiResultPageOrganizationVO, PlusApiResultPositionDetailVO, PlusApiResultPositionVO, PositionCreateForm } from '../types';


export class OrganizationApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 创建组织 */
  async createOrganization(body: OrganizationCreateForm): Promise<PlusApiResultOrganizationVO> {
    return this.client.post<PlusApiResultOrganizationVO>(appApiPath(`/organization`), body);
  }

/** 禁用组织 */
  async disable(orgId: string | number): Promise<PlusApiResultOrganizationVO> {
    return this.client.post<PlusApiResultOrganizationVO>(appApiPath(`/organization/${orgId}/disable`));
  }

/** 激活组织 */
  async activate(orgId: string | number): Promise<PlusApiResultOrganizationVO> {
    return this.client.post<PlusApiResultOrganizationVO>(appApiPath(`/organization/${orgId}/activate`));
  }

/** 创建岗位 */
  async createPosition(body: PositionCreateForm): Promise<PlusApiResultPositionVO> {
    return this.client.post<PlusApiResultPositionVO>(appApiPath(`/organization/position`), body);
  }

/** 创建部门 */
  async createDepartment(body: DepartmentCreateForm): Promise<PlusApiResultDepartmentVO> {
    return this.client.post<PlusApiResultDepartmentVO>(appApiPath(`/organization/department`), body);
  }

/** 获取组织详情 */
  async getOrganization(orgId: string | number): Promise<PlusApiResultOrganizationDetailVO> {
    return this.client.get<PlusApiResultOrganizationDetailVO>(appApiPath(`/organization/${orgId}`));
  }

/** 获取组织的岗位列表 */
  async getPositionsByOrg(orgId: string | number): Promise<PlusApiResultListPositionVO> {
    return this.client.get<PlusApiResultListPositionVO>(appApiPath(`/organization/${orgId}/positions`));
  }

/** 获取岗位树 */
  async getPositionTree(orgId: string | number): Promise<PlusApiResultListPositionDetailVO> {
    return this.client.get<PlusApiResultListPositionDetailVO>(appApiPath(`/organization/${orgId}/positions/tree`));
  }

/** 获取组织成员 */
  async getMembersByOrg(orgId: string | number, params?: QueryParams): Promise<PlusApiResultPageMemberVO> {
    return this.client.get<PlusApiResultPageMemberVO>(appApiPath(`/organization/${orgId}/members`), params);
  }

/** 获取组织的部门列表 */
  async getDepartmentsByOrg(orgId: string | number): Promise<PlusApiResultListDepartmentVO> {
    return this.client.get<PlusApiResultListDepartmentVO>(appApiPath(`/organization/${orgId}/departments`));
  }

/** 获取部门树 */
  async getDepartmentTree(orgId: string | number): Promise<PlusApiResultListDepartmentDetailVO> {
    return this.client.get<PlusApiResultListDepartmentDetailVO>(appApiPath(`/organization/${orgId}/departments/tree`));
  }

/** 获取子组织 */
  async getChildOrganizations(orgId: string | number): Promise<PlusApiResultListOrganizationVO> {
    return this.client.get<PlusApiResultListOrganizationVO>(appApiPath(`/organization/${orgId}/children`));
  }

/** 获取组织统计 */
  async getOrganizationStatistics(): Promise<PlusApiResultOrganizationStatisticsVO> {
    return this.client.get<PlusApiResultOrganizationStatisticsVO>(appApiPath(`/organization/statistics`));
  }

/** 获取岗位详情 */
  async getPosition(posId: string | number): Promise<PlusApiResultPositionDetailVO> {
    return this.client.get<PlusApiResultPositionDetailVO>(appApiPath(`/organization/position/${posId}`));
  }

/** 获取子岗位 */
  async getChildPositions(posId: string | number): Promise<PlusApiResultListPositionVO> {
    return this.client.get<PlusApiResultListPositionVO>(appApiPath(`/organization/position/${posId}/children`));
  }

/** 获取成员详情 */
  async getMember(memberId: string | number): Promise<PlusApiResultMemberVO> {
    return this.client.get<PlusApiResultMemberVO>(appApiPath(`/organization/member/${memberId}`));
  }

/** 获取组织列表 */
  async getOrganizationList(params?: QueryParams): Promise<PlusApiResultPageOrganizationVO> {
    return this.client.get<PlusApiResultPageOrganizationVO>(appApiPath(`/organization/list`), params);
  }

/** 获取部门详情 */
  async getDepartment(deptId: string | number): Promise<PlusApiResultDepartmentDetailVO> {
    return this.client.get<PlusApiResultDepartmentDetailVO>(appApiPath(`/organization/department/${deptId}`));
  }

/** 获取子部门 */
  async getChildDepartments(deptId: string | number): Promise<PlusApiResultListDepartmentVO> {
    return this.client.get<PlusApiResultListDepartmentVO>(appApiPath(`/organization/department/${deptId}/children`));
  }

/** 根据编码获取组织 */
  async getOrganizationByCode(code: string | number): Promise<PlusApiResultOrganizationDetailVO> {
    return this.client.get<PlusApiResultOrganizationDetailVO>(appApiPath(`/organization/code/${code}`));
  }
}

export function createOrganizationApi(client: HttpClient): OrganizationApi {
  return new OrganizationApi(client);
}
