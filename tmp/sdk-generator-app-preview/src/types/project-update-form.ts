import type { ProjectSettings } from './project-settings';

/** 项目更新请求 */
export interface ProjectUpdateForm {
  /** 项目ID */
  projectId?: string;
  /** 项目名称 */
  projectName?: string;
  /** 项目描述 */
  projectDescription?: string;
  /** 项目图标 */
  projectIcon?: string;
  /** 项目颜色 */
  projectColor?: string;
  /** 项目标签 */
  projectTags?: string[];
  /** 项目设置 */
  settings?: ProjectSettings;
}
