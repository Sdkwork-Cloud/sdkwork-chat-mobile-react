import React, { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { Icon, NavbarQuickActions, Page, Toast } from '@sdkwork/react-mobile-commons';
import type { NavbarQuickActionItem } from '@sdkwork/react-mobile-commons';
import { ChatListItem } from '../components/ChatListItem';
import { DEFAULT_AGENT_ID } from '../config/agentRegistry';
import { useChatStoreActions, useChatStoreState } from '../stores/chatStore';
import type { ChatSession } from '../types';
import './ChatListPage.css';

interface ConversationListPageProps {
  onChatClick?: (sessionId: string) => void;
  onNavigate?: (path: string, params?: Record<string, string>) => void;
  showBack?: boolean;
}

const INITIAL_VISIBLE_COUNT = 20;
const LOAD_MORE_STEP = 16;

export const ConversationListPage: React.FC<ConversationListPageProps> = ({
  onChatClick,
  onNavigate,
  showBack = false,
}) => {
  const { sessions } = useChatStoreState();
  const { createSession } = useChatStoreActions();
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const deferredSessions = useDeferredValue(sessions);
  const visibleSessions = useMemo(
    () => deferredSessions.slice(0, visibleCount),
    [deferredSessions, visibleCount]
  );
  const hasMoreSessions = visibleCount < deferredSessions.length;

  const handleNavigate = useCallback(
    (path: string, params?: Record<string, string>) => {
      onNavigate?.(path, params);
    },
    [onNavigate]
  );

  const handleChatClick = useCallback(
    (session: ChatSession) => {
      if (onChatClick) {
        onChatClick(session.id);
        return;
      }
      handleNavigate('/chat', { id: session.id });
    },
    [handleNavigate, onChatClick]
  );

  const startConversation = useCallback(async () => {
    try {
      const sessionId = await createSession(DEFAULT_AGENT_ID);
      if (sessionId) {
        handleNavigate('/chat', { id: sessionId });
        return;
      }
      handleNavigate('/agents');
    } catch (_error) {
      Toast.error('\u521b\u5efa\u4f1a\u8bdd\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5');
    }
  }, [createSession, handleNavigate]);

  const goAgents = useCallback(() => {
    handleNavigate('/agents');
  }, [handleNavigate]);

  const handleQuickAction = useCallback(
    async (key: string) => {
      if (key === 'group') {
        handleNavigate('/contacts', { mode: 'select', action: 'create_group' });
        return;
      }
      if (key === 'friend') {
        handleNavigate('/add-friend');
        return;
      }
      if (key === 'scan') {
        handleNavigate('/scan');
        return;
      }
      if (key === 'pay') {
        handleNavigate('/wallet');
      }
    },
    [handleNavigate]
  );

  const quickActions = useMemo<NavbarQuickActionItem[]>(
    () => [
      { key: 'group', label: '\u53d1\u8d77\u7fa4\u804a', icon: 'group', onClick: () => void handleQuickAction('group') },
      { key: 'friend', label: '\u6dfb\u52a0\u670b\u53cb', icon: 'addUser', onClick: () => void handleQuickAction('friend') },
      { key: 'scan', label: '\u626b\u4e00\u626b', icon: 'scan', onClick: () => void handleQuickAction('scan') },
      { key: 'pay', label: '\u6536\u4ed8\u6b3e', icon: 'money-transfer', onClick: () => void handleQuickAction('pay') },
    ],
    [handleQuickAction]
  );

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, [deferredSessions.length]);

  useEffect(() => {
    if (!hasMoreSessions) return;
    const loadMoreNode = loadMoreRef.current;
    if (!loadMoreNode) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisibleCount(deferredSessions.length);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        setVisibleCount((prev) => Math.min(prev + LOAD_MORE_STEP, deferredSessions.length));
      },
      {
        root: null,
        rootMargin: '220px 0px',
      }
    );

    observer.observe(loadMoreNode);
    return () => observer.disconnect();
  }, [deferredSessions.length, hasMoreSessions]);

  useEffect(() => {
    const onTabReselect = (event: Event) => {
      const customEvent = event as CustomEvent<{ tabId?: string }>;
      if (customEvent.detail?.tabId !== 'chat') return;
      setVisibleCount(INITIAL_VISIBLE_COUNT);
      const scroller = containerRef.current?.closest('.page-scroll-content') as HTMLElement | null;
      scroller?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('tabreselect', onTabReselect as EventListener);
    return () => window.removeEventListener('tabreselect', onTabReselect as EventListener);
  }, []);

  return (
    <Page
      title="\u4f1a\u8bdd"
      showBack={showBack}
      noPadding
      rightElement={
        <NavbarQuickActions
          onSearch={() => handleNavigate('/search')}
          actions={quickActions}
        />
      }
    >
      <div className="conversation-list-page" ref={containerRef}>
        {deferredSessions.length === 0 ? (
          <div className="conversation-list-page__empty">
            <div className="conversation-list-page__empty-icon">
              <Icon name="chat" size={22} />
            </div>
            <div className="conversation-list-page__empty-title">{'\u6682\u65e0\u4f1a\u8bdd'}</div>
            <div className="conversation-list-page__empty-subtitle">
              {'\u8fd8\u6ca1\u6709\u4f1a\u8bdd\u8bb0\u5f55\uff0c\u53d1\u8d77\u65b0\u5bf9\u8bdd\u6216\u524d\u5f80\u667a\u80fd\u4f53\u5e7f\u573a\u3002'}
            </div>
            <div className="conversation-list-page__empty-actions">
              <button
                type="button"
                className="conversation-list-page__empty-primary"
                onClick={() => {
                  void startConversation();
                }}
              >
                {'\u53d1\u8d77\u4f1a\u8bdd'}
              </button>
              <button
                type="button"
                className="conversation-list-page__empty-secondary"
                onClick={goAgents}
              >
                {'\u6d4f\u89c8\u667a\u80fd\u4f53'}
              </button>
            </div>
          </div>
        ) : (
          <div className="conversation-list-page__list">
            {visibleSessions.map((session) => (
              <ChatListItem key={session.id} session={session} onClick={handleChatClick} />
            ))}
            {hasMoreSessions ? <div ref={loadMoreRef} className="conversation-list-page__load-more" /> : null}
          </div>
        )}
      </div>
    </Page>
  );
};

export const ChatListPage = ConversationListPage;

export default ConversationListPage;
