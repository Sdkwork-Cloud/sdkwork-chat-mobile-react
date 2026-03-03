import React from 'react';
import { ChatSession } from '@sdkwork/react-mobile-chat';
import './ChatListItem.css';

interface ChatListItemProps {
  session: ChatSession;
  onClick: () => void;
}

const SessionGlyph: React.FC<{ type: 'agent' | 'group' }> = ({ type }) => {
  if (type === 'group') {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
        <circle cx="9" cy="9" r="2.9" stroke="white" strokeWidth="1.8" />
        <circle cx="15.6" cy="9.8" r="2.4" stroke="white" strokeWidth="1.8" />
        <path d="M4.8 17.2c.8-2.5 2.8-4 5-4 2.3 0 4.3 1.5 5 4M13.6 17.2c.4-1.6 1.6-2.7 3.1-2.7s2.7 1.1 3.2 2.7" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
      <path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" stroke="white" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
};

const PinGlyph: React.FC = () => (
  <svg viewBox="0 0 20 20" width="11" height="11" fill="none" aria-hidden="true">
    <path d="m7.3 2.7 5.1 5.1-1.5 1.5 1.9 4-1.3 1.3-4-1.9-1.5 1.5-5.1-5.1 2.4-.6L6.7 5l.6-2.3Z" fill="currentColor" />
  </svg>
);

const formatTime = (timestamp?: number): string => {
  if (!timestamp) {
    return '';
  }

  const date = new Date(timestamp);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return '\u6628\u5929';
  }

  if (date.getFullYear() === now.getFullYear()) {
    return `${date.getMonth() + 1}\u6708${date.getDate()}\u65e5`;
  }

  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
};

export const ChatListItem: React.FC<ChatListItemProps> = React.memo(({ session, onClick }) => {
  const avatarType = session.type === 'group' ? 'group' : 'agent';
  const title = session.groupName || (session.type === 'agent' ? `OpenChat ${'\u52a9\u624b'}` : '\u7fa4\u804a');
  const subtitle = (session.lastMessageContent || '').trim() || '\u6682\u65e0\u6d88\u606f';
  const unread = session.unreadCount || 0;
  const isUnread = unread > 0;
  const isMuted = Boolean(session.isMuted);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`home-conversation-item${session.isPinned ? ' is-pinned' : ''}${isUnread ? ' is-unread' : ''}`}
    >
      <div className={`home-conversation-item__avatar home-conversation-item__avatar--${avatarType}`}>
        <SessionGlyph type={avatarType} />
      </div>

      <div className="home-conversation-item__main">
        <div className="home-conversation-item__top">
          <div className="home-conversation-item__title-row">
            {session.isPinned && (
              <span className="home-conversation-item__pin-icon">
                <PinGlyph />
              </span>
            )}
            <span className="home-conversation-item__title">{title}</span>
            {session.isPinned ? <span className="home-conversation-item__pinned-tag">{'\u7f6e\u9876'}</span> : null}
          </div>

          <span className={`home-conversation-item__time${isUnread ? ' is-unread' : ''}`}>
            {formatTime(session.lastMessageTime)}
          </span>
        </div>

        <div className="home-conversation-item__bottom">
          <span className={`home-conversation-item__summary${isUnread ? ' is-unread' : ''}`}>
            {subtitle}
          </span>

          <div className="home-conversation-item__meta">
            {isMuted ? <span className="home-conversation-item__mute-tag">{'\u514d\u6253\u6270'}</span> : null}
            {unread > 0 ? (
              <span className="home-conversation-item__unread-badge">{unread > 99 ? '99+' : unread}</span>
            ) : null}
          </div>
        </div>
      </div>
    </button>
  );
});

ChatListItem.displayName = 'ChatListItem';
