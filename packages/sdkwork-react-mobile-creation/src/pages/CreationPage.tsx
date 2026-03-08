import React, { useMemo, useRef, useState } from 'react';
import { Icon, Page, Skeleton, Toast, TopTabsNavbar, TopTabItem } from '@sdkwork/react-mobile-commons';
import { useCreations } from '../hooks/useCreations';
import {
  CreationCard,
  CreationComposerSheet,
  ImageCreationPanel,
  MusicCreationPanel,
  VideoCreationPanel,
} from '../components';
import type { Creation, CreationParams, CreationType } from '../types';
import './CreationPage.css';

interface CreationPageProps {
  onSearchClick?: () => void;
  onDetailClick?: (id: string) => void;
  onNavigate?: (path: string, params?: Record<string, string>) => void;
}

const categories = ['推荐', '绘图', '视频', '音乐', '3D', '赛博', '二次元'] as const;
type Category = (typeof categories)[number];

const CREATION_NAV_TABS: TopTabItem[] = categories.map((item) => ({
  id: item,
  label: item,
}));

const resolveCategory = (item: Creation, category: Category) => {
  if (category === '推荐') return true;
  if (category === '绘图') return item.type === 'image';
  if (category === '视频') return item.type === 'video';
  if (category === '音乐') return item.type === 'music';

  const source = `${item.title} ${item.prompt} ${item.tags.join(' ')}`.toLowerCase();
  if (category === '3D') return source.includes('3d');
  if (category === '赛博') return source.includes('cyber') || source.includes('赛博');
  if (category === '二次元') return source.includes('anime') || source.includes('二次元');

  return true;
};

const inferTypeFromMime = (file: File): CreationType => {
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'music';
  return 'image';
};

export const CreationPage: React.FC<CreationPageProps> = ({ onSearchClick, onDetailClick, onNavigate }) => {
  const { creations, isLoading, createCreation } = useCreations();
  const [activeCategory, setActiveCategory] = useState<Category>('推荐');
  const [showComposer, setShowComposer] = useState(false);
  const [panelType, setPanelType] = useState<'none' | 'image' | 'video' | 'music'>('none');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const visibleItems = useMemo(() => {
    const filtered = creations.filter((item) => resolveCategory(item, activeCategory));
    if (activeCategory === '推荐') {
      return [...filtered].sort((a, b) => (b.likeCount + b.viewCount) - (a.likeCount + a.viewCount));
    }
    return filtered;
  }, [activeCategory, creations]);

  const openDetail = (id: string) => {
    if (onDetailClick) {
      onDetailClick(id);
      return;
    }
    onNavigate?.('/creation/detail', { id });
  };

  const handleCreate = async (payload: {
    type: CreationType;
    title: string;
    prompt: string;
    params?: CreationParams;
    tags?: string[];
  }) => {
    await createCreation({
      type: payload.type,
      title: payload.title,
      prompt: payload.prompt,
      params: payload.params,
      tags: payload.tags,
      isPublic: true,
    });
    Toast.success('已提交创作任务');
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = '';

    const type = inferTypeFromMime(file);
    await handleCreate({
      type,
      title: file.name.replace(/\.[^.]+$/, ''),
      prompt: `导入素材：${file.name}`,
      tags: ['imported'],
    });
    setShowComposer(false);
  };

  return (
    <Page noNavbar noPadding background="var(--bg-body)">
      <div className="creation-page">
        <TopTabsNavbar
          tabs={CREATION_NAV_TABS}
          activeTab={activeCategory}
          onTabChange={(tabId) => setActiveCategory(tabId as Category)}
          activeColor="#1e8fff"
          inactiveColor="var(--text-secondary)"
          indicatorColor="#1e8fff"
          rightAction={(
            <button
              type="button"
              className="creation-page__search-btn"
              onClick={() => (onSearchClick ? onSearchClick() : onNavigate?.('/creation/search'))}
            >
              <Icon name="search" size={20} />
            </button>
          )}
        />

      <div className="creation-page__content">
        {isLoading ? (
          <div className="creation-page__skeleton-grid">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={`creation-skeleton-${index}`} width="100%" height={220} style={{ borderRadius: '12px' }} />
            ))}
          </div>
        ) : visibleItems.length > 0 ? (
          <div className="creation-page__masonry">
            {visibleItems.map((item) => (
              <CreationCard key={item.id} item={item} onClick={() => openDetail(item.id)} />
            ))}
          </div>
        ) : (
          <div className="creation-page__empty">
            当前分类暂无灵感，点击右下角开始创作
          </div>
        )}
      </div>

      <button
        type="button"
        className="creation-page__fab"
        onClick={() => setShowComposer(true)}
      >
        +
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*,audio/*"
        style={{ display: 'none' }}
        onChange={handleImportFile}
      />

      <CreationComposerSheet
        visible={showComposer}
        onClose={() => setShowComposer(false)}
        onSelect={(type) => {
          setShowComposer(false);
          setPanelType(type);
        }}
        onImportLocal={() => fileInputRef.current?.click()}
      />

      <ImageCreationPanel
        visible={panelType === 'image'}
        onClose={() => setPanelType('none')}
        onSubmit={async (payload) => {
          await handleCreate({
            type: 'image',
            title: payload.title,
            prompt: payload.prompt,
            tags: [payload.style, payload.model],
            params: {
              aspectRatio: payload.aspectRatio,
              style: payload.style,
              model: payload.model,
              cfgScale: payload.hd ? 8 : 6,
            },
          });
        }}
      />

      <VideoCreationPanel
        visible={panelType === 'video'}
        onClose={() => setPanelType('none')}
        onSubmit={async (payload) => {
          await handleCreate({
            type: 'video',
            title: payload.title,
            prompt: payload.prompt,
            tags: [payload.model, 'video'],
            params: {
              aspectRatio: payload.ratio,
              duration: payload.duration,
              model: payload.model,
            },
          });
        }}
      />

      <MusicCreationPanel
        visible={panelType === 'music'}
        onClose={() => setPanelType('none')}
        onSubmit={async (payload) => {
          await handleCreate({
            type: 'music',
            title: payload.title,
            prompt: payload.prompt,
            tags: [payload.style, payload.instrumental ? 'instrumental' : 'vocal', payload.model],
            params: {
              genre: payload.style,
              mood: payload.instrumental ? 'instrumental' : 'vocal',
              model: payload.model,
              customMode: payload.mode === 'custom',
              lyrics: payload.lyrics,
              stylePrompt: payload.stylePrompt,
            },
          });
        }}
      />
      </div>
    </Page>
  );
};

export default CreationPage;
