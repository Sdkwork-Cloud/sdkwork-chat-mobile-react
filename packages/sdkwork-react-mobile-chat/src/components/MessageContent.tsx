import React from 'react';
import type { Message } from '../types';
import { parseMessage } from '../utils/messageParser';
import { FileBubble, ImageBubble, LocationBubble, ProductBubble, RedPacketBubble, VoiceBubble } from './bubbles';
import type { ProductData } from './bubbles';

interface MessageContentProps {
  t?: (key: string) => string;
  content?: string;
  message?: Partial<Message> | null;
  isUser?: boolean;
  onInteract?: (action: string, payload: any) => void;
}

const normalizeText = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (value == null) return '';
  return String(value);
};

const startsWithAny = (text: string, candidates: string[]): boolean => {
  const lower = text.trim().toLowerCase();
  return candidates.some((item) => lower.startsWith(item.toLowerCase()));
};

const normalizeProducts = (raw: unknown): ProductData[] => {
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return list
    .filter((item): item is Record<string, any> => !!item && typeof item === 'object')
    .map((item, index) => {
      const price = Number(item.price);
      return {
        id: String(item.id || `product_${index}`),
        name: String(item.name || 'Untitled'),
        price: Number.isFinite(price) ? price : 0,
        originalPrice: Number.isFinite(Number(item.originalPrice)) ? Number(item.originalPrice) : undefined,
        image: String(item.image || 'https://picsum.photos/400/300'),
        reason: typeof item.reason === 'string' ? item.reason : undefined,
        tags: Array.isArray(item.tags) ? item.tags.map((tag) => String(tag)) : undefined,
        shopName: typeof item.shopName === 'string' ? item.shopName : undefined,
        rating: Number.isFinite(Number(item.rating)) ? Number(item.rating) : undefined,
      };
    })
    .filter((item) => !!item.name);
};

export const MessageContent: React.FC<MessageContentProps> = ({ t, content, message, isUser, onInteract }) => {
  const text = normalizeText(content ?? message?.content);
  const parsed = parseMessage(text);

  if (parsed.type === 'product') {
    const products = normalizeProducts(parsed.meta);
    const hasProducts = products.length > 0;

    if (hasProducts) {
      return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {parsed.content ? (
            <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{parsed.content}</div>
          ) : null}
          <ProductBubble t={t} data={products} onInteract={onInteract} />
        </div>
      );
    }
  }

  if (parsed.type === 'image') {
    return <ImageBubble t={t} isUser={!!isUser} content={parsed.content} />;
  }

  if (parsed.type === 'voice') {
    const duration = parsed.meta?.duration || '3"';
    return <VoiceBubble t={t} duration={duration} isUser={!!isUser} />;
  }

  if (parsed.type === 'location') {
    return <LocationBubble t={t} label={parsed.content} />;
  }

  if (parsed.type === 'redPacket') {
    return <RedPacketBubble t={t} text={parsed.content} />;
  }

  if (parsed.type === 'file') {
    return <FileBubble t={t} name={parsed.content} size={parsed.meta?.size || '--'} type={parsed.meta?.ext} />;
  }

  if (startsWithAny(text, ['[图片]', '[image]', '📷', '🖼️', 'data:image'])) {
    return (
      <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
        🖼️ {text}
      </div>
    );
  }

  if (startsWithAny(text, ['[语音]', '[voice]', '🎤'])) {
    return (
      <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
        🎤 {text}
      </div>
    );
  }

  if (startsWithAny(text, ['[位置]', '[location]', '📍'])) {
    return (
      <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
        📍 {text}
      </div>
    );
  }

  if (startsWithAny(text, ['[文件]', '[file]', '📎', '📁'])) {
    return (
      <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
        📎 {text}
      </div>
    );
  }

  return (
    <div className="message-content">
      <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{text}</span>
    </div>
  );
};
