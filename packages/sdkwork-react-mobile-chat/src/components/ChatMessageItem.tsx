import React, { useState, useRef, useMemo } from 'react';
import { Message, ChatConfig } from '../types';
import { Toast, Avatar, useLongPress } from '@sdkwork/react-mobile-commons';
import { MessageContent } from './MessageContent';
import { ChatContextMenu } from './ChatContextMenu';
import { parseMessage } from '../utils/messageParser';
import { resolveChatMessageLayout } from './chatMessageLayout';

interface ChatMessageItemProps {
  t?: (key: string) => string;
  message: Message;
  config: ChatConfig;
  isGroupStart: boolean;
  selectionMode: boolean;
  isSelected: boolean;
  isHighlighted?: boolean;
  onToggleSelection: (id: string) => void;
  onReply: (message: Message) => void;
  onForward: (message: Message) => void;
  onMultiSelect: (message: Message) => void;
  onDelete: (id: string) => void;
  onRecall?: (id: string) => void;
  onInteract?: (action: string, payload: any) => void;
}

const Haptic = {
  light: () => {
    if (navigator.vibrate) navigator.vibrate(5);
  },
  medium: () => {
    if (navigator.vibrate) navigator.vibrate(10);
  },
  heavy: () => {
    if (navigator.vibrate) navigator.vibrate(20);
  },
};

export const ChatMessageItem: React.FC<ChatMessageItemProps> = React.memo(
  ({
    t,
    message,
    config,
    isGroupStart,
    selectionMode,
    isSelected,
    isHighlighted,
    onToggleSelection,
    onReply,
    onForward,
    onMultiSelect,
    onDelete,
    onRecall,
    onInteract,
  }) => {
    const tr = useMemo(() => {
      return (key: string, fallback: string) => {
        const value = t?.(key);
        if (value && value !== key) return value;
        return fallback;
      };
    }, [t]);

    const messageContent =
      typeof message.content === 'string' ? message.content : message.content == null ? '' : String(message.content);

    if (message.role === 'system') {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0', padding: '0 20px' }}>
          <div
            style={{
              fontSize: '12px',
              color: 'var(--text-secondary)',
              opacity: 0.8,
              padding: '4px 10px',
              borderRadius: '4px',
            }}
          >
            {messageContent}
          </div>
        </div>
      );
    }

    const isUser = message.role === 'user';
    const showAvatar = isUser ? config.showUserAvatar : config.showModelAvatar;
    const isSending = message.status === 'sending';
    const isError = message.status === 'error';
    const canRecall = isUser && Date.now() - message.createTime < 2 * 60 * 1000;
    const parsedContent = useMemo(() => parseMessage(messageContent), [messageContent]);
    const isRichMedia =
      parsedContent.type === 'image' ||
      parsedContent.type === 'voice' ||
      parsedContent.type === 'location' ||
      parsedContent.type === 'redPacket' ||
      parsedContent.type === 'file' ||
      (parsedContent.type === 'product' && !!parsedContent.meta);

    const [showMenu, setShowMenu] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const [liked, setLiked] = useState(false);
    const bubbleRef = useRef<HTMLDivElement>(null);
    const lastTapRef = useRef(0);

    const longPressHandlers = useLongPress({
      onLongPress: () => {
        if (selectionMode) return;
        setIsPressed(false);
        setShowMenu(true);
        Haptic.heavy();
      },
      onClick: () => {
        if (selectionMode) {
          onToggleSelection(message.id);
          return;
        }

        const now = Date.now();
        if (now - lastTapRef.current < 300) {
          setLiked((prev) => !prev);
          Haptic.medium();
        }
        lastTapRef.current = now;
      },
      delay: 500,
    });

    const handleAction = async (action: string) => {
      setShowMenu(false);
      setIsPressed(false);

      switch (action) {
        case 'copy':
          try {
            await navigator.clipboard.writeText(messageContent);
            Toast.success(tr('chat.context.copied', 'Copied'));
          } catch {
            Toast.success(tr('chat.context.copied', 'Copied'));
          }
          break;
        case 'delete':
          onDelete(message.id);
          break;
        case 'forward':
          onForward(message);
          break;
        case 'reply':
          onReply(message);
          break;
        case 'multi':
          onMultiSelect(message);
          break;
        case 'fav':
          Toast.success(tr('chat.context.saved', 'Saved'));
          break;
        case 'recall':
          onRecall?.(message.id);
          break;
      }
    };

    const replyTo = message.replyTo || (message as any).replyContext;
    const bubbleBg = isRichMedia
      ? 'transparent'
      : isUser
        ? 'var(--bubble-me, #2a7cff)'
        : 'color-mix(in srgb, var(--bg-card) 94%, #ffffff)';
    const textColor = isUser ? 'var(--bubble-me-text, #ffffff)' : 'var(--text-primary)';
    const layout = resolveChatMessageLayout({
      showAvatar,
      isRichMedia,
      hasReply: Boolean(replyTo),
    });
    const showOuterStatusIndicator = isUser && (isSending || isError);
    const showThinkingState = !isUser && isSending;
    const showModelErrorState = !isUser && isError;
    const thinkingLabel = tr('chat.thinking', 'Thinking');
    const statusOffset = showAvatar ? '-24px' : '4px';

    return (
      <div
        onClick={() => selectionMode && onToggleSelection(message.id)}
        className={isHighlighted ? 'flash-highlight' : ''}
        style={{
          display: 'flex',
          width: '100%',
          padding: layout.rowPadding,
          marginBottom: isGroupStart ? '12px' : '7px',
          flexDirection: 'row',
          alignItems: 'flex-start',
          position: 'relative',
        }}
      >
        {selectionMode && (
          <div style={{ paddingTop: '8px', marginRight: 12 }}>
            <div
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                border: `2px solid ${isSelected ? 'var(--primary-color)' : 'var(--border-color)'}`,
                background: isSelected ? 'var(--primary-color)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isSelected && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              )}
            </div>
          </div>
        )}

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: isUser ? 'row-reverse' : 'row',
            zIndex: 1,
            position: 'relative',
          }}
        >
          {showAvatar ? (
            <div
              style={{
                width: 36,
                height: 36,
                flexShrink: 0,
                marginLeft: isUser ? '8px' : 0,
                marginRight: isUser ? 0 : '8px',
                position: 'relative',
                zIndex: 1,
                marginTop: 'auto',
              }}
            >
              <Avatar
                src={isUser ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' : undefined}
                name={isUser ? 'User' : 'Bot'}
                size="lg"
              />
            </div>
          ) : null}

          <div
              style={{
                maxWidth: layout.bubbleContainerMaxWidth,
                flex: layout.bubbleContainerFlex,
                width: layout.bubbleContainerWidth,
                display: 'flex',
                flexDirection: 'column',
              alignItems: isUser ? 'flex-end' : 'flex-start',
              minWidth: 0,
              position: 'relative',
            }}
          >
            {showOuterStatusIndicator ? (
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  [isUser ? 'left' : 'right']: statusOffset,
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none',
                }}
              >
                {isSending ? (
                  <div
                    style={{
                      width: '14px',
                      height: '14px',
                      border: '2px solid rgba(0,0,0,0.1)',
                      borderTopColor: 'var(--text-secondary)',
                      borderRadius: '50%',
                      animation: 'chat-spin 0.8s linear infinite',
                    }}
                  />
                ) : null}
                {isError ? <span style={{ color: '#fa5151', fontSize: '14px' }}>!</span> : null}
              </div>
            ) : null}

            <div
              ref={bubbleRef}
              onTouchStart={(e) => {
                if (selectionMode) return;
                setIsPressed(true);
                longPressHandlers.onTouchStart(e);
              }}
              onTouchMove={longPressHandlers.onTouchMove}
              onTouchEnd={(e) => {
                setIsPressed(false);
                longPressHandlers.onTouchEnd(e);
              }}
              onTouchCancel={(e) => {
                setIsPressed(false);
                longPressHandlers.onTouchEnd(e);
              }}
              onMouseDown={(e) => {
                if (selectionMode) return;
                setIsPressed(true);
                longPressHandlers.onMouseDown(e);
              }}
              onMouseUp={(e) => {
                setIsPressed(false);
                longPressHandlers.onMouseUp(e);
              }}
              onMouseLeave={(e) => {
                setIsPressed(false);
                longPressHandlers.onMouseLeave(e);
              }}
              onContextMenu={(e) => e.preventDefault()}
              style={{
                position: 'relative',
                backgroundColor: bubbleBg,
                color: isRichMedia ? 'inherit' : textColor,
                borderRadius: isRichMedia ? '14px' : isUser ? '16px 6px 16px 16px' : '6px 16px 16px 16px',
                padding: isRichMedia ? 0 : '10px 13px',
                boxShadow: isRichMedia
                  ? 'none'
                  : isUser
                    ? '0 8px 16px rgba(55, 87, 210, 0.2)'
                    : '0 4px 12px rgba(18, 30, 54, 0.06)',
                border: 'none',
                fontSize: '15px',
                lineHeight: '1.55',
                minHeight: '34px',
                width: layout.bubbleWidth,
                maxWidth: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start',
                transform: isPressed || showMenu ? 'scale(0.98)' : 'scale(1)',
                filter: showMenu ? 'brightness(0.9)' : isPressed ? 'brightness(0.95)' : 'none',
                transition: 'transform 0.1s, filter 0.1s',
                cursor: 'pointer',
                userSelect: 'text',
                WebkitUserSelect: 'text',
                wordBreak: 'break-word',
                zIndex: 1,
              }}
            >
              {liked && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: -8,
                    [isUser ? 'left' : 'right']: -8,
                    background: 'white',
                    borderRadius: '50%',
                    width: 22,
                    height: 22,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    zIndex: 10,
                    animation: 'chat-pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  }}
                >
                  <span style={{ fontSize: '14px' }}>❤️</span>
                </div>
              )}

              {replyTo && (
                <div
                  style={{
                    marginBottom: '6px',
                    paddingLeft: '8px',
                    borderLeft: `2px solid ${isUser ? 'rgba(255,255,255,0.5)' : 'var(--primary-color)'}`,
                    width: '100%',
                    opacity: 0.8,
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 600 }}>{replyTo.name}</div>
                  <div
                    style={{
                      fontSize: '11px',
                      whiteSpace: layout.preferFullReplyWidth ? 'pre-wrap' : 'nowrap',
                      overflow: layout.preferFullReplyWidth ? 'visible' : 'hidden',
                      textOverflow: layout.preferFullReplyWidth ? 'clip' : 'ellipsis',
                      maxWidth: layout.preferFullReplyWidth ? 'none' : '100%',
                      wordBreak: 'break-word',
                    }}
                  >
                    {replyTo.content}
                  </div>
                </div>
              )}

              <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
                {showThinkingState && !messageContent.trim() ? (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--text-secondary)',
                      fontSize: '12px',
                      lineHeight: '16px',
                      minHeight: '16px',
                    }}
                  >
                    <span>{thinkingLabel}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }} aria-hidden="true">
                      {[0, 1, 2].map((dotIndex) => (
                        <span
                          key={`thinking-dot-${dotIndex}`}
                          style={{
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            background: 'currentColor',
                            opacity: 0.35,
                            animation: `chat-thinking-dot 1.1s ${dotIndex * 0.15}s infinite ease-in-out`,
                          }}
                        />
                      ))}
                    </span>
                  </div>
                ) : showModelErrorState && !messageContent.trim() ? (
                  <span style={{ color: '#fa5151', fontSize: '13px', lineHeight: '18px' }}>
                    {tr('chat.send_failed', 'Send failed')}
                  </span>
                ) : (
                  <MessageContent t={t} content={messageContent} message={message} isUser={isUser} onInteract={onInteract} />
                )}
              </div>

              {message.isStreaming && !(showThinkingState && !messageContent.trim()) && (
                <span
                  style={{
                    display: 'inline-block',
                    width: '2px',
                    height: '16px',
                    background: 'currentColor',
                    marginLeft: '4px',
                    verticalAlign: 'text-bottom',
                    animation: 'chat-blink 1s step-end infinite',
                  }}
                />
              )}
            </div>
          </div>
        </div>

        <ChatContextMenu
          t={t}
          visible={showMenu}
          anchorRect={bubbleRef.current ? bubbleRef.current.getBoundingClientRect() : null}
          onClose={() => {
            setShowMenu(false);
            setIsPressed(false);
          }}
          onAction={handleAction}
          isUser={isUser}
          canRecall={canRecall}
        />
      </div>
    );
  }
);
