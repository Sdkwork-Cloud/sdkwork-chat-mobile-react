import React from 'react';
import type { Creation } from '../types';

interface CreationCardProps {
  item: Creation;
  onClick?: () => void;
}

const typeLabelMap: Record<Creation['type'], string> = {
  image: '图片',
  video: '视频',
  music: '音乐',
  text: '文本',
};

const fallbackBackground = (type: Creation['type']) => {
  if (type === 'video') return 'linear-gradient(135deg, #2b0aff, #fa5151)';
  if (type === 'music') return 'linear-gradient(135deg, #1f1c2c, #928dab)';
  if (type === 'text') return 'linear-gradient(135deg, #fff1eb, #ace0f9)';
  return 'linear-gradient(135deg, #1f56d2, #4f8dff)';
};

const formatCount = (count: number) => (count > 999 ? `${(count / 1000).toFixed(1)}k` : `${count}`);

export const CreationCard: React.FC<CreationCardProps> = ({ item, onClick }) => {
  const imageUrl = item.result?.thumbnailUrl || item.result?.url;

  return (
    <article
      onClick={onClick}
      style={{
        breakInside: 'avoid',
        marginBottom: '8px',
        background: 'var(--bg-card)',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '0.5px solid var(--border-color)',
        cursor: 'pointer',
        boxShadow: '0 10px 20px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ position: 'relative' }}>
        {imageUrl && item.type === 'image' ? (
          <img
            src={imageUrl}
            alt={item.title}
            loading="lazy"
            style={{
              width: '100%',
              display: 'block',
              minHeight: '120px',
              background: 'var(--bg-cell-active)',
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              aspectRatio: item.type === 'video' ? '16 / 9' : '1 / 1',
              background: fallbackBackground(item.type),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '34px',
            }}
          >
            {item.type === 'video' ? '🎬' : item.type === 'music' ? '🎵' : item.type === 'text' ? '📝' : '🎨'}
          </div>
        )}
        <span
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            fontSize: '10px',
            color: 'white',
            background: 'rgba(0,0,0,0.42)',
            borderRadius: '10px',
            padding: '3px 8px',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          {typeLabelMap[item.type]}
        </span>
      </div>

      <div style={{ padding: '10px' }}>
        <h3
          style={{
            margin: 0,
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {item.title}
        </h3>
        <div
          style={{
            marginTop: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: 'var(--text-secondary)',
          }}
        >
          <span>{item.userName || '创作者'}</span>
          <span>❤️ {formatCount(item.likeCount)}</span>
        </div>
      </div>
    </article>
  );
};

export default CreationCard;
