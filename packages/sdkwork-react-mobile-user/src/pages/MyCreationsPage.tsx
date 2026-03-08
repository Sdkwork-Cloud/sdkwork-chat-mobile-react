import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CellGroup, CellItem, Icon, Navbar, Toast } from '@sdkwork/react-mobile-commons';
import { creationService, type Creation, type CreationType } from '@sdkwork/react-mobile-creation';
import { formatCreationDate, getCreationCover, getCreationTypeMeta } from './myCreationsListModel';
import './MyCreationsPage.css';

interface MyCreationsPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
  onCreationClick?: (id: string) => void;
}

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
      { id: 'short_drama', label: tr('creations.tabs.short_drama', 'Short Drama') },
      { id: 'collection', label: tr('creations.tabs.collection', 'Collection') },
      { id: 'music', label: tr('creations.tabs.music', 'Music') },
      { id: 'text', label: tr('creations.tabs.text', 'Text') },
    ],
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
      setCreations([]);
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
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDelete = async () => {
    if (selectedIds.size === 0) return;
    const confirmTemplate = t?.('creations.confirm_delete');
    const confirmText =
      confirmTemplate && confirmTemplate !== 'creations.confirm_delete'
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

  const content = useMemo(() => {
    if (isLoading) {
      return (
        <CellGroup>
          <CellItem title={tr('creations.loading', 'Loading creations...')} noBorder />
        </CellGroup>
      );
    }

    if (creations.length === 0) {
      return (
        <CellGroup>
          <CellItem
            title={tr('creations.empty', 'No creations yet')}
            description={tr('creations.empty_desc', 'Create your first work and it will appear here')}
            noBorder
          />
        </CellGroup>
      );
    }

    return (
      <CellGroup>
        {creations.map((item, index) => {
          const cover = getCreationCover(item);
          const typeMeta = getCreationTypeMeta(item.type, tr);
          const selected = selectedIds.has(item.id);
          const icon = cover ? (
            <span
              className="my-creations-page__thumb"
              style={{
                backgroundImage: `url(${cover})`,
              }}
            />
          ) : (
            <span className="my-creations-page__thumb my-creations-page__thumb--placeholder">
              <Icon name={typeMeta.iconName} size={16} color="var(--text-secondary)" />
            </span>
          );

          return (
            <CellItem
              key={item.id}
              icon={icon}
              title={item.title}
              description={item.description?.trim() || typeMeta.label}
              value={<span className="my-creations-page__meta">{formatCreationDate(item.createdAt)}</span>}
              isLink={!isManageMode}
              className={`my-creations-page__item ${
                isManageMode && selected ? 'is-manage-selected' : ''
              }`}
              onClick={() => {
                if (isManageMode) {
                  toggleSelection(item.id);
                  return;
                }
                onCreationClick?.(item.id);
              }}
              rightSlot={
                isManageMode ? (
                  <span className={`my-creations-page__selector ${selected ? 'is-selected' : ''}`}>
                    {selected ? <Icon name="check" size={14} color="white" /> : null}
                  </span>
                ) : undefined
              }
              noBorder={index === creations.length - 1}
            />
          );
        })}
      </CellGroup>
    );
  }, [creations, isLoading, isManageMode, onCreationClick, selectedIds, tr]);

  return (
    <div className="my-creations-page user-center-page">
      <Navbar
        title={navTitle}
        onBack={isManageMode ? handleManageToggle : onBack}
        rightElement={
          <button type="button" onClick={handleManageToggle} className="my-creations-page__navbar-btn">
            {isManageMode ? tr('common.finish', 'Done') : tr('common.manage', 'Manage')}
          </button>
        }
      />

      <div className="my-creations-page__tabs" role="tablist" aria-label="creation types">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.id}
            id={`my-creations-tab-${tab.id}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls="my-creations-tabpanel"
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => setActiveTab(tab.id)}
            className={`my-creations-page__tab-btn ${activeTab === tab.id ? 'is-active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        id="my-creations-tabpanel"
        role="tabpanel"
        aria-labelledby={`my-creations-tab-${activeTab}`}
        className={`my-creations-page__scroll user-center-page__scroll ${isManageMode ? 'is-manage-mode' : ''}`}
      >
        {content}
      </div>

      {isManageMode ? (
        <div className="my-creations-page__actions">
          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={selectedIds.size === 0}
            className={`my-creations-page__delete-btn ${selectedIds.size > 0 ? 'is-enabled' : ''}`}
          >
            {tr('common.delete', 'Delete')} ({selectedIds.size})
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default MyCreationsPage;
