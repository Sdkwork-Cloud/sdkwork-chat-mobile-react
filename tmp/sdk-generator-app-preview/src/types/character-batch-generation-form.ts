import type { CharacterItem } from './character-item';

/** 批量角色生成请求 */
export interface CharacterBatchGenerationForm {
  /** 角色列表 */
  characters: CharacterItem[];
  /** 模型 */
  model?: string;
}
