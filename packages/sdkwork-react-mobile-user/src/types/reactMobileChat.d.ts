declare module '@sdkwork/react-mobile-chat' {
  export interface AgentRegistryEntry {
    id: string;
    name: string;
    avatar: string;
    description: string;
    tags: string[];
  }

  export const AGENT_REGISTRY: Record<string, AgentRegistryEntry>;
}
