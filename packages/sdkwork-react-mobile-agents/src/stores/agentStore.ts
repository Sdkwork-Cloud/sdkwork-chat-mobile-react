import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getPersistStorage } from '@sdkwork/react-mobile-core';
import type { Agent, AgentConversation, AgentPromptTemplate, AgentMessage } from '../types';

interface AgentState {
  // Agents
  agents: Agent[];
  currentAgent: Agent | null;
  favoriteAgents: Agent[];
  defaultAgentId: string | null;
  isLoadingAgents: boolean;
  
  // Conversations
  conversations: AgentConversation[];
  currentConversation: AgentConversation | null;
  isLoadingConversations: boolean;
  
  // Templates
  templates: AgentPromptTemplate[];
  isLoadingTemplates: boolean;
  
  // Streaming
  streamingMessageId: string | null;
  streamingContent: string;
  
  // Actions
  setAgents: (agents: Agent[]) => void;
  setCurrentAgent: (agent: Agent | null) => void;
  setFavoriteAgents: (agents: Agent[]) => void;
  setDefaultAgentId: (id: string | null) => void;
  setIsLoadingAgents: (loading: boolean) => void;
  
  setConversations: (conversations: AgentConversation[]) => void;
  setCurrentConversation: (conversation: AgentConversation | null) => void;
  setIsLoadingConversations: (loading: boolean) => void;
  addMessage: (conversationId: string, message: AgentMessage) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<AgentMessage>) => void;
  
  setTemplates: (templates: AgentPromptTemplate[]) => void;
  setIsLoadingTemplates: (loading: boolean) => void;
  
  setStreamingMessageId: (id: string | null) => void;
  setStreamingContent: (content: string) => void;
  appendStreamingContent: (content: string) => void;
  
  // Reset
  reset: () => void;
}

const initialState = {
  agents: [],
  currentAgent: null,
  favoriteAgents: [],
  defaultAgentId: null,
  isLoadingAgents: false,
  
  conversations: [],
  currentConversation: null,
  isLoadingConversations: false,
  
  templates: [],
  isLoadingTemplates: false,
  
  streamingMessageId: null,
  streamingContent: '',
};

export const useAgentStore = create<AgentState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setAgents: (agents) => set({ agents }),
      setCurrentAgent: (currentAgent) => set({ currentAgent }),
      setFavoriteAgents: (favoriteAgents) => set({ favoriteAgents }),
      setDefaultAgentId: (defaultAgentId) => set({ defaultAgentId }),
      setIsLoadingAgents: (isLoadingAgents) => set({ isLoadingAgents }),
      
      setConversations: (conversations) => set({ conversations }),
      setCurrentConversation: (currentConversation) => set({ currentConversation }),
      setIsLoadingConversations: (isLoadingConversations) => set({ isLoadingConversations }),
      
      addMessage: (conversationId, message) => {
        const { conversations } = get();
        const updatedConversations = conversations.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              messages: [...conv.messages, message],
              messageCount: conv.messageCount + 1,
              lastMessageAt: message.createdAt,
            };
          }
          return conv;
        });
        set({ conversations: updatedConversations });
      },
      
      updateMessage: (conversationId, messageId, updates) => {
        const { conversations } = get();
        const updatedConversations = conversations.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              messages: conv.messages.map(msg => 
                msg.id === messageId ? { ...msg, ...updates } : msg
              ),
            };
          }
          return conv;
        });
        set({ conversations: updatedConversations });
      },
      
      setTemplates: (templates) => set({ templates }),
      setIsLoadingTemplates: (isLoadingTemplates) => set({ isLoadingTemplates }),
      
      setStreamingMessageId: (streamingMessageId) => set({ streamingMessageId }),
      setStreamingContent: (streamingContent) => set({ streamingContent }),
      appendStreamingContent: (content) => {
        const { streamingContent } = get();
        set({ streamingContent: streamingContent + content });
      },
      
      reset: () => set(initialState),
    }),
    {
      name: 'agent-storage',
      storage: createJSONStorage(getPersistStorage),
      version: 2,
      partialize: (state) => ({
        defaultAgentId: state.defaultAgentId,
      }),
      merge: (persistedState, currentState) => {
        const persisted = (persistedState as Partial<AgentState> | undefined) ?? {};
        const favoriteAgents = Array.isArray((persisted as { favoriteAgents?: unknown }).favoriteAgents)
          ? (persisted as { favoriteAgents?: unknown[] }).favoriteAgents
          : [];

        return {
          ...currentState,
          ...persisted,
          // Ensure old persisted "favoriteAgents: string[]" payload does not break runtime.
          favoriteAgents: favoriteAgents.length > 0 && typeof favoriteAgents[0] === 'object'
            ? (favoriteAgents as Agent[])
            : [],
        };
      },
    }
  )
);
