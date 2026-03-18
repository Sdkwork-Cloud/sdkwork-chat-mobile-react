import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ChatSession, Message } from '../types';
import { chatService } from '../services/ChatService';
import type { Agent } from '../config/agentRegistry';
import type { CreateChatSessionOptions } from '../types';

interface ChatStoreStateContextType {
  sessions: ChatSession[];
  totalUnreadCount: number;
  getSession: (sessionId: string) => ChatSession | undefined;
}

interface ChatStoreActionsContextType {
  createSession: (agentId: string, agentProfile?: Partial<Agent>, options?: CreateChatSessionOptions) => Promise<string>;
  addMessage: (sessionId: string, message: Partial<Message>) => Promise<void>;
  updateMessage: (sessionId: string, messageId: string, updates: Partial<Message>) => void;
  updateMessageContent: (sessionId: string, messageId: string, content: string, isStreaming: boolean) => void;
  recallMessage: (sessionId: string, messageId: string) => Promise<void>;
  updateSessionConfig: (sessionId: string, config: { showAvatar?: boolean; backgroundImage?: string }) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  togglePin: (sessionId: string) => Promise<void>;
  toggleMute: (sessionId: string) => Promise<void>;
  markSessionRead: (sessionId: string) => Promise<void>;
  setSessionUnread: (sessionId: string, count: number) => Promise<void>;
  clearSessionMessages: (sessionId: string) => Promise<void>;
  clearStore: () => Promise<void>;
}

export type ChatStoreContextType = ChatStoreStateContextType & ChatStoreActionsContextType;

const createId = (): string => {
  const timeSeed =
    typeof performance !== 'undefined' && typeof performance.now === 'function'
      ? Math.floor(performance.now() * 1000)
      : new Date().getTime();
  return `chat_${timeSeed}_${Math.random().toString(36).slice(2, 10)}`;
};

const toSessionPreview = (content: string): string => {
  const value = (content || '').trim();
  if (!value) return '';
  if (value.startsWith('data:image')) return '[图片]';
  if (value.includes('[商品]') || value.includes('[product]')) return '[商品推荐]';
  if (value.startsWith('[语音]') || value.startsWith('🎤')) return '[语音消息]';
  if (value.startsWith('[文件]') || value.startsWith('📂') || value.startsWith('📁')) return '[文件]';
  if (value.startsWith('[位置]') || value.startsWith('📍')) return '[位置]';
  return value.length > 120 ? `${value.slice(0, 120)}...` : value;
};

const sortSessions = (list: ChatSession[]): ChatSession[] =>
  [...list].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.lastMessageTime - a.lastMessageTime;
  });

const isSameSessionSnapshot = (prev: ChatSession, next: ChatSession): boolean => {
  if (
    prev.id !== next.id ||
    prev.type !== next.type ||
    prev.agentId !== next.agentId ||
    prev.title !== next.title ||
    prev.groupName !== next.groupName ||
    prev.lastMessageContent !== next.lastMessageContent ||
    prev.lastMessageTime !== next.lastMessageTime ||
    prev.unreadCount !== next.unreadCount ||
    prev.isPinned !== next.isPinned ||
    prev.isMuted !== next.isMuted ||
    prev.updateTime !== next.updateTime
  ) {
    return false;
  }

  const prevConfig: NonNullable<ChatSession['sessionConfig']> = prev.sessionConfig || {};
  const nextConfig: NonNullable<ChatSession['sessionConfig']> = next.sessionConfig || {};
  if (
    prevConfig.showAvatar !== nextConfig.showAvatar ||
    prevConfig.backgroundImage !== nextConfig.backgroundImage
  ) {
    return false;
  }

  const prevMessages = Array.isArray(prev.messages) ? prev.messages : [];
  const nextMessages = Array.isArray(next.messages) ? next.messages : [];
  if (prevMessages.length !== nextMessages.length) return false;
  if (prevMessages.length === 0) return true;

  const prevLast = prevMessages[prevMessages.length - 1];
  const nextLast = nextMessages[nextMessages.length - 1];
  return (
    prevLast.id === nextLast.id &&
    prevLast.content === nextLast.content &&
    prevLast.status === nextLast.status &&
    prevLast.isStreaming === nextLast.isStreaming &&
    prevLast.updateTime === nextLast.updateTime
  );
};

const mergeSortedSessions = (prev: ChatSession[], next: ChatSession[]): ChatSession[] => {
  if (prev.length === 0) return next;

  const prevById = new Map(prev.map((item) => [item.id, item]));
  let changed = prev.length !== next.length;
  const merged = next.map((nextItem, index) => {
    const prevItem = prevById.get(nextItem.id);
    if (!prevItem) {
      changed = true;
      return nextItem;
    }

    if (!isSameSessionSnapshot(prevItem, nextItem)) {
      changed = true;
      return nextItem;
    }

    if (prev[index]?.id !== nextItem.id) {
      changed = true;
    }
    return prevItem;
  });

  return changed ? merged : prev;
};

const ChatStateContext = createContext<ChatStoreStateContextType | null>(null);
const ChatActionsContext = createContext<ChatStoreActionsContextType | null>(null);

export const ChatStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isReady, setIsReady] = useState(false);
  const refreshTimerRef = useRef<number | null>(null);

  const refreshSessions = useCallback(async () => {
    const res = await chatService.getSessionList();
    if (res.success && res.data) {
      const nextSorted = sortSessions(res.data);
      setSessions((prev) => mergeSortedSessions(prev, nextSorted));
    }
  }, []);

  const scheduleRefreshSessions = useCallback(() => {
    if (refreshTimerRef.current !== null) {
      window.clearTimeout(refreshTimerRef.current);
    }
    refreshTimerRef.current = window.setTimeout(() => {
      refreshTimerRef.current = null;
      void refreshSessions();
    }, 64);
  }, [refreshSessions]);

  useEffect(() => {
    const init = async () => {
      await refreshSessions();
      setIsReady(true);
    };
    void init();

    const unsubscribe = chatService.onSessionDataChanged(() => {
      scheduleRefreshSessions();
    });

    return () => {
      unsubscribe();
      if (refreshTimerRef.current !== null) {
        window.clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [refreshSessions, scheduleRefreshSessions]);

  const getSession = useCallback((sessionId: string) => sessions.find((s) => s.id === sessionId), [sessions]);

  const createSession = useCallback(async (agentId: string, agentProfile?: Partial<Agent>, options?: CreateChatSessionOptions) => {
    const res = await chatService.createSession(agentId, agentProfile, options);
    if (res.success && res.data) {
      const createdSession = res.data;
      setSessions((prev) => {
        const remaining = prev.filter((session) => session.id !== createdSession.id);
        return sortSessions([createdSession, ...remaining]);
      });
    }
    return res.data?.id || '';
  }, []);

  const addMessage = useCallback(async (sessionId: string, message: Partial<Message>) => {
    setSessions((prev) => {
      const session = prev.find((s) => s.id === sessionId);
      if (!session) return prev;

      const now = new Date().getTime();
      const newMessage: Message = {
        id: message.id || createId(),
        sessionId,
        role: message.role || 'user',
        content: message.content || '',
        isStreaming: message.isStreaming || false,
        status: message.status || 'sent',
        replyTo: message.replyTo,
        createTime: now,
        updateTime: now,
      };

      const updatedSession = {
        ...session,
        messages: [...session.messages, newMessage],
        lastMessageContent: toSessionPreview(newMessage.content),
        lastMessageTime: now,
        updateTime: now,
      };

      const otherSessions = prev.filter((s) => s.id !== sessionId);
      return sortSessions([updatedSession, ...otherSessions]);
    });

    await chatService.addMessage(sessionId, message);
  }, []);

  const updateMessage = useCallback((sessionId: string, messageId: string, updates: Partial<Message>) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        const targetIndex = s.messages.findIndex((m) => m.id === messageId);
        if (targetIndex < 0) return s;

        const isLastMessage = targetIndex === s.messages.length - 1;
        const shouldUpdatePreview =
          isLastMessage &&
          typeof updates.content === 'string' &&
          updates.content.length > 0 &&
          updates.isStreaming !== true;

        return {
          ...s,
          lastMessageContent: shouldUpdatePreview ? toSessionPreview(updates.content as string) : s.lastMessageContent,
          messages: s.messages.map((m) => (m.id === messageId ? { ...m, ...updates } : m)),
        };
      })
    );

    if (updates.isStreaming === true) {
      return;
    }
    void chatService.updateMessage(sessionId, messageId, updates);
  }, []);

  const updateMessageContent = useCallback(
    (sessionId: string, messageId: string, content: string, isStreaming: boolean) => {
      updateMessage(sessionId, messageId, { content, isStreaming });
    },
    [updateMessage]
  );

  const recallMessage = useCallback(async (sessionId: string, messageId: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        return {
          ...s,
          lastMessageContent: 'You recalled a message',
          messages: s.messages.map((m) =>
            m.id === messageId ? ({ ...m, role: 'system', content: 'You recalled a message', status: 'sent' } as Message) : m
          ),
        };
      })
    );
    await chatService.recallMessage(sessionId, messageId);
  }, []);

  const updateSessionConfig = useCallback(async (sessionId: string, config: { showAvatar?: boolean; backgroundImage?: string }) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        return { ...s, sessionConfig: { ...s.sessionConfig, ...config } };
      })
    );
    await chatService.updateSessionConfig(sessionId, config);
  }, []);

  const markSessionRead = useCallback(async (sessionId: string) => {
    setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, unreadCount: 0 } : s)));
    await chatService.markAsRead(sessionId);
  }, []);

  const setSessionUnread = useCallback(async (sessionId: string, count: number) => {
    setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, unreadCount: count } : s)));
    await chatService.setUnreadCount(sessionId, count);
  }, []);

  const deleteSession = useCallback(async (sessionId: string) => {
    await chatService.deleteById(sessionId);
  }, []);

  const togglePin = useCallback(async (sessionId: string) => {
    await chatService.togglePin(sessionId);
  }, []);

  const toggleMute = useCallback(async (sessionId: string) => {
    setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, isMuted: !s.isMuted } : s)));
    await chatService.toggleMute(sessionId);
  }, []);

  const clearSessionMessages = useCallback(async (sessionId: string) => {
    await chatService.clearHistory(sessionId);
  }, []);

  const clearStore = useCallback(async () => {
    await chatService.clearAll();
    window.location.reload();
  }, []);

  const totalUnreadCount = useMemo(
    () => sessions.reduce((acc, session) => acc + (session.unreadCount || 0), 0),
    [sessions]
  );

  const stateValue = useMemo<ChatStoreStateContextType>(
    () => ({
      sessions,
      totalUnreadCount,
      getSession,
    }),
    [sessions, totalUnreadCount, getSession]
  );

  const actionsValue = useMemo<ChatStoreActionsContextType>(
    () => ({
      createSession,
      addMessage,
      updateMessage,
      updateMessageContent,
      recallMessage,
      updateSessionConfig,
      deleteSession,
      togglePin,
      toggleMute,
      markSessionRead,
      setSessionUnread,
      clearSessionMessages,
      clearStore,
    }),
    [
      createSession,
      addMessage,
      updateMessage,
      updateMessageContent,
      recallMessage,
      updateSessionConfig,
      deleteSession,
      togglePin,
      toggleMute,
      markSessionRead,
      setSessionUnread,
      clearSessionMessages,
      clearStore,
    ]
  );

  if (!isReady) return null;

  return (
    <ChatStateContext.Provider value={stateValue}>
      <ChatActionsContext.Provider value={actionsValue}>
        {children}
      </ChatActionsContext.Provider>
    </ChatStateContext.Provider>
  );
};

export const useChatStoreState = () => {
  const context = useContext(ChatStateContext);
  if (!context) {
    throw new Error('useChatStore must be used within a ChatStoreProvider');
  }
  return context;
};

export const useChatStoreActions = () => {
  const context = useContext(ChatActionsContext);
  if (!context) {
    throw new Error('useChatStore must be used within a ChatStoreProvider');
  }
  return context;
};

export const useChatStore = (): ChatStoreContextType => {
  const state = useChatStoreState();
  const actions = useChatStoreActions();
  return useMemo(
    () => ({
      ...state,
      ...actions,
    }),
    [state, actions]
  );
};
