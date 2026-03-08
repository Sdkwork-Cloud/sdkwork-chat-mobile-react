import type { AgentPreferenceOverride } from '../types';

const AGENT_INTERVAL_DAYS = 3;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

export interface AgentRegistryItem {
  id: string;
  name: string;
  avatar: string;
  description: string;
  tags: string[];
}

export interface DisplayAgent extends AgentRegistryItem {
  createTime: number;
}

export type AgentRegistryMap = Record<string, AgentRegistryItem>;

export function buildAgentList(registry: AgentRegistryMap, now: number = Date.now()): DisplayAgent[] {
  const entries = Object.values(registry).filter(
    (item) => item.id.startsWith('custom_') || item.tags.includes('mine')
  );
  const list = entries.length > 0 ? entries : Object.values(registry).slice(0, 3);

  return list.map((item, index) => ({
    ...item,
    createTime: now - DAY_IN_MS * AGENT_INTERVAL_DAYS * (index + 1),
  }));
}

export function applyAgentPreferences(
  agents: DisplayAgent[],
  hiddenIds: Set<string>,
  overrides: Record<string, AgentPreferenceOverride>
): DisplayAgent[] {
  return agents
    .filter((item) => !hiddenIds.has(item.id))
    .map((item) => ({
      ...item,
      name: overrides[item.id]?.name || item.name,
      description: overrides[item.id]?.description || item.description,
    }));
}

export function formatAgentCreatedDate(value: number): string {
  return new Date(value).toLocaleDateString();
}

export function resolveAgentAvatarText(agent: Pick<DisplayAgent, 'avatar' | 'name'>): string {
  const avatar = agent.avatar?.trim();
  if (avatar) return avatar;
  const name = agent.name?.trim();
  if (name) return name.slice(0, 1).toUpperCase();
  return 'A';
}
