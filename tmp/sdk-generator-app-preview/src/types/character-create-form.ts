/** 创建角色表单 */
export interface CharacterCreateForm {
  /** 角色名称 */
  name: string;
  /** 角色类型 */
  type?: string;
  /** 角色描述 */
  description?: string;
  /** 关联智能体ID */
  agentId?: number;
}
