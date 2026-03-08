import React, { useEffect, useMemo } from 'react';
import { Icon, Page } from '@sdkwork/react-mobile-commons';
import { useCreations } from '../hooks/useCreations';

interface CreationDetailPageProps {
  id?: string;
  onBack?: () => void;
  onNavigate?: (path: string, params?: Record<string, string>) => void;
}

const typeLabelMap: Record<string, string> = {
  image: '图片创作',
  video: '视频创作',
  music: '音乐创作',
  text: '文本创作',
  short_drama: '短剧创作',
  collection: '合集创作',
};

const typeEmojiMap: Record<string, string> = {
  image: '🎨',
  video: '🎬',
  music: '🎵',
  text: '📝',
  short_drama: '🎞️',
  collection: '🗂️',
};

export const CreationDetailPage: React.FC<CreationDetailPageProps> = ({ id, onBack, onNavigate }) => {
  const { creations, currentCreation, loadCreation } = useCreations();

  useEffect(() => {
    if (id) {
      void loadCreation(id);
    }
  }, [id, loadCreation]);

  const detail = useMemo(() => {
    if (currentCreation && (!id || currentCreation.id === id)) {
      return currentCreation;
    }
    if (id) {
      return creations.find((item) => item.id === id) || null;
    }
    return creations[0] || null;
  }, [creations, currentCreation, id]);

  return (
    <Page
      title="作品详情"
      onBack={onBack}
      right={(
        <button
          type="button"
          onClick={() => onNavigate?.('/creation/search')}
          style={{ border: 'none', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}
        >
          <Icon name="search" size={20} />
        </button>
      )}
      noPadding
      background="var(--bg-body)"
    >
      {detail ? (
        <div style={{ padding: '12px 12px 100px' }}>
          <div
            style={{
              borderRadius: '18px',
              overflow: 'hidden',
              border: '0.5px solid var(--border-color)',
              background: 'var(--bg-card)',
              marginBottom: '14px',
            }}
          >
            {detail.result?.url && detail.type === 'image' ? (
              <img
                src={detail.result.url}
                alt={detail.title}
                style={{ width: '100%', display: 'block', background: 'var(--bg-cell-active)' }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  aspectRatio: detail.type === 'video' || detail.type === 'short_drama' ? '16 / 9' : '1 / 1',
                  background: 'linear-gradient(135deg, #1f56d2, #4f8dff)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                }}
              >
                {typeEmojiMap[detail.type] || '🎨'}
              </div>
            )}
            <div style={{ padding: '12px' }}>
              <h1 style={{ margin: '0 0 6px', fontSize: '18px', color: 'var(--text-primary)' }}>{detail.title}</h1>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {typeLabelMap[detail.type] || '创作'} · ❤️ {detail.likeCount} · 👁️ {detail.viewCount}
              </div>
            </div>
          </div>

          <section
            style={{
              background: 'var(--bg-card)',
              borderRadius: '14px',
              border: '0.5px solid var(--border-color)',
              padding: '12px',
              marginBottom: '12px',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>提示词</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{detail.prompt}</div>
          </section>

          {detail.tags.length > 0 ? (
            <section
              style={{
                background: 'var(--bg-card)',
                borderRadius: '14px',
                border: '0.5px solid var(--border-color)',
                padding: '12px',
                marginBottom: '12px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>标签</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {detail.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: '999px',
                      padding: '5px 10px',
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          <button
            type="button"
            onClick={() => onNavigate?.('/creation')}
            style={{
              width: '100%',
              border: 'none',
              borderRadius: '12px',
              padding: '12px',
              background: 'var(--primary-gradient)',
              color: 'white',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            返回创作广场
          </button>
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '80px 12px' }}>作品不存在或已被删除</div>
      )}
    </Page>
  );
};

export default CreationDetailPage;
