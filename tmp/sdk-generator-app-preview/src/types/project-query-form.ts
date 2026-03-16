/** 项目查询请求 */
export interface ProjectQueryForm {
  /** 工作空间ID */
  workspaceId?: string;
  /** 关键词 */
  keyword?: string;
  /** 项目名称 */
  projectName?: string;
  /** 项目类型 */
  type?: string;
  /** 项目标签 */
  projectTags?: string[];
  /** 状态 */
  status?: string;
  /** 创建人ID */
  creatorId?: string;
  /** 开始时间 */
  startTime?: string;
  /** 结束时间 */
  endTime?: string;
  /** 排序字段 */
  sortField?: string;
  /** 排序方向 */
  sortDirection?: string;
  /** 页码 */
  page?: number;
  /** 每页大小 */
  size?: number;
}
