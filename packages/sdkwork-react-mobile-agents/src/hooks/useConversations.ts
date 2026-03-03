import { useCallback, useEffect } from 'react';
import { useAgentStore } from '../stores/agentStore';
import { agentService } from '../services/AgentService';
import type { AgentConversation } from '../types';

const sortConversations = (items: AgentConversation[]) =>
  [...items].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
  });

export function useConversations() {
  const conversations = useAgentStore((state) => state.conversations);
  const currentConversation = useAgentStore((state) => state.currentConversation);
  const isLoading = useAgentStore((state) => state.isLoadingConversations);
  const streamingMessageId = useAgentStore((state) => state.streamingMessageId);
  const streamingContent = useAgentStore((state) => state.streamingContent);

  const setConversations = useAgentStore((state) => state.setConversations);
  const setCurrentConversation = useAgentStore((state) => state.setCurrentConversation);
  const setIsLoadingConversations = useAgentStore((state) => state.setIsLoadingConversations);
  const addMessage = useAgentStore((state) => state.addMessage);
  const setStreamingMessageId = useAgentStore((state) => state.setStreamingMessageId);

  const upsertConversation = useCallback((conversation: AgentConversation) => {
    const state = useAgentStore.getState();
    const merged = [conversation, ...state.conversations.filter((c) => c.id !== conversation.id)];
    setConversations(sortConversations(merged));
  }, [setConversations]);

  const loadConversations = useCallback(async (agentId?: string) => {
    setIsLoadingConversations(true);
    try {
      const nextConversations = await agentService.getConversations(agentId);
      setConversations(nextConversations);
      return nextConversations;
    } finally {
      setIsLoadingConversations(false);
    }
  }, [setConversations, setIsLoadingConversations]);

  const loadConversation = useCallback(async (id: string) => {
    setIsLoadingConversations(true);
    try {
      const conversation = await agentService.getConversationById(id);
      setCurrentConversation(conversation);
      return conversation;
    } finally {
      setIsLoadingConversations(false);
    }
  }, [setCurrentConversation, setIsLoadingConversations]);

  const createConversation = useCallback(async (agentId: string, title?: string) => {
    const conversation = await agentService.createConversation(agentId, title);
    upsertConversation(conversation);
    setCurrentConversation(conversation);
    return conversation;
  }, [setCurrentConversation, upsertConversation]);

  const deleteConversation = useCallback(async (id: string) => {
    await agentService.deleteConversation(id);
    const state = useAgentStore.getState();
    setConversations(state.conversations.filter((c) => c.id !== id));
    if (state.currentConversation?.id === id) {
      setCurrentConversation(null);
    }
  }, [setConversations, setCurrentConversation]);

  const pinConversation = useCallback(async (id: string, isPinned: boolean) => {
    await agentService.pinConversation(id, isPinned);
    const state = useAgentStore.getState();
    const updatedConversations = state.conversations.map((c) =>
      c.id === id ? { ...c, isPinned } : c
    );
    setConversations(sortConversations(updatedConversations));
  }, [setConversations]);

  const archiveConversation = useCallback(async (id: string) => {
    await agentService.archiveConversation(id);
    const state = useAgentStore.getState();
    setConversations(state.conversations.filter((c) => c.id !== id));
    if (state.currentConversation?.id === id) {
      setCurrentConversation(null);
    }
  }, [setConversations, setCurrentConversation]);

  const sendMessage = useCallback(async (
    conversationId: string,
    content: string,
    role: 'user' | 'assistant' = 'user'
  ) => {
    const message = await agentService.sendMessage(conversationId, content, role);
    addMessage(conversationId, message);
    
    // Keep latest conversation at top after message update.
    const state = useAgentStore.getState();
    setConversations(sortConversations(state.conversations));
    
    return message;
  }, [addMessage, setConversations]);

  const simulateAIResponse = useCallback(async (conversationId: string) => {
    // Simulate typing delay
    setStreamingMessageId('typing');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a mock response
    const responses = [
      "That's an interesting question! Let me think about it...",
      "I understand what you're asking. Here's my perspective:",
      "Great question! I'd be happy to help with that.",
      "Thanks for sharing that. Let me provide some insights:",
    ];
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    setStreamingMessageId(null);
    
    // Send the AI response
    const message = await sendMessage(conversationId, response, 'assistant');
    return message;
  }, [sendMessage, setStreamingMessageId]);

  // Listen for conversation events
  useEffect(() => {
    const unsubscribers: (() => void)[] = [
      agentService.onConversationCreated((conversation: AgentConversation) => {
        upsertConversation(conversation);
      }),
      agentService.onConversationDeleted((id: string) => {
        const state = useAgentStore.getState();
        setConversations(state.conversations.filter((c: AgentConversation) => c.id !== id));
        if (state.currentConversation?.id === id) {
          setCurrentConversation(null);
        }
      }),
      agentService.onConversationPinned(({ id, isPinned }: { id: string; isPinned: boolean }) => {
        const state = useAgentStore.getState();
        const updated = state.conversations.map((c: AgentConversation) =>
          c.id === id ? { ...c, isPinned } : c
        );
        setConversations(sortConversations(updated));
      }),
      agentService.onConversationArchived((id: string) => {
        const state = useAgentStore.getState();
        setConversations(state.conversations.filter((c: AgentConversation) => c.id !== id));
        if (state.currentConversation?.id === id) {
          setCurrentConversation(null);
        }
      }),
    ];

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [setConversations, setCurrentConversation, upsertConversation]);

  return {
    // State
    conversations,
    currentConversation,
    isLoading,
    streamingMessageId,
    streamingContent,
    
    // Actions
    loadConversations,
    loadConversation,
    createConversation,
    deleteConversation,
    pinConversation,
    archiveConversation,
    sendMessage,
    simulateAIResponse,
  };
}
