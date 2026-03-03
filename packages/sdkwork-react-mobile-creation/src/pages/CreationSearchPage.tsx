import React, { useMemo, useState } from 'react';
import { Icon, Page } from '@sdkwork/react-mobile-commons';
import { useCreations } from '../hooks/useCreations';

interface CreationSearchPageProps {
  onBack?: () => void;
  onDetailClick?: (id: string) => void;
  onNavigate?: (path: string, params?: Record<string, string>) => void;
}

export const CreationSearchPage: React.FC<CreationSearchPageProps> = ({ onBack, onDetailClick, onNavigate }) => {
  const { creations } = useCreations();
  const [keyword, setKeyword] = useState('');

  const results = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    if (!query) {
      return creations.slice(0, 20);
    }
    return creations.filter((item) => {
      const source = `${item.title} ${item.prompt} ${item.tags.join(' ')}`.toLowerCase();
      return source.includes(query);
    });
  }, [creations, keyword]);

  return (
    <Page noNavbar noPadding background="var(--bg-body)">
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background: 'rgba(var(--navbar-bg-rgb), 0.94)',
          backdropFilter: 'blur(16px)',
          borderBottom: '0.5px solid var(--border-color)',
          padding: '10px 12px',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{
            border: 'none',
            background: 'transparent',
            width: '28px',
            height: '28px',
            padding: 0,
            color: 'var(--text-primary)',
            cursor: 'pointer',
          }}
        >
          <Icon name="arrow-left" size={20} />
        </button>
        <div
          style={{
            flex: 1,
            border: '0.5px solid var(--border-color)',
            borderRadius: '12px',
            background: 'var(--bg-card)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0 10px',
            height: '38px',
          }}
        >
          <Icon name="search" size={16} color="var(--text-placeholder)" />
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索作品标题、描述或标签"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: 'var(--text-primary)',
              fontSize: '14px',
            }}
          />
        </div>
      </div>

      <div style={{ padding: '12px 12px 96px' }}>
        {results.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {results.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (onDetailClick) {
                    onDetailClick(item.id);
                    return;
                  }
                  onNavigate?.('/creation/detail', { id: item.id });
                }}
                style={{
                  border: '0.5px solid var(--border-color)',
                  background: 'var(--bg-card)',
                  borderRadius: '12px',
                  textAlign: 'left',
                  padding: '12px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  {item.prompt}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '72px 0', color: 'var(--text-secondary)' }}>未找到相关作品</div>
        )}
      </div>
    </Page>
  );
};

export default CreationSearchPage;
