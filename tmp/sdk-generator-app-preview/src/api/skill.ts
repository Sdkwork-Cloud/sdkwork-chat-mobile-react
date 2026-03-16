import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { PlusApiResultBoolean, PlusApiResultListSkillCategoryVO, PlusApiResultListSkillPackageVO, PlusApiResultListUserSkillVO, PlusApiResultPageSkillVO, PlusApiResultSkillVO, PlusApiResultUserSkillVO, SkillConfigUpdateForm, SkillSaveForm } from '../types';


export class SkillApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** Get skill detail */
  async detail(skillId: string | number): Promise<PlusApiResultSkillVO> {
    return this.client.get<PlusApiResultSkillVO>(appApiPath(`/skills/${skillId}`));
  }

/** Update skill */
  async update(skillId: string | number, body: SkillSaveForm): Promise<PlusApiResultSkillVO> {
    return this.client.put<PlusApiResultSkillVO>(appApiPath(`/skills/${skillId}`), body);
  }

/** Update user skill config */
  async updateConfig(skillId: string | number, body?: SkillConfigUpdateForm): Promise<PlusApiResultUserSkillVO> {
    return this.client.put<PlusApiResultUserSkillVO>(appApiPath(`/skills/${skillId}/config`), body);
  }

/** List market skills */
  async list(params?: QueryParams): Promise<PlusApiResultPageSkillVO> {
    return this.client.get<PlusApiResultPageSkillVO>(appApiPath(`/skills`), params);
  }

/** Create skill */
  async create(body: SkillSaveForm): Promise<PlusApiResultSkillVO> {
    return this.client.post<PlusApiResultSkillVO>(appApiPath(`/skills`), body);
  }

/** Submit skill for review */
  async submitReview(skillId: string | number): Promise<PlusApiResultSkillVO> {
    return this.client.post<PlusApiResultSkillVO>(appApiPath(`/skills/${skillId}/submit-review`));
  }

/** Publish skill to market */
  async publish(skillId: string | number): Promise<PlusApiResultSkillVO> {
    return this.client.post<PlusApiResultSkillVO>(appApiPath(`/skills/${skillId}/publish`));
  }

/** Offline skill from market */
  async offline(skillId: string | number): Promise<PlusApiResultSkillVO> {
    return this.client.post<PlusApiResultSkillVO>(appApiPath(`/skills/${skillId}/offline`));
  }

/** Enable skill for current user */
  async enable(skillId: string | number): Promise<PlusApiResultUserSkillVO> {
    return this.client.post<PlusApiResultUserSkillVO>(appApiPath(`/skills/${skillId}/enable`));
  }

/** Disable skill for current user */
  async disable(skillId: string | number): Promise<PlusApiResultBoolean> {
    return this.client.post<PlusApiResultBoolean>(appApiPath(`/skills/${skillId}/disable`));
  }

/** List skill packages */
  async listPackages(): Promise<PlusApiResultListSkillPackageVO> {
    return this.client.get<PlusApiResultListSkillPackageVO>(appApiPath(`/skills/packages`));
  }

/** List my installed skills */
  async listMine(): Promise<PlusApiResultListUserSkillVO> {
    return this.client.get<PlusApiResultListUserSkillVO>(appApiPath(`/skills/my`));
  }

/** List skill categories */
  async listCategories(): Promise<PlusApiResultListSkillCategoryVO> {
    return this.client.get<PlusApiResultListSkillCategoryVO>(appApiPath(`/skills/categories`));
  }
}

export function createSkillApi(client: HttpClient): SkillApi {
  return new SkillApi(client);
}
