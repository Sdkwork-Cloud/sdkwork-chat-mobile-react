import { useCallback, useEffect, useRef } from 'react';
import { useAgentStore } from '../stores/agentStore';
import { agentService } from '../services/AgentService';
import type { Agent, AgentConfig } from '../types';

export function useAgents() {
  const agents = useAgentStore((state) => state.agents);
  const currentAgent = useAgentStore((state) => state.currentAgent);
  const favoriteAgents = useAgentStore((state) => state.favoriteAgents);
  const defaultAgentId = useAgentStore((state) => state.defaultAgentId);
  const isLoading = useAgentStore((state) => state.isLoadingAgents);

  const setAgents = useAgentStore((state) => state.setAgents);
  const setCurrentAgent = useAgentStore((state) => state.setCurrentAgent);
  const setFavoriteAgents = useAgentStore((state) => state.setFavoriteAgents);
  const setDefaultAgentId = useAgentStore((state) => state.setDefaultAgentId);
  const setIsLoadingAgents = useAgentStore((state) => state.setIsLoadingAgents);

  const initializedRef = useRef(false);

  const loadAgents = useCallback(async () => {
    setIsLoadingAgents(true);
    try {
      const nextAgents = await agentService.getAgents();
      setAgents(nextAgents);
      
      // Load default agent
      const defaultAgent = await agentService.getDefaultAgent();
      if (defaultAgent) {
        setDefaultAgentId(defaultAgent.id);
      }
      
      // Load favorites
      const favorites = await agentService.getFavoriteAgents();
      setFavoriteAgents(favorites);
      
      return nextAgents;
    } finally {
      setIsLoadingAgents(false);
    }
  }, [setAgents, setDefaultAgentId, setFavoriteAgents, setIsLoadingAgents]);

  const loadAgent = useCallback(async (id: string) => {
    setIsLoadingAgents(true);
    try {
      const agent = await agentService.getAgentById(id);
      setCurrentAgent(agent);
      return agent;
    } finally {
      setIsLoadingAgents(false);
    }
  }, [setCurrentAgent, setIsLoadingAgents]);

  const setDefaultAgent = useCallback(async (agentId: string) => {
    await agentService.setDefaultAgent(agentId);
    setDefaultAgentId(agentId);
  }, [setDefaultAgentId]);

  const toggleFavorite = useCallback(async (agentId: string) => {
    const isFavorite = await agentService.toggleFavorite(agentId);
    // Refresh favorites
    const favorites = await agentService.getFavoriteAgents();
    setFavoriteAgents(favorites);
    return isFavorite;
  }, [setFavoriteAgents]);

  const updateAgentConfig = useCallback(async (agentId: string, config: Partial<AgentConfig>) => {
    const agent = await agentService.updateAgentConfig(agentId, config);
    if (!agent) {
      return null;
    }

    const state = useAgentStore.getState();
    if (state.currentAgent?.id === agentId) {
      setCurrentAgent(agent);
    }
    setAgents(state.agents.map((a) => (a.id === agentId ? agent : a)));

    return agent;
  }, [setAgents, setCurrentAgent]);

  const getAgentsByCapability = useCallback((capability: string) => {
    return agents.filter((a) => a.capabilities.includes(capability as any));
  }, [agents]);

  const initialize = useCallback(async () => {
    await agentService.initialize();
    await loadAgents();
  }, [loadAgents]);

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }
    initializedRef.current = true;
    void initialize();
  }, [initialize]);

  // Listen for agent events
  useEffect(() => {
    const unsubscribers: (() => void)[] = [
      agentService.onDefaultAgentChanged((agentId: string) => {
        setDefaultAgentId(agentId);
      }),
      agentService.onFavoriteToggled(() => {
        void agentService.getFavoriteAgents().then((favorites) => {
          setFavoriteAgents(favorites);
        });
      }),
      agentService.onConfigUpdated((agent: Agent) => {
        const state = useAgentStore.getState();
        if (state.currentAgent?.id === agent.id) {
          setCurrentAgent(agent);
        }
        setAgents(state.agents.map((a) => (a.id === agent.id ? agent : a)));
      }),
    ];

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [setAgents, setCurrentAgent, setDefaultAgentId, setFavoriteAgents]);

  return {
    // State
    agents,
    currentAgent,
    favoriteAgents,
    defaultAgentId,
    isLoading,
    
    // Actions
    loadAgents,
    loadAgent,
    setDefaultAgent,
    toggleFavorite,
    updateAgentConfig,
    getAgentsByCapability,
    initialize,
  };
}
