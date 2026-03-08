import React from 'react';
import { CellGroup, CellItem, Icon, Page, Skeleton } from '@sdkwork/react-mobile-commons';
import type { SkillListItem } from '../types';
import { SkillsListItem } from '../components';
import { useSkillsCenter } from '../hooks';
import './SkillsCenterPage.css';

interface SkillsCenterPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
  onNavigate?: (path: string, params?: Record<string, string>) => void;
  onSkillClick?: (item: SkillListItem) => void;
}

export const SkillsCenterPage: React.FC<SkillsCenterPageProps> = ({
  t,
  onBack,
  onNavigate,
  onSkillClick,
}) => {
  const {
    query,
    setQuery,
    groups,
    isLoading,
    error,
    hasBackend,
    reload,
  } = useSkillsCenter('');

  const tr = React.useCallback(
    (key: string, fallback: string) => {
      const value = t?.(key) ?? key;
      return value === key ? fallback : value;
    },
    [t],
  );

  const hasResults = groups.packages.length > 0 || groups.singles.length > 0;

  const handleItemClick = React.useCallback((item: SkillListItem) => {
    if (onSkillClick) {
      onSkillClick(item);
      return;
    }

    if (onNavigate) {
      onNavigate('/skills/detail', {
        id: item.id,
        kind: item.type,
      });
    }
  }, [onNavigate, onSkillClick]);

  return (
    <Page
      title={tr('discover.skills_center', 'Skills Center')}
      onBack={onBack}
      noPadding
      background="var(--bg-body)"
    >
      <div className="skills-center-page">
        <div className="skills-center-page__search-wrap">
          <div className="skills-center-page__search-box">
            <Icon name="search" size={16} color="var(--text-secondary)" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={tr('discover.skills_search_placeholder', 'Search skills package or single skill')}
              className="skills-center-page__search-input"
              aria-label="skills-search"
            />
            {query ? (
              <button
                type="button"
                className="skills-center-page__search-clear"
                onClick={() => setQuery('')}
                aria-label="clear-search"
              >
                <Icon name="close" size={14} color="var(--text-secondary)" />
              </button>
            ) : null}
          </div>
        </div>

        {!hasBackend ? (
          <div className="skills-center-page__notice">
            <Icon name="spark" size={16} color="var(--text-secondary)" />
            <span>{tr('discover.skills_backend_missing', 'Backend is not configured')}</span>
          </div>
        ) : null}

        {isLoading ? (
          <div className="skills-center-page__skeleton">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton
                key={`skills-skeleton-${index}`}
                width="100%"
                height={52}
                style={{ borderRadius: 0, marginBottom: '1px' }}
              />
            ))}
          </div>
        ) : (
          <div className="skills-center-page__content">
            {error ? (
              <CellGroup dividerInsetStart={16}>
                <CellItem
                  title={tr('discover.skills_request_failed', 'Failed to load skills')}
                  description={tr('discover.skills_tap_retry', 'Tap to retry')}
                  isLink
                  noBorder
                  onClick={() => {
                    void reload();
                  }}
                />
              </CellGroup>
            ) : null}

            <CellGroup title={tr('discover.skills_package', 'Skills Package')} dividerInsetStart={16}>
              {groups.packages.length > 0 ? (
                groups.packages.map((item, index) => (
                  <SkillsListItem
                    key={`package-${item.id}`}
                    item={item}
                    t={t}
                    isLast={index === groups.packages.length - 1}
                    onClick={handleItemClick}
                  />
                ))
              ) : (
                <CellItem title={tr('discover.skills_result_empty', 'No matching skills')} noBorder />
              )}
            </CellGroup>

            <CellGroup title={tr('discover.single_skill', 'Single Skill')} dividerInsetStart={16}>
              {groups.singles.length > 0 ? (
                groups.singles.map((item, index) => (
                  <SkillsListItem
                    key={`single-${item.id}`}
                    item={item}
                    t={t}
                    isLast={index === groups.singles.length - 1}
                    onClick={handleItemClick}
                  />
                ))
              ) : (
                <CellItem title={tr('discover.skills_result_empty', 'No matching skills')} noBorder />
              )}
            </CellGroup>

            {!hasResults && !error ? (
              <div className="skills-center-page__empty">
                <Icon name="search" size={20} color="var(--text-secondary)" />
                <span>{tr('discover.skills_result_empty', 'No matching skills')}</span>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </Page>
  );
};

export default SkillsCenterPage;
