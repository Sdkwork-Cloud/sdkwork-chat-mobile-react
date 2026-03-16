import type { WorkspaceMember } from './workspace-member';
import type { WorkspaceSettings } from './workspace-settings';

/** 工作空间创建请求 */
export interface WorkspaceCreateForm {
  /** 工作空间名称 */
  workspaceName?: string;
  /** 工作空间描述 */
  workspaceDescription?: string;
  /** 工作空间图标 */
  workspaceIcon?: string;
  /** 工作空间颜色 */
  workspaceColor?: string;
  /** 工作空间类型 */
  workspaceType?: string;
  /** 成员列表 */
  members?: WorkspaceMember[];
  /** 工作空间设置 */
  settings?: WorkspaceSettings;
}
