export interface ProjectUpdateRequest {
  /** 项目名称 */
  name?: string;
  /** 项目描述 */
  description?: string;
  /** 项目类型 */
  type?: string;
  /** 标签列表 */
  tags?: string[];
  /** 是否公开 */
  isPublic?: boolean;
}
