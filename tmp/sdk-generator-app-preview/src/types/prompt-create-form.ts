/** 创建提示语请求 */
export interface PromptCreateForm {
  /** 提示语标题 */
  title: string;
  /** 提示语内容 */
  content: string;
  /** 提示语类型 */
  type: 'DEFAULT' | 'SYSTEM' | 'ASSISTANT' | 'USER';
  /** 业务类型 */
  bizType: 'DEFAULT' | 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'MUSIC' | 'AGENT' | 'VOICE_CLONE_WORDS';
  /** 提示语描述 */
  description?: string;
  /** 分类ID */
  cateId?: number;
  /** 排序 */
  sort?: number;
  /** 参数定义 */
  parameters?: Record<string, unknown>;
  /** 适用模型 */
  model?: string;
  /** 是否公开 */
  isPublic?: boolean;
}
