import React from 'react';
import { CellGroup, CellItem, Icon, Page, Skeleton } from '@sdkwork/react-mobile-commons';
import type { SkillEntryType } from '../types';
import { SkillActionBar, SkillStatusBadge, SkillsListItem } from '../components';
import { useSkillDetail } from '../hooks';
import './SkillDetailPage.css';

interface SkillDetailPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
  onNavigate?: (path: string, params?: Record<string, string>) => void;
  skillId?: string;
  skillType?: SkillEntryType;
}

function toDetailType(value?: SkillEntryType): SkillEntryType {
  return value === 'package' ? 'package' : 'skill';
}

export const SkillDetailPage: React.FC<SkillDetailPageProps> = ({
  t,
  onBack,
  onNavigate,
  skillId,
  skillType,
}) => {
  const detailType = toDetailType(skillType);
  const {
    detail,
    isLoading,
    actionLoading,
    error,
    hasBackend,
    resolvePrimaryAction,
    performAction,
    reload,
  } = useSkillDetail({
    id: skillId,
    type: detailType,
  });

  const tr = React.useCallback(
    (key: string, fallback: string) => {
      const value = t?.(key) ?? key;
      return value === key ? fallback : value;
    },
    [t],
  );

  const handleSkillItemClick = React.useCallback((id: string) => {
    if (!onNavigate) return;
    onNavigate('/skills/detail', {
      id,
      kind: 'skill',
    });
  }, [onNavigate]);

  const title = detail?.name || tr('discover.skill_detail', 'Skill Detail');

  return (
    <Page title={title} onBack={onBack} noPadding background="var(--bg-body)">
      <div className="skill-detail-page">
        {isLoading ? (
          <div className="skill-detail-page__loading">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton
                key={`skill-detail-skeleton-${idx}`}
                width="100%"
                height={52}
                style={{ borderRadius: 0, marginBottom: '1px' }}
              />
            ))}
          </div>
        ) : null}

        {!isLoading && !hasBackend ? (
          <div className="skill-detail-page__notice">
            <Icon name="spark" size={16} color="var(--text-secondary)" />
            <span>{tr('discover.skills_backend_missing', 'Backend is not configured')}</span>
          </div>
        ) : null}

        {!isLoading && error ? (
          <CellGroup dividerInsetStart={16}>
            <CellItem
              title={tr('discover.skills_request_failed', 'Failed to load skill detail')}
              description={tr('discover.skills_tap_retry', 'Tap to retry')}
              isLink
              noBorder
              onClick={() => {
                void reload();
              }}
            />
          </CellGroup>
        ) : null}

        {!isLoading && detail ? (
          <div className="skill-detail-page__content">
            <div className="skill-detail-page__headline">
              <div className="skill-detail-page__status">
                <SkillStatusBadge status={detail.installStatus} t={t} />
              </div>
              {detail.summary ? <p>{detail.summary}</p> : null}
              {detail.description && detail.description !== detail.summary ? <p>{detail.description}</p> : null}
            </div>

            <CellGroup dividerInsetStart={16}>
              <CellItem
                title={tr('discover.skills_version_info', 'Version')}
                value={detail.version ? `v${detail.version}` : '--'}
              />
              <CellItem
                title={tr('discover.skills_install_state', 'Install Status')}
                value={tr(`discover.skills_status_${detail.installStatus}`, detail.installStatus)}
              />
              <CellItem title={tr('discover.skills_provider', 'Provider')} value={detail.provider || '--'} />
              <CellItem title={tr('discover.skills_runtime', 'Runtime')} value={detail.runtime || '--'} />
              <CellItem title={tr('discover.skills_category', 'Category')} value={detail.categoryName || '--'} />
              <CellItem
                title={tr('discover.skills_package_name', 'Package')}
                value={detail.packageName || '--'}
                noBorder
              />
            </CellGroup>

            <CellGroup dividerInsetStart={16}>
              <CellItem title={tr('discover.skills_docs', 'Documentation')} value={detail.documentationUrl || '--'} />
              <CellItem title={tr('discover.skills_homepage', 'Homepage')} value={detail.homepageUrl || '--'} />
              <CellItem title={tr('discover.skills_repository', 'Repository')} value={detail.repositoryUrl || '--'} />
              <CellItem
                title={tr('discover.skills_latest_publish', 'Latest Publish')}
                value={detail.latestPublishedAt || '--'}
                noBorder
              />
            </CellGroup>

            {detail.type === 'package' && detail.includedSkills.length > 0 ? (
              <CellGroup title={tr('discover.skills_included', 'Included Skills')} dividerInsetStart={16}>
                {detail.includedSkills.map((item, index) => (
                  <SkillsListItem
                    key={`included-${item.id}`}
                    item={item}
                    t={t}
                    isLast={index === detail.includedSkills.length - 1}
                    onClick={() => handleSkillItemClick(item.id)}
                  />
                ))}
              </CellGroup>
            ) : null}
          </div>
        ) : null}
      </div>

      {!isLoading && detail ? (
        <SkillActionBar
          action={resolvePrimaryAction()}
          loading={actionLoading}
          t={t}
          onAction={(action) => {
            void performAction(action);
          }}
        />
      ) : null}
    </Page>
  );
};

export default SkillDetailPage;
