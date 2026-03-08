import React from 'react';

interface ChatPanelContainerProps {
  visible: boolean;
  height: number;
  children: React.ReactNode;
  background?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const ChatPanelContainer: React.FC<ChatPanelContainerProps> = ({
  visible,
  height,
  children,
  background = 'var(--bg-card)',
  className = 'chat-input-panel',
  style,
}) => (
  <div
    className={className}
    style={{
      height: visible ? `${height}px` : '0px',
      marginTop: visible ? '8px' : '0px',
      overflow: 'hidden',
      transition: 'height 0.25s cubic-bezier(0.19, 1, 0.22, 1), margin-top 0.2s ease',
      background,
      borderTop: visible ? '0.5px solid var(--border-color)' : 'none',
      pointerEvents: visible ? 'auto' : 'none',
      ...style,
    }}
  >
    {children}
  </div>
);

