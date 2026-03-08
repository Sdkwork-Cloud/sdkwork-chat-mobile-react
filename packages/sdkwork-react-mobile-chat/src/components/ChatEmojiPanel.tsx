import React, { useState } from 'react';
import { ChatPanelContainer } from './ChatPanelContainer';
import './ChatEmojiPanel.css';

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
    <ChatPanelContainer visible={visible} height={272} className="chat-input-panel chat-input-panel--emoji">
      <div className="chat-emoji-panel">
        <div className="chat-emoji-panel__tabs">
          {EMOJI_CATEGORIES.map((category, idx) => (
            <button
              key={category.id}
              type="button"
              className={`chat-emoji-panel__tab${activeCategory === idx ? ' is-active' : ''}`}
              onClick={() => setActiveCategory(idx)}
            >
              {tr(category.nameKey, category.fallback)}
            </button>
          ))}
        </div>

        <div className="chat-emoji-panel__grid">
          {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji) => (
            <button
              type="button"
              key={`${EMOJI_CATEGORIES[activeCategory].id}-${emoji}`}
              onClick={() => onSelect(emoji)}
              className="chat-emoji-panel__item"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </ChatPanelContainer>
  );
};

