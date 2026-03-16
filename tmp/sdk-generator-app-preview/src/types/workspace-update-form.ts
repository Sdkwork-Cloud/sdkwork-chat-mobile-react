import type { WorkspaceSettings } from './workspace-settings';

/** 工作空间更新请求 */
export interface WorkspaceUpdateForm {
  /** 工作空间ID */
  workspaceId?: string;
  /** 工作空间名称 */
  workspaceName?: string;
  /** 工作空间描述 */
  workspaceDescription?: string;
  /** 工作空间图标 */
  workspaceIcon?: string;
  /** 工作空间颜色 */
  workspaceColor?: string;
  /** 工作空间设置 */
  settings?: WorkspaceSettings;
}
