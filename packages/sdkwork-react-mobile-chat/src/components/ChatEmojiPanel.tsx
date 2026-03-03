import React, { useState } from 'react';
import { ChatPanelContainer } from './ChatPanelContainer';

interface ChatEmojiPanelProps {
  t?: (key: string) => string;
  visible: boolean;
  onSelect: (emoji: string) => void;
}

interface EmojiCategory {
  id: 'emotion' | 'gesture' | 'common';
  nameKey: string;
  fallback: string;
  emojis: string[];
}

const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: 'emotion',
    nameKey: 'chat.emoji.category_emotion',
    fallback: 'Emotion',
    emojis: ['😀', '😁', '😂', '🤣', '😉', '😏', '😝', '🤑', '😎', '😌', '🤔', '🥳', '😴', '😤', '😭', '😅'],
  },
  {
    id: 'gesture',
    nameKey: 'chat.emoji.category_gesture',
    fallback: 'Gesture',
    emojis: ['👏', '👍', '👎', '🙏', '👌', '✌️', '🤟', '🤝', '🤌', '🫡', '👋', '🫶'],
  },
  {
    id: 'common',
    nameKey: 'chat.emoji.category_common',
    fallback: 'Common',
    emojis: ['❤️', '✨', '🎉', '🔥', '🌟', '💯', '💡', '📌', '📷', '🎤', '📍', '📁'],
  },
];

export const ChatEmojiPanel: React.FC<ChatEmojiPanelProps> = ({ t, visible, onSelect }) => {
  const [activeCategory, setActiveCategory] = useState(0);
  const tr = (key: string, fallback: string) => {
    const value = t?.(key);
    if (value && value !== key) return value;
    return fallback;
  };

  return (
    <ChatPanelContainer visible={visible} height={260}>
      <div style={{ display: 'flex', borderBottom: '0.5px solid var(--border-color)' }}>
        {EMOJI_CATEGORIES.map((category, idx) => (
          <div
            key={category.id}
            onClick={() => setActiveCategory(idx)}
            style={{
              flex: 1,
              padding: '12px',
              textAlign: 'center',
              fontSize: '13px',
              color: activeCategory === idx ? 'var(--primary-color)' : 'var(--text-secondary)',
              fontWeight: activeCategory === idx ? 600 : 400,
              cursor: 'pointer',
              borderBottom: activeCategory === idx ? '2px solid var(--primary-color)' : '2px solid transparent',
            }}
          >
            {tr(category.nameKey, category.fallback)}
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 1fr)',
          gap: '4px',
          padding: '12px',
          maxHeight: '188px',
          overflowY: 'auto',
        }}
      >
        {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji) => (
          <div
            key={`${EMOJI_CATEGORIES[activeCategory].id}-${emoji}`}
            onClick={() => onSelect(emoji)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              padding: '8px',
              cursor: 'pointer',
              borderRadius: '8px',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-body)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {emoji}
          </div>
        ))}
      </div>
    </ChatPanelContainer>
  );
};

