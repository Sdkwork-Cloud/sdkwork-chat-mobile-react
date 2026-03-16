import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { MemberInviteForm, MemberRoleUpdateForm, PlusApiResultListMemberVO, PlusApiResultListWorkspaceVO, PlusApiResultPageProjectVO, PlusApiResultProjectDetailVO, PlusApiResultProjectVO, PlusApiResultVoid, PlusApiResultWorkspaceVO, ProjectCopyForm, ProjectCreateForm, ProjectMoveForm, ProjectUpdateForm, WorkspaceCreateForm, WorkspaceUpdateForm } from '../types';


export class WorkspacesApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 获取工作空间详情 */
  async getWorkspaceDetail(workspaceId: string | number): Promise<PlusApiResultWorkspaceVO> {
    return this.client.get<PlusApiResultWorkspaceVO>(appApiPath(`/workspaces/${workspaceId}`));
  }

/** 更新工作空间 */
  async updateWorkspace(workspaceId: string | number, body: WorkspaceUpdateForm): Promise<PlusApiResultWorkspaceVO> {
    return this.client.put<PlusApiResultWorkspaceVO>(appApiPath(`/workspaces/${workspaceId}`), body);
  }

/** 删除工作空间 */
  async deleteWorkspace(workspaceId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/workspaces/${workspaceId}`));
  }

/** 获取项目详情 */
  async getProjectDetail(workspaceId: string | number, projectId: string | number): Promise<PlusApiResultProjectDetailVO> {
    return this.client.get<PlusApiResultProjectDetailVO>(appApiPath(`/workspaces/${workspaceId}/projects/${projectId}`));
  }

/** 更新项目 */
  async updateProject(workspaceId: string | number, projectId: string | number, body: ProjectUpdateForm): Promise<PlusApiResultProjectVO> {
    return this.client.put<PlusApiResultProjectVO>(appApiPath(`/workspaces/${workspaceId}/projects/${projectId}`), body);
  }

/** 删除项目 */
  async deleteProject(workspaceId: string | number, projectId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/workspaces/${workspaceId}/projects/${projectId}`));
  }

/** 取消归档项目 */
  async unarchiveProject(workspaceId: string | number, projectId: string | number): Promise<PlusApiResultVoid> {
    return this.client.put<PlusApiResultVoid>(appApiPath(`/workspaces/${workspaceId}/projects/${projectId}/unarchive`));
  }

/** 移动项目 */
  async moveProject(workspaceId: string | number, projectId: string | number, body: ProjectMoveForm): Promise<PlusApiResultVoid> {
    return this.client.put<PlusApiResultVoid>(appApiPath(`/workspaces/${workspaceId}/projects/${projectId}/move`), body);
  }

/** 归档项目 */
  async archiveProject(workspaceId: string | number, projectId: string | number): Promise<PlusApiResultVoid> {
    return this.client.put<PlusApiResultVoid>(appApiPath(`/workspaces/${workspaceId}/projects/${projectId}/archive`));
  }

/** 更新成员角色 */
  async updateMemberRole(workspaceId: string | number, userId: string | number, body: MemberRoleUpdateForm): Promise<PlusApiResultVoid> {
    return this.client.put<PlusApiResultVoid>(appApiPath(`/workspaces/${workspaceId}/members/${userId}/role`), body);
  }

/** 获取工作空间列表 */
  async listWorkspaces(): Promise<PlusApiResultListWorkspaceVO> {
    return this.client.get<PlusApiResultListWorkspaceVO>(appApiPath(`/workspaces`));
  }

/** 创建工作空间 */
  async createWorkspace(body: WorkspaceCreateForm): Promise<PlusApiResultWorkspaceVO> {
    return this.client.post<PlusApiResultWorkspaceVO>(appApiPath(`/workspaces`), body);
  }

/** 获取项目列表 */
  async listProjects(workspaceId: string | number, params?: QueryParams): Promise<PlusApiResultPageProjectVO> {
    return this.client.get<PlusApiResultPageProjectVO>(appApiPath(`/workspaces/${workspaceId}/projects`), params);
  }

/** 创建项目 */
  async createProject(workspaceId: string | number, body: ProjectCreateForm): Promise<PlusApiResultProjectVO> {
    return this.client.post<PlusApiResultProjectVO>(appApiPath(`/workspaces/${workspaceId}/projects`), body);
  }

/** 复制项目 */
  async copyProject(workspaceId: string | number, projectId: string | number, body: ProjectCopyForm): Promise<PlusApiResultProjectVO> {
    return this.client.post<PlusApiResultProjectVO>(appApiPath(`/workspaces/${workspaceId}/projects/${projectId}/copy`), body);
  }

/** 获取工作空间成员 */
  async listWorkspaceMembers(workspaceId: string | number): Promise<PlusApiResultListMemberVO> {
    return this.client.get<PlusApiResultListMemberVO>(appApiPath(`/workspaces/${workspaceId}/members`));
  }

/** 邀请成员 */
  async inviteMember(workspaceId: string | number, body: MemberInviteForm): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/workspaces/${workspaceId}/members`), body);
  }

/** 获取当前工作空间 */
  async getCurrentWorkspace(): Promise<PlusApiResultWorkspaceVO> {
    return this.client.get<PlusApiResultWorkspaceVO>(appApiPath(`/workspaces/current`));
  }

/** 移除成员 */
  async removeMember(workspaceId: string | number, userId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/workspaces/${workspaceId}/members/${userId}`));
  }
}

export function createWorkspacesApi(client: HttpClient): WorkspacesApi {
  return new WorkspacesApi(client);
}
