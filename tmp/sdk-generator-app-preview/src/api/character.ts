import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { CharacterBatchGenerationForm, CharacterCreateForm, CharacterGenerationForm, CharacterUpdateForm, PlusApiResultCharacterDetailVO, PlusApiResultCharacterGenerationVO, PlusApiResultCharacterVO, PlusApiResultGenerationTaskVO, PlusApiResultListGenerationTaskVO, PlusApiResultPageCharacterListVO, PlusApiResultPageCharacterVO, PlusApiResultPageGenerationTaskVO, PlusApiResultVoid } from '../types';


export class CharacterApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 获取角色详情 */
  async getCharacter(characterId: string | number): Promise<PlusApiResultCharacterDetailVO> {
    return this.client.get<PlusApiResultCharacterDetailVO>(appApiPath(`/character/${characterId}`));
  }

/** 更新角色 */
  async updateCharacter(characterId: string | number, body: CharacterUpdateForm): Promise<PlusApiResultCharacterVO> {
    return this.client.put<PlusApiResultCharacterVO>(appApiPath(`/character/${characterId}`), body);
  }

/** 删除角色 */
  async deleteCharacter(characterId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/character/${characterId}`));
  }

/** 创建角色生成任务 */
  async createGeneration(body: CharacterGenerationForm): Promise<PlusApiResultGenerationTaskVO> {
    return this.client.post<PlusApiResultGenerationTaskVO>(appApiPath(`/generation/character`), body);
  }

/** 批量创建角色生成任务 */
  async batchCreateGeneration(body: CharacterBatchGenerationForm): Promise<PlusApiResultListGenerationTaskVO> {
    return this.client.post<PlusApiResultListGenerationTaskVO>(appApiPath(`/generation/character/batch`), body);
  }

/** 创建角色 */
  async createCharacter(body: CharacterCreateForm): Promise<PlusApiResultCharacterVO> {
    return this.client.post<PlusApiResultCharacterVO>(appApiPath(`/character`), body);
  }

/** 使用角色 */
  async use(characterId: string | number): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/character/${characterId}/use`));
  }

/** 点赞角色 */
  async like(characterId: string | number): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/character/${characterId}/like`));
  }

/** 取消点赞 */
  async unlike(characterId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/character/${characterId}/like`));
  }

/** 获取角色详情 */
  async getCharacterDetail(characterId: string | number): Promise<PlusApiResultCharacterGenerationVO> {
    return this.client.get<PlusApiResultCharacterGenerationVO>(appApiPath(`/generation/character/${characterId}`));
  }

/** 获取任务列表 */
  async listTasks(params?: QueryParams): Promise<PlusApiResultPageGenerationTaskVO> {
    return this.client.get<PlusApiResultPageGenerationTaskVO>(appApiPath(`/generation/character/tasks`), params);
  }

/** 获取任务状态 */
  async getTaskStatus(taskId: string | number): Promise<PlusApiResultGenerationTaskVO> {
    return this.client.get<PlusApiResultGenerationTaskVO>(appApiPath(`/generation/character/tasks/${taskId}`));
  }

/** 取消任务 */
  async cancelTask(taskId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/generation/character/tasks/${taskId}`));
  }

/** 获取角色列表 */
  async listCharacters(params?: QueryParams): Promise<PlusApiResultPageCharacterListVO> {
    return this.client.get<PlusApiResultPageCharacterListVO>(appApiPath(`/generation/character/list`), params);
  }

/** 搜索角色 */
  async searchCharacters(params?: QueryParams): Promise<PlusApiResultPageCharacterVO> {
    return this.client.get<PlusApiResultPageCharacterVO>(appApiPath(`/character/search`), params);
  }

/** 获取热门角色 */
  async getPopularCharacters(params?: QueryParams): Promise<PlusApiResultPageCharacterVO> {
    return this.client.get<PlusApiResultPageCharacterVO>(appApiPath(`/character/popular`), params);
  }

/** 获取我的角色 */
  async getMyCharacters(params?: QueryParams): Promise<PlusApiResultPageCharacterVO> {
    return this.client.get<PlusApiResultPageCharacterVO>(appApiPath(`/character/my`), params);
  }

/** 获取最受喜爱角色 */
  async getMostLikedCharacters(params?: QueryParams): Promise<PlusApiResultPageCharacterVO> {
    return this.client.get<PlusApiResultPageCharacterVO>(appApiPath(`/character/liked`), params);
  }

/** 获取智能体关联角色 */
  async getCharacterByAgent(agentId: string | number): Promise<PlusApiResultCharacterVO> {
    return this.client.get<PlusApiResultCharacterVO>(appApiPath(`/character/agent/${agentId}`));
  }
}

export function createCharacterApi(client: HttpClient): CharacterApi {
  return new CharacterApi(client);
}
