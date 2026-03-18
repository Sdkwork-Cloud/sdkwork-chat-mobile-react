import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Icon, Page, Skeleton } from '@sdkwork/react-mobile-commons';
import { ChatInput } from '../components/ChatInput';
import { MessageList } from '../components/MessageList';
import { ChatSelectionBar } from '../components/ChatSelectionBar';
import { useChatSelection } from '../hooks/useChatSelection';
import { useChatStream } from '../hooks/useChatStream';
import { resolveSessionAgent } from '../config/agentRegistry';
import { chatService } from '../services/ChatService';
import { useChatStoreActions, useChatStoreState } from '../stores/chatStore';
import type { Message } from '../types';
import { resolveSessionDisplayName } from '../utils/resolveSessionDisplayName';
import { resolveChatBackground } from './chatBackgroundResolver';
import { resolveChatConfig } from './chatConfigResolver';
import './ChatPage.css';

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Invalid file data'));
        return;
      }
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error || new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });

interface ChatPageProps {
  t?: (key: string) => string;
  sessionId: string;
  globalBackground?: string;
  highlightMsgId?: string;
  onBack?: () => void;
  onDetails?: () => void;
  onForward?: (message: Message) => void;
  onNavigate?: (path: string, params?: Record<string, any>) => void;
}

export const ChatPage: React.FC<ChatPageProps> = ({
  t,
  sessionId,
  globalBackground,
  highlightMsgId,
  onBack,
  onDetails,
  onForward,
  onNavigate,
}) => {
  const { sessions, getSession } = useChatStoreState();
  const { markSessionRead } = useChatStoreActions();
  const { sendMessage, isLoading } = useChatStream();
  const tr = useCallback(
    (key: string, fallback: string) => {
      const value = t?.(key);
      if (value && value !== key) return value;
      return fallback;
    },
    [t]
  );
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [bgImage, setBgImage] = useState('');

  const {
    selectionMode,
    selectedIds,
    toggleSelection,
    enterSelectionMode,
    exitSelectionMode,
    deleteSelected,
    forwardSelected,
  } = useChatSelection({
    sessionId,
    t,
    onForward: () => {
      // Keep hook contract; actual forwarding is completed via page callbacks.
    },
  });

  const session = getSession(sessionId);
  const agent = resolveSessionAgent(session);

  useEffect(() => {
    setBgImage(
      resolveChatBackground({
        sessionBackground: session?.sessionConfig?.backgroundImage,
        globalBackground,
      })
    );
  }, [globalBackground, session?.sessionConfig?.backgroundImage]);

  useEffect(() => {
    if (sessionId && session?.unreadCount && session.unreadCount > 0) {
      void markSessionRead(sessionId);
    }
  }, [markSessionRead, session?.unreadCount, sessionId]);

  useEffect(() => {
    if (session) return;
    if (!onNavigate) return;
    const fallbackId = sessions[0]?.id;
    if (!fallbackId || fallbackId === sessionId) return;
    onNavigate('/chat', { id: fallbackId });
  }, [onNavigate, session, sessionId, sessions]);

  const handleSend = useCallback(
    async (text: string, replyMessage?: Message, imageFile?: File) => {
      if (!session || !agent) return;

      const replyContext = replyMessage
        ? {
            id: replyMessage.id,
            name: replyMessage.role === 'user' ? 'Me' : agent.name,
            content: replyMessage.content,
          }
        : undefined;

      let images: { mimeType: string; data: string }[] | undefined;
      if (imageFile) {
        try {
          const data = await fileToBase64(imageFile);
          images = [{ mimeType: imageFile.type || 'image/jpeg', data }];
        } catch (error) {
          console.error('[ChatPage] Failed to encode image:', error);
        }
      }

      await sendMessage(text, session, agent, replyContext, images);
      setReplyTo(null);
    },
    [agent, sendMessage, session]
  );

  const handleForward = useCallback(
    (msg: Message) => {
      if (onForward) {
        onForward(msg);
        return;
      }
      void chatService.setForwardContent(`[Forward]\n${msg.content}`).then((result) => {
        if (!result.success) {
          console.error('[ChatPage] Failed to cache forward content:', result.message);
        }
      });
      onNavigate?.('/contacts', { mode: 'select', action: 'forward' });
    },
    [onForward, onNavigate]
  );

  const handleDeleteMessage = useCallback(async (_id: string) => {
    // Placeholder: message delete is wired in service, this keeps the callback stable.
  }, []);

  const handleReply = useCallback((message: Message) => {
    setReplyTo(message);
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyTo(null);
  }, []);

  const handleMultiSelect = useCallback(
    (msg: Message) => {
      enterSelectionMode(msg.id);
    },
    [enterSelectionMode]
  );

  const handleWelcomeSend = useCallback(
    (action: string, payload: any) => {
      if (action !== 'send_text' || typeof payload !== 'string') return;
      void handleSend(payload);
    },
    [handleSend]
  );

  const chatConfig = useMemo(() => resolveChatConfig(session), [session?.sessionConfig?.showAvatar]);
  const pageTitle = useMemo(
    () => resolveSessionDisplayName(session, {
      fallback: 'OpenChat',
      groupFallback: tr('chat.group', 'Group'),
    }),
    [session, tr],
  );

  const rightNav = (
    <div className="chat-page__right-nav">
      {selectionMode ? (
        <button type="button" className="chat-page__nav-link" onClick={exitSelectionMode}>
          {tr('common.cancel', 'Cancel')}
        </button>
      ) : (
        <button type="button" className="chat-page__nav-btn" onClick={onDetails} aria-label="chat-menu">
          <Icon name="more" size={21} strokeWidth={2.2} />
        </button>
      )}
    </div>
  );

  if (!session) {
    return (
      <Page title={tr('chat.conversation', 'Conversation')} showBack onBack={onBack} noPadding>
        <div className="chat-page__empty-state">
          <div className="chat-page__empty-skeletons">
            <Skeleton width="100%" height={56} style={{ marginBottom: 12, borderRadius: 14 }} />
            <Skeleton width="82%" height={56} style={{ marginBottom: 12, borderRadius: 14 }} />
            <Skeleton width="68%" height={56} style={{ marginBottom: 20, borderRadius: 14 }} />
          </div>
          <div className="chat-page__empty-title">{tr('chat.session_loading', 'Loading conversation...')}</div>
          <div className="chat-page__empty-subtitle">
            {tr('chat.session_loading_tip', 'If loading takes too long, return to the conversation list and retry.')}
          </div>
          <button
            type="button"
            className="chat-page__empty-action"
            onClick={() => onNavigate?.('/conversation-list')}
          >
            {tr('chat.back_to_list', 'Back to conversation list')}
          </button>
        </div>
      </Page>
    );
  }

  return (
    <Page
      className="chat-page-root"
      title={pageTitle}
      showBack={Boolean(onBack)}
      onBack={onBack}
      rightElement={rightNav}
      noPadding
      background={bgImage ? 'none' : 'var(--bg-body)'}
      style={{
        backgroundImage: bgImage || 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {bgImage ? <div className="chat-page__bg-mask" /> : null}

      <div className={`chat-page${bgImage ? '' : ' chat-page--default-bg'}`}>
        <MessageList
          t={t}
          messages={session.messages || []}
          config={chatConfig}
          isStreaming={isLoading}
          highlightMsgId={highlightMsgId}
          selectionMode={selectionMode}
          selectedIds={selectedIds}
          onToggleSelection={toggleSelection}
          onReply={handleReply}
          onForward={handleForward}
          onMultiSelect={handleMultiSelect}
          onDelete={handleDeleteMessage}
          onInteract={handleWelcomeSend}
        />

        {selectionMode ? (
          <ChatSelectionBar
            selectedCount={selectedIds.size}
            onDelete={deleteSelected}
            onForward={forwardSelected}
          />
        ) : (
          <ChatInput
            t={t}
            sessionId={sessionId}
            onSend={handleSend}
            isLoading={isLoading}
            replyMessage={replyTo}
            onCancelReply={handleCancelReply}
          />
        )}
      </div>
    </Page>
  );
};

export default ChatPage;
