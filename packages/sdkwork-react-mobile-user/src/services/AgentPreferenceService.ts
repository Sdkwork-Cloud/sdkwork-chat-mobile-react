import { resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { AgentPreferenceOverride, IAgentPreferenceService } from '../types';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';

const TAG = 'AgentPreferenceService';
const STORAGE_KEYS = {
  hidden: 'sys_user_hidden_agents_v1',
  overrides: 'sys_user_agent_overrides_v1',
} as const;

class AgentPreferenceServiceImpl implements IAgentPreferenceService {
  private readonly deps: ServiceFactoryRuntimeDeps;

  constructor(deps?: ServiceFactoryDeps) {
    this.deps = resolveServiceFactoryRuntimeDeps(deps);
  }

  async getHiddenAgentIds(): Promise<string[]> {
    try {
      const value = await this.deps.storage.get<unknown>(STORAGE_KEYS.hidden);
      if (!Array.isArray(value)) return [];
      return value.filter((item): item is string => typeof item === 'string');
    } catch (error) {
      this.deps.logger.warn(TAG, 'Failed to read hidden agent ids', error);
      return [];
    }
  }

  async setHiddenAgentIds(agentIds: string[]): Promise<void> {
    try {
      await this.deps.storage.set(STORAGE_KEYS.hidden, agentIds);
    } catch (error) {
      this.deps.logger.warn(TAG, 'Failed to save hidden agent ids', error);
    }
  }

  async getAgentOverrides(): Promise<Record<string, AgentPreferenceOverride>> {
    try {
      const value = await this.deps.storage.get<unknown>(STORAGE_KEYS.overrides);
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return {};
      }
      return value as Record<string, AgentPreferenceOverride>;
    } catch (error) {
      this.deps.logger.warn(TAG, 'Failed to read agent overrides', error);
      return {};
    }
  }

  async setAgentOverrides(overrides: Record<string, AgentPreferenceOverride>): Promise<void> {
    try {
      await this.deps.storage.set(STORAGE_KEYS.overrides, overrides);
    } catch (error) {
      this.deps.logger.warn(TAG, 'Failed to save agent overrides', error);
    }
  }
}

export function createAgentPreferenceService(_deps?: ServiceFactoryDeps): IAgentPreferenceService {
  return new AgentPreferenceServiceImpl(_deps);
}

export const agentPreferenceService: IAgentPreferenceService = createAgentPreferenceService();
