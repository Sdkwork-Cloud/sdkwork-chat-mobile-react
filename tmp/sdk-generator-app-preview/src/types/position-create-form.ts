/** 创建岗位表单 */
export interface PositionCreateForm {
  /** 岗位名称 */
  name: string;
  /** 岗位编码 */
  code?: string;
  /** 岗位描述 */
  description?: string;
  /** 组织ID */
  ownerId: number;
  /** 父岗位ID */
  parentId?: number;
  /** 岗位级别 */
  level: number;
  /** 排序 */
  sortOrder?: number;
  /** 岗位类别 */
  category?: string;
  /** 要求工作经验年限 */
  requiredExperienceYears?: number;
  /** 要求学历 */
  requiredEducation?: string;
  /** 最大人数限制 */
  maxMemberCount?: number;
}
