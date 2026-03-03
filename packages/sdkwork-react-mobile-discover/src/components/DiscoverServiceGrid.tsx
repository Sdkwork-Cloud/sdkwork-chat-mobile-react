import React from 'react';
import { Icon } from '@sdkwork/react-mobile-commons';
import type { DiscoverItem } from '../types';

interface DiscoverServiceGridProps {
  items: DiscoverItem[];
  onItemClick?: (path: string) => void;
}

export const DiscoverServiceGrid: React.FC<DiscoverServiceGridProps> = ({ items, onItemClick }) => {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        borderRadius: '20px',
        padding: '12px 6px',
        marginBottom: '16px',
        border: '0.5px solid var(--border-color)',
        boxShadow: '0 8px 20px rgba(0,0,0,0.04)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: '10px 2px',
        }}
      >
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onItemClick?.(item.path)}
            style={{
              border: 'none',
              background: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 4px',
              cursor: 'pointer',
              color: 'var(--text-primary)',
            }}
          >
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '14px',
                background: item.bgColor,
                color: item.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(0,0,0,0.04)',
              }}
            >
              <Icon name={item.icon} size={26} />
            </div>
            <span
              style={{
                fontSize: '12px',
                lineHeight: 1.2,
                color: 'var(--text-secondary)',
              }}
            >
              {item.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DiscoverServiceGrid;
