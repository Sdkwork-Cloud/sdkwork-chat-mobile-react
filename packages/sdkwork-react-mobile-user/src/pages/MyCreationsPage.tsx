
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Navbar, Toast } from '@sdkwork/react-mobile-commons';
import { creationService, type Creation, type CreationType } from '@sdkwork/react-mobile-creation';

interface MyCreationsPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
  onCreationClick?: (id: string) => void;
}

const formatDate = (value: string): string => {
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return '--';
  }
};

const getCreationCover = (item: Creation): string => {
  if (item.type === 'image') {
    return item.result?.thumbnailUrl || item.result?.url || '';
  }
  if (item.type === 'video') {
    return item.result?.thumbnailUrl || '';
  }
  return '';
};

const getPlaceholder = (type: CreationType): string => {
  if (type === 'music') return '🎵';
  if (type === 'text') return '📝';
  if (type === 'video') return '🎬';
  return '🎨';
};

export const MyCreationsPage: React.FC<MyCreationsPageProps> = ({ t, onBack, onCreationClick }) => {
  const [activeTab, setActiveTab] = useState<'all' | CreationType>('all');
  const [isManageMode, setIsManageMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [creations, setCreations] = useState<Creation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const tr = React.useCallback(
    (key: string, fallback: string) => {
      const value = t?.(key);
      if (value && value !== key) return value;
      return fallback;
    },
    [t]
  );

  const tabs = useMemo<Array<{ id: 'all' | CreationType; label: string }>>(
    () => [
      { id: 'all', label: tr('creations.tabs.all', 'All') },
      { id: 'image', label: tr('creations.tabs.image', 'Image') },
      { id: 'video', label: tr('creations.tabs.video', 'Video') },
      { id: 'music', label: tr('creations.tabs.music', 'Music') },
      { id: 'text', label: tr('creations.tabs.text', 'Text') },
    ],
    [tr]
  );

  const typeLabels = useMemo<Record<CreationType, string>>(
    () => ({
      image: tr('creations.tabs.image', 'Image'),
      video: tr('creations.tabs.video', 'Video'),
      music: tr('creations.tabs.music', 'Music'),
      text: tr('creations.tabs.text', 'Text'),
    }),
    [tr]
  );

  const loadCreations = useCallback(async () => {
    setIsLoading(true);
    try {
      await creationService.initialize();
      const data = await creationService.getCreations({
        type: activeTab === 'all' ? undefined : activeTab,
        sortBy: 'newest',
      });
      setCreations(data);
    } catch (error) {
      console.error('[MyCreationsPage] load creations failed:', error);
      Toast.error(tr('creations.errors.load_failed', 'Failed to load creations. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, tr]);

  useEffect(() => {
    void loadCreations();
  }, [loadCreations]);

  const handleManageToggle = () => {
    if (isManageMode) {
      setSelectedIds(new Set());
    }
    setIsManageMode((prev) => !prev);
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = async () => {
    if (selectedIds.size === 0) return;
    const confirmTemplate = t?.('creations.confirm_delete');
    const confirmText = confirmTemplate && confirmTemplate !== 'creations.confirm_delete'
      ? confirmTemplate.replace('{count}', String(selectedIds.size))
      : `Delete ${selectedIds.size} selected items?`;
    const confirmed = window.confirm(confirmText);
    if (!confirmed) return;

    try {
      const deleting = Array.from(selectedIds);
      for (const id of deleting) {
        await creationService.deleteCreation(id);
      }
      Toast.success(tr('creations.messages.deleted', 'Deleted'));
      setSelectedIds(new Set());
      setIsManageMode(false);
      await loadCreations();
    } catch (error) {
      console.error('[MyCreationsPage] delete creations failed:', error);
      Toast.error(tr('creations.errors.delete_failed', 'Delete failed, please try again.'));
    }
  };

  const navTitle = isManageMode
    ? `${tr('creations.selected_prefix', 'Selected')} ${selectedIds.size}`
    : tr('creations.title', 'My Creations');

  const grid = useMemo(() => {
    if (isLoading) {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`creation-skeleton-${index}`}
              style={{
                borderRadius: '12px',
                border: '0.5px solid var(--border-color)',
                background: 'linear-gradient(120deg, var(--bg-card), var(--bg-body), var(--bg-card))',
                height: '190px',
              }}
            />
          ))}
        </div>
      );
    }

    if (creations.length === 0) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '60%',
            opacity: 0.6,
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎨</div>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {tr('creations.empty', 'No creations yet')}
          </div>
        </div>
      );
    }

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {creations.map((item) => {
          const cover = getCreationCover(item);
          const selected = selectedIds.has(item.id);

          return (
            <button
              type="button"
              key={item.id}
              onClick={() => {
                if (isManageMode) {
                  toggleSelection(item.id);
                  return;
                }
                onCreationClick?.(item.id);
              }}
              style={{
                border: '0.5px solid var(--border-color)',
                borderRadius: '12px',
                overflow: 'hidden',
                background: 'var(--bg-card)',
                cursor: 'pointer',
                textAlign: 'left',
                position: 'relative',
              }}
            >
              {isManageMode && (
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: `2px solid ${selected ? 'var(--primary-color)' : 'white'}`,
                    background: selected ? 'var(--primary-color)' : 'rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1,
                  }}
                >
                  {selected ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  ) : null}
                </div>
              )}
              <div
                style={{
                  aspectRatio: '1',
                  background: cover ? `url(${cover}) center/cover no-repeat` : 'var(--bg-body)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '30px',
                }}
              >
                {cover ? null : getPlaceholder(item.type)}
              </div>
              <div style={{ padding: '10px' }}>
                <div
                  style={{
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginBottom: '6px',
                  }}
                >
                  {item.title}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  <span>{typeLabels[item.type]}</span>
                  <span>{formatDate(item.createdAt)}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  }, [creations, isLoading, isManageMode, onCreationClick, selectedIds, tr, typeLabels]);

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg-body)', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        title={navTitle}
        onBack={isManageMode ? handleManageToggle : onBack}
        rightElement={
          <button
            type="button"
            onClick={handleManageToggle}
            style={{
              padding: '0 12px',
              border: 'none',
              background: 'transparent',
              fontSize: '15px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            {isManageMode ? tr('common.finish', 'Done') : tr('common.manage', 'Manage')}
          </button>
        }
      />

      <div
        style={{
          display: 'flex',
          gap: '12px',
          padding: '10px 16px',
          background: 'var(--bg-card)',
          borderBottom: '0.5px solid var(--border-color)',
          overflowX: 'auto',
        }}
      >
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '6px 14px',
              borderRadius: '10px',
              whiteSpace: 'nowrap',
              border: 'none',
              background: activeTab === tab.id ? 'var(--primary-color)' : 'var(--bg-body)',
              color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
              fontSize: '14px',
              cursor: 'pointer',
            }}
            >
              {tab.label}
            </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px', paddingBottom: isManageMode ? '78px' : '20px' }}>
        {grid}
      </div>

      {isManageMode ? (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'var(--bg-card)',
            borderTop: '0.5px solid var(--border-color)',
            display: 'flex',
            gap: '12px',
            padding: '12px 16px',
            paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
          }}
        >
          <button
            type="button"
            onClick={handleDelete}
            disabled={selectedIds.size === 0}
            style={{
              flex: 1,
              padding: '14px',
              background: selectedIds.size > 0 ? 'var(--danger)' : 'var(--bg-body)',
              color: selectedIds.size > 0 ? 'white' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: selectedIds.size > 0 ? 'pointer' : 'not-allowed',
              opacity: selectedIds.size > 0 ? 1 : 0.5,
            }}
          >
            {tr('common.delete', 'Delete')} ({selectedIds.size})
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default MyCreationsPage;
