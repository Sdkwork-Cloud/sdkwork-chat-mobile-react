import {
  APP_SDK_AUTH_TOKEN_STORAGE_KEY,
  createAppSdkCoreConfig,
  getAppSdkCoreClientWithSession,
  resolveServiceFactoryRuntimeDeps,
} from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type {
  CharacterDetailVO,
  CharacterVO,
  PlusApiResultCharacterDetailVO,
  PlusApiResultPageCharacterVO,
  PlusApiResultVoid,
  SdkworkAppClient,
} from '@sdkwork/app-sdk';

import type { Agent, AgentCapability, AgentStatus } from '../types';

const TAG = 'AgentSdkService';
const SUCCESS_CODE = '2000';

interface AgentSdkError {
  code?: string;
  message: string;
}

export interface IAgentSdkService {
  hasSdkBaseUrl(): boolean;
  getLastError(): AgentSdkError | null;
  getAgents(): Promise<Agent[] | null>;
  getAgentById(id: string): Promise<Agent | null>;
  getFavoriteAgents(): Promise<Agent[] | null>;
  likeAgent(id: string): Promise<boolean | null>;
  unlikeAgent(id: string): Promise<boolean | null>;
  markAgentUsed(id: string): Promise<boolean | null>;
}

class AgentSdkServiceImpl implements IAgentSdkService {
  private readonly deps: ServiceFactoryRuntimeDeps;
  private lastError: AgentSdkError | null = null;

  constructor(deps?: ServiceFactoryDeps) {
    this.deps = resolveServiceFactoryRuntimeDeps(deps);
  }

  private async getClient(): Promise<SdkworkAppClient> {
    return getAppSdkCoreClientWithSession({
      storage: this.deps.storage,
      authStorageKey: APP_SDK_AUTH_TOKEN_STORAGE_KEY,
    });
  }

  hasSdkBaseUrl(): boolean {
    return (createAppSdkCoreConfig().baseUrl || '').trim().length > 0;
  }

  getLastError(): AgentSdkError | null {
    return this.lastError;
  }

  private setLastError(error: AgentSdkError | null): void {
    this.lastError = error;
  }

  private isSuccessCode(code: string | undefined): boolean {
    return code === SUCCESS_CODE;
  }

  private failBusiness(result: { code?: string; msg?: string }, fallback: string): null {
    this.setLastError({ code: result.code, message: result.msg || fallback });
    this.deps.logger.warn(TAG, fallback, { code: result.code, message: result.msg });
    return null;
  }

  private failRequest(error: unknown, fallback: string): null {
    const message = error instanceof Error ? error.message : fallback;
    this.setLastError({ message });
    this.deps.logger.warn(TAG, fallback, error);
    return null;
  }

  private toText(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }

  private toNumber(value: unknown, fallback = 0): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value.trim());
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
    return fallback;
  }

  private normalizeStatus(value: unknown): AgentStatus {
    const raw = this.toText(value).toLowerCase();
    if (raw === 'inactive') return 'inactive';
    if (raw === 'busy') return 'busy';
    if (raw === 'offline') return 'offline';
    return 'active';
  }

  private buildAvatar(source: CharacterVO | CharacterDetailVO): string | undefined {
    const avatar = source.avatar;
    if (!avatar || typeof avatar !== 'object') {
      return undefined;
    }
    return this.toText(avatar.url) || this.toText(avatar.base64) || undefined;
  }

  private inferCapabilities(source: CharacterVO | CharacterDetailVO): AgentCapability[] {
    const candidates = [
      this.toText(source.type),
      this.toText(source.name),
      this.toText(source.description),
      this.toText((source as CharacterDetailVO).personality),
      this.toText((source as CharacterDetailVO).interactionSettings),
    ].join(' ').toLowerCase();

    const capabilities: AgentCapability[] = ['chat'];
    if (candidates.includes('image') || candidates.includes('art') || candidates.includes('visual')) {
      capabilities.push('image_generation');
    }
    if (candidates.includes('code') || candidates.includes('dev')) {
      capabilities.push('code_assistant', 'coding');
    }
    if (candidates.includes('translate') || candidates.includes('language')) {
      capabilities.push('translation');
    }
    if (candidates.includes('summary') || candidates.includes('summarize')) {
      capabilities.push('summarization');
    }
    if (candidates.includes('analysis') || candidates.includes('reason')) {
      capabilities.push('data_analysis', 'reasoning');
    }
    if (candidates.includes('write') || candidates.includes('story')) {
      capabilities.push('writing', 'creative');
    }
    return [...new Set(capabilities)];
  }

  private buildTags(source: CharacterVO | CharacterDetailVO, capabilities: AgentCapability[]): string[] {
    const tags = new Set<string>();
    const type = this.toText(source.type);
    if (type) {
      tags.add(type);
    }
    capabilities.forEach((item) => {
      if (item === 'code_assistant') tags.add('Coding');
      if (item === 'image_generation') tags.add('Image');
      if (item === 'translation') tags.add('Translation');
      if (item === 'summarization') tags.add('Summary');
      if (item === 'data_analysis') tags.add('Analysis');
      if (item === 'writing') tags.add('Writing');
      if (item === 'creative') tags.add('Creative');
    });
    return Array.from(tags);
  }

  private mapCharacter(source: CharacterVO | CharacterDetailVO, favoriteIds?: Set<string>): Agent | null {
    const id = this.toText(source.characterId);
    if (!id) {
      return null;
    }

    const capabilities = this.inferCapabilities(source);
    const likeCount = Math.max(0, this.toNumber(source.likeCount, 0));
    const usageCount = Math.max(0, this.toNumber(source.usageCount, 0));
    const rating = Math.min(5, 4 + Math.min(1, likeCount / 1000));

    return {
      id,
      name: this.toText(source.name) || `Agent ${id}`,
      avatar: this.buildAvatar(source),
      description: this.toText(source.description) || 'AI character powered by SDKWork services.',
      provider: 'SDKWork',
      model: this.toText(source.type) || (source.agentId ? `agent-${source.agentId}` : 'character'),
      capabilities,
      status: this.normalizeStatus(source.status),
      isDefault: false,
      isFavorite: favoriteIds ? favoriteIds.has(id) : false,
      systemPrompt: this.toText((source as CharacterDetailVO).interactionSettings) || undefined,
      temperature: 0.7,
      maxTokens: 4096,
      tags: this.buildTags(source, capabilities),
      usageCount,
      rating,
      createdAt: this.toText(source.createdAt) || new Date(this.deps.clock.now()).toISOString(),
      updatedAt: this.toText(source.updatedAt) || new Date(this.deps.clock.now()).toISOString(),
    };
  }

  private dedupeAgents(groups: Agent[][]): Agent[] {
    const map = new Map<string, Agent>();
    groups.flat().forEach((agent) => {
      const previous = map.get(agent.id);
      map.set(
        agent.id,
        previous ? { ...previous, ...agent, isFavorite: previous.isFavorite || agent.isFavorite } : agent,
      );
    });
    return Array.from(map.values());
  }

  async getFavoriteAgents(): Promise<Agent[] | null> {
    if (!this.hasSdkBaseUrl()) {
      return null;
    }

    this.setLastError(null);

    try {
      const client = await this.getClient();
      const response = await client.character.getMostLikedCharacters({ page: 0, size: 100 }) as PlusApiResultPageCharacterVO;
      if (!this.isSuccessCode(response.code)) {
        return this.failBusiness(response, 'Failed to load favorite agents');
      }

      const content = Array.isArray(response.data?.content) ? response.data.content : [];
      const favoriteIds = new Set(content.map((item) => this.toText(item.characterId)).filter(Boolean));
      return content
        .map((item) => this.mapCharacter(item, favoriteIds))
        .filter((item): item is Agent => item !== null)
        .map((item) => ({ ...item, isFavorite: true }));
    } catch (error) {
      return this.failRequest(error, 'Failed to load favorite agents');
    }
  }

  async getAgents(): Promise<Agent[] | null> {
    if (!this.hasSdkBaseUrl()) {
      return null;
    }

    this.setLastError(null);

    try {
      const client = await this.getClient();
      const [popularResponse, myResponse, favoriteAgents] = await Promise.all([
        client.character.getPopularCharacters({ page: 0, size: 100 }) as Promise<PlusApiResultPageCharacterVO>,
        client.character.getMyCharacters({ page: 0, size: 100 }).catch(() => null),
        this.getFavoriteAgents(),
      ]);

      if (!this.isSuccessCode(popularResponse.code)) {
        return this.failBusiness(popularResponse, 'Failed to load agents');
      }

      const favoriteIds = new Set((favoriteAgents || []).map((item) => item.id));
      const popular = (Array.isArray(popularResponse.data?.content) ? popularResponse.data.content : [])
        .map((item) => this.mapCharacter(item, favoriteIds))
        .filter((item): item is Agent => item !== null);

      const mine = myResponse && this.isSuccessCode(myResponse.code)
        ? (Array.isArray(myResponse.data?.content) ? myResponse.data.content : [])
            .map((item) => this.mapCharacter(item, favoriteIds))
            .filter((item): item is Agent => item !== null)
        : [];

      return this.dedupeAgents([popular, mine, favoriteAgents || []]);
    } catch (error) {
      return this.failRequest(error, 'Failed to load agents');
    }
  }

  async getAgentById(id: string): Promise<Agent | null> {
    if (!this.hasSdkBaseUrl()) {
      return null;
    }

    this.setLastError(null);

    try {
      const client = await this.getClient();
      const [response, favorites] = await Promise.all([
        client.character.getCharacter(id) as Promise<PlusApiResultCharacterDetailVO>,
        this.getFavoriteAgents(),
      ]);
      if (!this.isSuccessCode(response.code)) {
        return this.failBusiness(response, 'Failed to load agent detail');
      }
      const favoriteIds = new Set((favorites || []).map((item) => item.id));
      return this.mapCharacter(response.data, favoriteIds);
    } catch (error) {
      return this.failRequest(error, 'Failed to load agent detail');
    }
  }

  async likeAgent(id: string): Promise<boolean | null> {
    if (!this.hasSdkBaseUrl()) {
      return null;
    }

    this.setLastError(null);

    try {
      const client = await this.getClient();
      const response = await client.character.like(id) as PlusApiResultVoid;
      if (!this.isSuccessCode(response.code)) {
        return this.failBusiness(response, 'Failed to like agent');
      }
      return true;
    } catch (error) {
      return this.failRequest(error, 'Failed to like agent');
    }
  }

  async unlikeAgent(id: string): Promise<boolean | null> {
    if (!this.hasSdkBaseUrl()) {
      return null;
    }

    this.setLastError(null);

    try {
      const client = await this.getClient();
      const response = await client.character.unlike(id) as PlusApiResultVoid;
      if (!this.isSuccessCode(response.code)) {
        return this.failBusiness(response, 'Failed to unlike agent');
      }
      return true;
    } catch (error) {
      return this.failRequest(error, 'Failed to unlike agent');
    }
  }

  async markAgentUsed(id: string): Promise<boolean | null> {
    if (!this.hasSdkBaseUrl()) {
      return null;
    }

    this.setLastError(null);

    try {
      const client = await this.getClient();
      const response = await client.character.use(id) as PlusApiResultVoid;
      if (!this.isSuccessCode(response.code)) {
        return this.failBusiness(response, 'Failed to mark agent as used');
      }
      return true;
    } catch (error) {
      return this.failRequest(error, 'Failed to mark agent as used');
    }
  }
}

export function createAgentSdkService(_deps?: ServiceFactoryDeps): IAgentSdkService {
  return new AgentSdkServiceImpl(_deps);
}

export const agentSdkService: IAgentSdkService = createAgentSdkService();
