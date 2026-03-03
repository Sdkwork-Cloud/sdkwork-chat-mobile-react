import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActionSheet,
  Avatar,
  Badge,
  DateUtils,
  SwipeableRow,
  useLongPress,
} from '@sdkwork/react-mobile-commons';
import type { Action } from '@sdkwork/react-mobile-commons';
import { getAgent } from '../config/agentRegistry';
import { useChatStoreActions } from '../stores/chatStore';
import type { ChatSession } from '../types';
import './ChatListItem.css';

interface ChatListItemProps {
  session: ChatSession;
  onClick: (session: ChatSession) => void;
}

export const ChatListItem: React.FC<ChatListItemProps> = React.memo(({ session, onClick }) => {
  const { deleteSession, togglePin, markSessionRead, setSessionUnread } = useChatStoreActions();
  const [isPressed, setIsPressed] = useState(false);
  const suppressNextClickRef = useRef(false);

  const isGroup = session.type === 'group';
  const agent = useMemo(() => (isGroup ? null : getAgent(session.agentId)), [isGroup, session.agentId]);
  const displayName = isGroup ? session.groupName || '\u7fa4\u804a' : agent?.name || 'OpenChat';
  const agentAvatar = isGroup ? '' : agent?.avatar || '';
  const avatarSrc = !isGroup && /^https?:\/\//i.test(agentAvatar) ? agentAvatar : undefined;

  const groupFallbackIcon = useMemo(
    () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        color="var(--text-secondary)"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    []
  );

  const agentFallback = useMemo(() => {
    if (isGroup || !agentAvatar || avatarSrc) return undefined;
    return <span className="chat-list-item__emoji-avatar">{agentAvatar}</span>;
  }, [agentAvatar, avatarSrc, isGroup]);

  const avatarFallback = isGroup ? groupFallbackIcon : agentFallback;
  const avatarName = avatarFallback ? undefined : displayName;
  const isMuted = Boolean(session.isMuted);
  const isUnread = session.unreadCount > 0;

  const previewText = useMemo(() => {
    const summary = (session.lastMessageContent || '').trim();
    if (summary) return summary;
    const lastMessage = session.messages[session.messages.length - 1];
    const fallback = (lastMessage?.content || '').trim();
    return fallback || '\u6682\u65e0\u6d88\u606f';
  }, [session.lastMessageContent, session.messages]);

  const formattedTime = useMemo(
    () => DateUtils.formatRelative(session.lastMessageTime || session.updateTime),
    [session.lastMessageTime, session.updateTime]
  );

  const background = isPressed
    ? 'var(--chat-list-item-pressed-bg, #ececec)'
    : session.isPinned
      ? 'var(--chat-list-item-pinned-bg, #f4f4f4)'
      : 'var(--bg-card)';

  const handleToggleRead = useCallback(async () => {
    if (session.unreadCount > 0) {
      await markSessionRead(session.id);
      return;
    }
    await setSessionUnread(session.id, 1);
  }, [markSessionRead, session.id, session.unreadCount, setSessionUnread]);

  const handleTogglePin = useCallback(async () => {
    await togglePin(session.id);
  }, [session.id, togglePin]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm('\u786e\u5b9a\u8981\u5220\u9664\u8be5\u4f1a\u8bdd\u5417\uff1f')) return;
    await deleteSession(session.id);
  }, [deleteSession, session.id]);

  const longPressActions = useMemo(
    () => [
      {
        text: session.unreadCount > 0 ? '\u6807\u4e3a\u5df2\u8bfb' : '\u6807\u4e3a\u672a\u8bfb',
        key: 'read',
        onClick: () => {
          void handleToggleRead();
        },
      },
      {
        text: session.isPinned ? '\u53d6\u6d88\u7f6e\u9876' : '\u7f6e\u9876',
        key: 'pin',
        onClick: () => {
          void handleTogglePin();
        },
      },
      {
        text: '\u5220\u9664\u4f1a\u8bdd',
        key: 'delete',
        color: '#fa5151',
        onClick: () => {
          void handleDelete();
        },
      },
    ],
    [handleDelete, handleTogglePin, handleToggleRead, session.isPinned, session.unreadCount]
  );

  const handleLongPress = useCallback(async () => {
    suppressNextClickRef.current = true;
    const result = await ActionSheet.showActions({
      title: session.groupName || '\u4f1a\u8bdd\u64cd\u4f5c',
      actions: longPressActions.map((action) => ({ text: action.text, color: action.color, key: action.key })),
    });
    if (!result) return;
    const selected = longPressActions.find((item) => item.key === result.key);
    selected?.onClick();
  }, [longPressActions, session.groupName]);

  const longPressProps = useLongPress({
    onLongPress: () => {
      void handleLongPress();
    },
    delay: 500,
  });

  const swipeActions = useMemo<Action[]>(
    () => [
      {
        text: session.unreadCount > 0 ? '\u5df2\u8bfb' : '\u672a\u8bfb',
        color: '#007aff',
        onClick: handleToggleRead,
      },
      {
        text: session.isPinned ? '\u53d6\u6d88' : '\u7f6e\u9876',
        color: '#ff9a44',
        onClick: handleTogglePin,
      },
      {
        text: '\u5220\u9664',
        color: '#fa5151',
        onClick: handleDelete,
      },
    ],
    [handleDelete, handleTogglePin, handleToggleRead, session.isPinned, session.unreadCount]
  );

  const handleBodyClick = useCallback(() => {
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false;
      return;
    }
    onClick(session);
  }, [onClick, session]);

  return (
    <SwipeableRow
      rightActions={swipeActions}
      onBodyClick={handleBodyClick}
      contentBackground={background}
      style={{ width: '100%' }}
    >
      <div
        {...longPressProps}
        onTouchStart={(e) => {
          setIsPressed(true);
          longPressProps.onTouchStart(e);
        }}
        onTouchMove={longPressProps.onTouchMove}
        onTouchEnd={(e) => {
          setIsPressed(false);
          longPressProps.onTouchEnd(e);
        }}
        onTouchCancel={(e) => {
          setIsPressed(false);
          longPressProps.onTouchEnd(e);
        }}
        onMouseDown={(e) => {
          setIsPressed(true);
          longPressProps.onMouseDown(e);
        }}
        onMouseUp={(e) => {
          setIsPressed(false);
          longPressProps.onMouseUp(e);
        }}
        onMouseLeave={(e) => {
          setIsPressed(false);
          longPressProps.onMouseLeave(e);
        }}
        className={`chat-list-item${session.isPinned ? ' chat-list-item--pinned' : ''}${isPressed ? ' is-pressed' : ''}`}
      >
        <div className={`chat-list-item__row${isUnread ? ' is-unread' : ''}`}>
          <div className="chat-list-item__avatar">
            <Badge content={session.unreadCount} offset={[-2, 2]}>
              <Avatar
                src={avatarSrc}
                name={avatarName}
                size="lg"
                shape="square"
                fallback={avatarFallback}
              />
            </Badge>
          </div>

          <div className="chat-list-item__main">
            <div className="chat-list-item__top">
              <span className="chat-list-item__name">{displayName}</span>
              <span className={`chat-list-item__time${isUnread ? ' is-unread' : ''}`}>{formattedTime}</span>
            </div>

            <div className="chat-list-item__bottom">
              <span className={`chat-list-item__preview${isUnread ? ' is-unread' : ''}`}>
                {previewText}
              </span>
              <div className="chat-list-item__meta">
                {session.isPinned ? <span className="chat-list-item__pin-tag">{'\u7f6e\u9876'}</span> : null}
                {isMuted ? <span className="chat-list-item__mute-tag">{'\u514d\u6253\u6270'}</span> : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SwipeableRow>
  );
});

ChatListItem.displayName = 'ChatListItem';
