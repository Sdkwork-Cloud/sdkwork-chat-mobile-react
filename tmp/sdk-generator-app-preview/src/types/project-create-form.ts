import type { ProjectMember } from './project-member';
import type { ProjectSettings } from './project-settings';

/** 项目创建请求 */
export interface ProjectCreateForm {
  /** 工作空间ID */
  workspaceId?: string;
  /** 项目名称 */
  projectName?: string;
  /** 项目描述 */
  projectDescription?: string;
  /** 项目类型 */
  projectType?: string;
  /** 项目图标 */
  projectIcon?: string;
  /** 项目颜色 */
  projectColor?: string;
  /** 项目标签 */
  projectTags?: string[];
  /** 成员列表 */
  members?: ProjectMember[];
  /** 项目设置 */
  settings?: ProjectSettings;
}
