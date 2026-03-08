import React, { useEffect, useState, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

interface ChatContextMenuProps {
  t?: (key: string) => string;
  visible?: boolean;
  anchorRect?: DOMRect | null;
  onClose: () => void;
  onAction: (action: string) => void;
  isUser: boolean;
  canRecall: boolean;
}

const ACTION_ICON_STYLE = { width: '20px', height: '20px', strokeWidth: '1.8' };

export const ChatContextMenu: React.FC<ChatContextMenuProps> = ({
  t,
  visible = true,
  anchorRect,
  onClose,
  onAction,
  isUser,
  canRecall,
}) => {
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    transformOrigin: string;
    arrowLeft: number;
    isBelow: boolean;
  } | null>(null);
  const tr = React.useCallback(
    (key: string, fallback: string) => {
      const value = t?.(key);
      if (value && value !== key) return value;
      return fallback;
    },
    [t]
  );

  const ACTIONS = [
    {
      id: 'copy',
      label: tr('chat.context.copy', 'Copy'),
      icon: (
        <svg {...ACTION_ICON_STYLE} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      ),
    },
    {
      id: 'forward',
      label: tr('chat.context.forward', 'Forward'),
      icon: (
        <svg {...ACTION_ICON_STYLE} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="15 17 20 12 15 7" />
          <path d="M4 18v-2a4 4 0 0 1 4-4h12" />
        </svg>
      ),
    },
    {
      id: 'reply',
      label: tr('chat.context.reply', 'Reply'),
      icon: (
        <svg {...ACTION_ICON_STYLE} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="9 17 4 12 9 7" />
          <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
        </svg>
      ),
    },
    {
      id: 'fav',
      label: tr('chat.context.favorite', 'Favorite'),
      icon: (
        <svg {...ACTION_ICON_STYLE} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    ...(canRecall
      ? [
          {
            id: 'recall',
            label: tr('chat.context.recall', 'Recall'),
            icon: (
              <svg {...ACTION_ICON_STYLE} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 3v5h5" />
                <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
              </svg>
            ),
          },
        ]
      : []),
    {
      id: 'delete',
      label: tr('chat.context.delete', 'Delete'),
      icon: (
        <svg {...ACTION_ICON_STYLE} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      ),
      color: '#ff4d4f',
    },
  ];

  useLayoutEffect(() => {
    if (visible && anchorRect) {
      const menuWidth = 200;
      const menuHeight = ACTIONS.length * 48;
      const padding = 8;

      let top = anchorRect.top - menuHeight - padding;
      let isBelow = false;

      if (top < padding) {
        top = anchorRect.bottom + padding;
        isBelow = true;
      }

      let left = anchorRect.left;
      if (left + menuWidth > window.innerWidth - padding) {
        left = window.innerWidth - menuWidth - padding;
      }
      if (left < padding) left = padding;

      const arrowLeft = anchorRect.left - left + anchorRect.width / 2 - 8;

      setPosition({
        top,
        left,
        transformOrigin: isBelow ? 'top left' : 'bottom left',
        arrowLeft: Math.max(8, Math.min(arrowLeft, menuWidth - 24)),
        isBelow,
      });
    }
  }, [visible, anchorRect, ACTIONS.length]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!visible || !position) return null;

  return createPortal(
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 'var(--z-popup, 1400)',
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: position.top,
          left: position.left,
          background: 'var(--bg-card)',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          minWidth: '160px',
          maxWidth: '200px',
          zIndex: 'calc(var(--z-popup, 1400) + 1)',
          transformOrigin: position.transformOrigin,
          animation: 'menuPop 0.15s ease-out',
          overflow: 'hidden',
        }}
      >
        {ACTIONS.map((action, idx) => (
          <div
            key={action.id}
            onClick={() => {
              onAction(action.id);
              onClose();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 16px',
              cursor: 'pointer',
              borderBottom:
                idx < ACTIONS.length - 1 ? '0.5px solid var(--border-color)' : 'none',
              color: action.color || 'var(--text-primary)',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-body)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {action.icon}
            <span style={{ fontSize: '15px' }}>{action.label}</span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes menuPop {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>,
    document.body
  );
};
