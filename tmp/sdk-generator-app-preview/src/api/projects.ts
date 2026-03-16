import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { PlusApiResultListProjectVO, PlusApiResultPageProjectVO, PlusApiResultProjectDetailVO, PlusApiResultProjectStatisticsVO, PlusApiResultProjectVO, PlusApiResultVoid, ProjectCopyRequest, ProjectCreateRequest, ProjectMoveRequest, ProjectUpdateRequest } from '../types';


export class ProjectsApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 获取项目详情 */
  async getProjectDetail(projectId: string | number): Promise<PlusApiResultProjectDetailVO> {
    return this.client.get<PlusApiResultProjectDetailVO>(appApiPath(`/projects/${projectId}`));
  }

/** 更新项目 */
  async updateProject(projectId: string | number, body: ProjectUpdateRequest): Promise<PlusApiResultProjectVO> {
    return this.client.put<PlusApiResultProjectVO>(appApiPath(`/projects/${projectId}`), body);
  }

/** 删除项目 */
  async deleteProject(projectId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/projects/${projectId}`));
  }

/** 取消归档项目 */
  async unarchiveProject(projectId: string | number): Promise<PlusApiResultVoid> {
    return this.client.put<PlusApiResultVoid>(appApiPath(`/projects/${projectId}/unarchive`));
  }

/** 移动项目 */
  async moveProject(projectId: string | number, body: ProjectMoveRequest): Promise<PlusApiResultVoid> {
    return this.client.put<PlusApiResultVoid>(appApiPath(`/projects/${projectId}/move`), body);
  }

/** 归档项目 */
  async archiveProject(projectId: string | number): Promise<PlusApiResultVoid> {
    return this.client.put<PlusApiResultVoid>(appApiPath(`/projects/${projectId}/archive`));
  }

/** 获取项目列表 */
  async listProjects(params?: QueryParams): Promise<PlusApiResultPageProjectVO> {
    return this.client.get<PlusApiResultPageProjectVO>(appApiPath(`/projects`), params);
  }

/** 创建项目 */
  async createProject(body: ProjectCreateRequest): Promise<PlusApiResultProjectVO> {
    return this.client.post<PlusApiResultProjectVO>(appApiPath(`/projects`), body);
  }

/** 复制项目 */
  async copyProject(projectId: string | number, body: ProjectCopyRequest): Promise<PlusApiResultProjectVO> {
    return this.client.post<PlusApiResultProjectVO>(appApiPath(`/projects/${projectId}/copy`), body);
  }

/** 项目统计 */
  async getProjectStatistics(projectId: string | number): Promise<PlusApiResultProjectStatisticsVO> {
    return this.client.get<PlusApiResultProjectStatisticsVO>(appApiPath(`/projects/${projectId}/statistics`));
  }

/** 搜索项目 */
  async search(params?: QueryParams): Promise<PlusApiResultPageProjectVO> {
    return this.client.get<PlusApiResultPageProjectVO>(appApiPath(`/projects/search`), params);
  }

/** 最近访问项目 */
  async listRecent(params?: QueryParams): Promise<PlusApiResultListProjectVO> {
    return this.client.get<PlusApiResultListProjectVO>(appApiPath(`/projects/recent`), params);
  }
}

export function createProjectsApi(client: HttpClient): ProjectsApi {
  return new ProjectsApi(client);
}
