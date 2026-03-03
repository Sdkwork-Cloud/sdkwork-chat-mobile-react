import React from 'react';

export interface DiscoverFeedItem {
  id: string;
  title: string;
  source: string;
  cover: string;
  reads: number;
  route: string;
  type: 'article' | 'video';
}

interface DiscoverFeedCardProps {
  item: DiscoverFeedItem;
  onClick?: (route: string) => void;
}

const formatReads = (reads: number) => (reads > 999 ? `${(reads / 1000).toFixed(1)}k` : `${reads}`);

export const DiscoverFeedCard: React.FC<DiscoverFeedCardProps> = ({ item, onClick }) => {
  return (
    <article
      onClick={() => onClick?.(item.route)}
      style={{
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'var(--bg-card)',
        border: '0.5px solid var(--border-color)',
        cursor: 'pointer',
        boxShadow: '0 10px 22px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ position: 'relative' }}>
        <img
          src={item.cover}
          alt={item.title}
          loading="lazy"
          style={{
            display: 'block',
            width: '100%',
            height: '154px',
            objectFit: 'cover',
            background: 'var(--bg-cell-active)',
          }}
        />
        {item.type === 'video' ? (
          <span
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              fontSize: '10px',
              color: 'white',
              background: 'rgba(0,0,0,0.48)',
              borderRadius: '10px',
              padding: '3px 8px',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            视频
          </span>
        ) : null}
      </div>
      <div style={{ padding: '10px 10px 12px' }}>
        <h3
          style={{
            margin: 0,
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: 1.45,
            color: 'var(--text-primary)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '40px',
          }}
        >
          {item.title}
        </h3>
        <div
          style={{
            marginTop: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: 'var(--text-secondary)',
          }}
        >
          <span>{item.source}</span>
          <span>{formatReads(item.reads)} 阅读</span>
        </div>
      </div>
    </article>
  );
};

export default DiscoverFeedCard;
