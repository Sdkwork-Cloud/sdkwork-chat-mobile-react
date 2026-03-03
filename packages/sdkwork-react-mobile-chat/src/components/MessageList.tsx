import React, { useRef, useEffect, useState, useMemo, useLayoutEffect, useCallback } from 'react';
import { Message, ChatConfig } from '../types';
import { ChatMessageItem } from './ChatMessageItem';
import { useChatStoreActions, useChatStoreState } from '../stores/chatStore';
import { getAgent } from '../config/agentRegistry';

interface MessageListProps {
  t?: (key: string) => string;
  messages: Message[];
  config: ChatConfig;
  isStreaming: boolean;
  highlightMsgId?: string;
  selectionMode: boolean;
  selectedIds: Set<string>;
  onToggleSelection: (id: string) => void;
  onReply: (message: Message) => void;
  onForward: (message: Message) => void;
  onMultiSelect: (message: Message) => void;
  onDelete: (id: string) => void;
  onInteract?: (action: string, payload: any) => void;
}

const DISPLAY_TIME_THRESHOLD = 5 * 60 * 1000;
const INITIAL_MESSAGE_WINDOW = 90;
const MESSAGE_WINDOW_STEP = 70;

const resolveLocaleCode = (): 'zh-CN' | 'en-US' => {
  if (typeof document === 'undefined' || typeof navigator === 'undefined') {
    return 'zh-CN';
  }
  const htmlLang = (document.documentElement.lang || '').toLowerCase();
  const navLang = (navigator.language || '').toLowerCase();
  const lang = htmlLang || navLang;
  return lang.startsWith('en') ? 'en-US' : 'zh-CN';
};

const TimeDivider: React.FC<{ timestamp: number; locale: 'zh-CN' | 'en-US'; yesterdayLabel: string }> = React.memo(({
  timestamp,
  locale,
  yesterdayLabel,
}) => {
  const formatDate = (ts: number) => {
    const date = new Date(ts);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) {
      return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    }
    if (isYesterday) {
      return `${yesterdayLabel} ${date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
  };

  return (
    <div
      style={{
        position: 'sticky',
        top: '12px',
        zIndex: 5,
        textAlign: 'center',
        marginBottom: '18px',
        pointerEvents: 'none',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <span
        style={{
          fontSize: '11px',
          color: 'var(--text-secondary)',
          fontWeight: 520,
          backgroundColor: 'rgba(var(--bg-card-rgb, 255, 255, 255), 0.76)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          padding: '4px 12px',
          borderRadius: '12px',
          border: '0.5px solid rgba(120, 132, 155, 0.2)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          letterSpacing: '0.5px',
        }}
      >
        {formatDate(timestamp)}
      </span>
    </div>
  );
});

const resolveWelcomePrompts = (agentId: string | undefined, locale: 'zh-CN' | 'en-US'): string[] => {
  const isEnglish = locale === 'en-US';
  switch (agentId) {
    case 'agent_image':
      return isEnglish
        ? ['A cyberpunk-style cat', 'Future city, neon lights, rainy night', 'Minimal logo design', 'A poster in Ghibli style']
        : ['A cyberpunk-style cat', 'Future city, neon lights, rainy night', 'Minimal logo design', 'Poster in Ghibli style'];
    case 'agent_coder':
      return isEnglish
        ? ['Build a React counter component', 'Explain TypeScript generics', 'How to debug memory leaks', 'Optimize this SQL query']
        : ['Build a React counter component', 'Explain TypeScript generics', 'How to debug memory leaks', 'Optimize this SQL query'];
    case 'agent_writer':
      return isEnglish
        ? ['Help me draft a weekly report', 'Write short video copy', 'Polish this business email', 'Create an event headline']
        : ['Help me write a weekly report', 'Write short video copy', 'Polish this business email', 'Create an event poster title'];
    case 'agent_english':
      return ['Let us practice speaking', 'Correct my grammar', 'Teach me useful idioms', 'Roleplay ordering coffee'];
    default:
      return isEnglish
        ? ['Hello', 'Introduce yourself', 'What can you do for me?']
        : ['Hello', 'Introduce yourself', 'What is new?'];
  }
};

const WelcomeChips: React.FC<{
  sessionId: string;
  locale: 'zh-CN' | 'en-US';
  title: string;
  onSend: (text: string) => void;
}> = ({ sessionId, locale, title, onSend }) => {
  const { getSession } = useChatStoreState();
  const session = getSession(sessionId);
  const agent = session ? getAgent(session.agentId) : undefined;
  const prompts = resolveWelcomePrompts(agent?.id, locale);

  return (
    <div
      style={{
        padding: '22px 18px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        marginTop: '14px',
        opacity: 0.9,
      }}
    >
      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{title}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
        {prompts.map((prompt) => (
          <div
            key={prompt}
            onClick={() => onSend(prompt)}
            style={{
              background: 'rgba(var(--bg-card-rgb, 255, 255, 255), 0.9)',
              padding: '8px 14px',
              borderRadius: '15px',
              fontSize: '13px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              border: '0.5px solid rgba(120, 132, 155, 0.24)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              transition: 'all 0.2s',
            }}
          >
            {prompt}
          </div>
        ))}
      </div>
    </div>
  );
};

export const MessageList: React.FC<MessageListProps> = React.memo(({
  t,
  messages,
  config,
  isStreaming,
  highlightMsgId,
  selectionMode,
  selectedIds,
  onToggleSelection,
  onReply,
  onForward,
  onMultiSelect,
  onDelete,
  onInteract,
}) => {
  const tr = useCallback(
    (key: string, fallback: string) => {
      const value = t?.(key);
      if (value && value !== key) return value;
      return fallback;
    },
    [t]
  );
  const locale = useMemo(resolveLocaleCode, []);
  const { recallMessage } = useChatStoreActions();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const topAnchorRef = useRef<HTMLButtonElement>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollRafRef = useRef<number | null>(null);
  const olderRestoreRef = useRef<{ prevHeight: number; prevTop: number } | null>(null);
  const loadingOlderRef = useRef(false);

  const [showScrollButton, setShowScrollButton] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [visibleCount, setVisibleCount] = useState(INITIAL_MESSAGE_WINDOW);

  const isNearBottom = useRef(true);
  const lastMessageCount = useRef(0);
  const [flashId, setFlashId] = useState<string | null>(null);

  const sessionId = messages.length > 0 ? messages[0].sessionId : 'empty';
  const highlightIndex = useMemo(() => {
    if (!highlightMsgId) return -1;
    return messages.findIndex((item) => item.id === highlightMsgId);
  }, [highlightMsgId, messages]);
  const renderStartIndex = useMemo(() => {
    if (selectionMode) return 0;
    const tailStart = Math.max(0, messages.length - visibleCount);
    if (highlightIndex >= 0 && highlightIndex < tailStart) {
      return Math.max(0, highlightIndex - 12);
    }
    return tailStart;
  }, [highlightIndex, messages.length, selectionMode, visibleCount]);
  const visibleMessages = useMemo(
    () => messages.slice(renderStartIndex),
    [messages, renderStartIndex]
  );
  const hasOlderMessages = renderStartIndex > 0;
  const normalMessageCount = useMemo(
    () => messages.filter((item) => item.role !== 'system').length,
    [messages]
  );

  const loadOlderMessages = useCallback(() => {
    if (!hasOlderMessages || loadingOlderRef.current) return;
    if (!containerRef.current) return;

    loadingOlderRef.current = true;
    olderRestoreRef.current = {
      prevHeight: containerRef.current.scrollHeight,
      prevTop: containerRef.current.scrollTop,
    };

    setVisibleCount((prev) => {
      const next = Math.min(messages.length, prev + MESSAGE_WINDOW_STEP);
      if (next === prev) {
        loadingOlderRef.current = false;
        olderRestoreRef.current = null;
      }
      return next;
    });
  }, [hasOlderMessages, messages.length]);

  const handleRecall = (id: string) => {
    const msg = messages.find((m) => m.id === id);
    if (msg) {
      void recallMessage(msg.sessionId, id);
    }
  };

  const renderList = useMemo(() => {
    const result: React.ReactNode[] = [];
    let lastTime = renderStartIndex > 0 ? messages[renderStartIndex - 1].createTime : 0;

    visibleMessages.forEach((msg, idx) => {
      const absoluteIndex = renderStartIndex + idx;
      if (absoluteIndex === 0 || msg.createTime - lastTime > DISPLAY_TIME_THRESHOLD) {
        result.push(
          <TimeDivider
            key={`time-${msg.id}`}
            timestamp={msg.createTime}
            locale={locale}
            yesterdayLabel={tr('chat.yesterday', 'Yesterday')}
          />
        );
        lastTime = msg.createTime;
      }

      const prevMsg = messages[absoluteIndex - 1];
      const isGroupStart =
        !prevMsg ||
        prevMsg.role !== msg.role ||
        msg.createTime - prevMsg.createTime > DISPLAY_TIME_THRESHOLD;

      result.push(
        <div key={msg.id} ref={(el) => { messageRefs.current[msg.id] = el; }}>
          <ChatMessageItem
            message={msg}
            config={config}
            isGroupStart={isGroupStart}
            selectionMode={selectionMode}
            isSelected={selectedIds.has(msg.id)}
            isHighlighted={msg.id === flashId}
            onToggleSelection={onToggleSelection}
            onReply={onReply}
            onForward={onForward}
            onMultiSelect={onMultiSelect}
            onDelete={onDelete}
            onRecall={handleRecall}
            onInteract={onInteract}
            t={t}
          />
        </div>
      );
    });

    result.push(<div key="spacer" style={{ height: '24px' }} />);
    return result;
  }, [
    visibleMessages,
    renderStartIndex,
    messages,
    config,
    selectionMode,
    selectedIds,
    flashId,
    locale,
    onDelete,
    onForward,
    onInteract,
    onMultiSelect,
    onReply,
    onToggleSelection,
    t,
    tr,
  ]);

  const handleScroll = useCallback(() => {
    if (scrollRafRef.current !== null) return;
    scrollRafRef.current = window.requestAnimationFrame(() => {
      scrollRafRef.current = null;
      if (!containerRef.current) return;
      const { scrollHeight, scrollTop, clientHeight } = containerRef.current;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

      const threshold = 150;
      const isSticky = distanceFromBottom < threshold;
      isNearBottom.current = isSticky;

      const shouldShowButton = distanceFromBottom > 300;
      setShowScrollButton((prev) => (prev === shouldShowButton ? prev : shouldShowButton));
      if (isSticky) {
        setUnreadCount((prev) => (prev === 0 ? prev : 0));
      }
    });
  }, []);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
      setUnreadCount(0);
    }
    isNearBottom.current = true;
  };

  useEffect(() => {
    setVisibleCount(INITIAL_MESSAGE_WINDOW);
    loadingOlderRef.current = false;
    olderRestoreRef.current = null;
  }, [sessionId]);

  useEffect(() => {
    if (!hasOlderMessages) return;
    const root = containerRef.current;
    const anchor = topAnchorRef.current;
    if (!root || !anchor || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadOlderMessages();
        }
      },
      {
        root,
        rootMargin: '140px 0px 0px 0px',
        threshold: 0.01,
      }
    );
    observer.observe(anchor);
    return () => observer.disconnect();
  }, [hasOlderMessages, loadOlderMessages, renderStartIndex]);

  useLayoutEffect(() => {
    if (!loadingOlderRef.current || !containerRef.current || !olderRestoreRef.current) return;
    const { prevHeight, prevTop } = olderRestoreRef.current;
    const currentHeight = containerRef.current.scrollHeight;
    const heightDelta = currentHeight - prevHeight;
    containerRef.current.scrollTop = prevTop + heightDelta;
    olderRestoreRef.current = null;
    loadingOlderRef.current = false;
  }, [visibleCount, renderStartIndex]);

  useEffect(() => {
    if (highlightMsgId && messageRefs.current[highlightMsgId]) {
      isNearBottom.current = false;
      messageRefs.current[highlightMsgId]?.scrollIntoView({ behavior: 'auto', block: 'center' });
      setFlashId(highlightMsgId);
      const timer = setTimeout(() => setFlashId(null), 2000);
      return () => clearTimeout(timer);
    }

    if (messages.length > 0 && lastMessageCount.current === 0) {
      scrollToBottom('auto');
    }
  }, [highlightMsgId, messages.length, sessionId]);

  useLayoutEffect(() => {
    const newMsgCount = messages.length - lastMessageCount.current;

    if (newMsgCount > 0) {
      if (isNearBottom.current && !selectionMode && !highlightMsgId) {
        scrollToBottom(isStreaming ? 'smooth' : 'auto');
      } else {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg.role === 'user') {
          scrollToBottom('smooth');
        } else if (!isStreaming) {
          setUnreadCount((prev) => prev + newMsgCount);
        }
      }
    }

    lastMessageCount.current = messages.length;
  }, [messages, isStreaming, selectionMode, highlightMsgId]);

  useEffect(() => () => {
    if (scrollRafRef.current !== null) {
      window.cancelAnimationFrame(scrollRafRef.current);
      scrollRafRef.current = null;
    }
  }, []);

  const showWelcome = normalMessageCount === 0 && !isStreaming;

  return (
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '4px 0 0',
          scrollBehavior: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {hasOlderMessages ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 6px' }}>
            <button
              type="button"
              ref={topAnchorRef}
              onClick={loadOlderMessages}
              style={{
                border: 'none',
                borderRadius: '999px',
                background: 'rgba(var(--bg-card-rgb, 255, 255, 255), 0.9)',
                color: 'var(--text-secondary)',
                fontSize: '12px',
                padding: '6px 10px',
                borderWidth: '0.5px',
                borderStyle: 'solid',
                borderColor: 'rgba(120, 132, 155, 0.26)',
              }}
            >
              {tr('chat.load_older_messages', 'Load earlier messages')}
            </button>
          </div>
        ) : null}
        {renderList}

        {showWelcome && onInteract && (
          <WelcomeChips
            sessionId={sessionId}
            locale={locale}
            title={tr('chat.welcome_prompt_title', 'Try asking me:')}
            onSend={(text) => onInteract('send_text', text)}
          />
        )}

        <div ref={messagesEndRef} style={{ height: '1px' }} />
      </div>

      <div
        onClick={() => scrollToBottom('smooth')}
        style={{
          position: 'absolute',
          bottom: '18px',
          right: '16px',
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          background: 'rgba(var(--bg-card-rgb, 255, 255, 255), 0.94)',
          boxShadow: '0 8px 20px rgba(18, 30, 54, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10,
          border: '0.5px solid rgba(120, 132, 155, 0.24)',
          color: 'var(--primary-color)',
          opacity: showScrollButton && !selectionMode ? 1 : 0,
          transform: showScrollButton && !selectionMode ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(20px)',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          pointerEvents: showScrollButton && !selectionMode ? 'auto' : 'none',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9" />
        </svg>

        {unreadCount > 0 && (
          <div
            style={{
              position: 'absolute',
              top: -5,
              right: -5,
              background: '#fa5151',
              color: 'white',
              fontSize: '10px',
              height: '16px',
              minWidth: '16px',
              borderRadius: '8px',
              padding: '0 4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              border: '2px solid rgba(var(--bg-card-rgb, 255, 255, 255), 0.94)',
            }}
          >
            {unreadCount}
          </div>
        )}
      </div>
    </div>
  );
});

MessageList.displayName = 'MessageList';
