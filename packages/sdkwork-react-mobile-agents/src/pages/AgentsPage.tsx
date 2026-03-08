import React, { useState, useCallback, useMemo } from 'react';
import { Page, Icon, Skeleton, Toast, TopTabsNavbar, TopTabItem } from '@sdkwork/react-mobile-commons';
import { useAgents } from '../hooks/useAgents';
import { useAgentsI18n } from '../i18n';
import { HapticBridge } from '../bridge';
import type { Agent } from '../types';
import './AgentsPage.css';

const categories = [
  { id: 'all', labelKey: 'category.all' },
  { id: 'productivity', labelKey: 'category.productivity' },
  { id: 'image', labelKey: 'category.image' },
  { id: 'study', labelKey: 'category.study' },
  { id: 'life', labelKey: 'category.life' },
];

const isImageAvatar = (value?: string) => !!value && /^(https?:\/\/|data:image\/|\/)/.test(value);

const AgentCard: React.FC<{
  agent: Agent;
  onClick: () => void;
  disabled?: boolean;
  busy?: boolean;
  highlighted?: boolean;
  enteringLabel: string;
}> = ({
  agent,
  onClick,
  disabled = false,
  busy = false,
  highlighted = false,
  enteringLabel,
}) => (
  <button
    type="button"
    className={`agents-page__card ${disabled ? 'agents-page__card--disabled' : ''}${highlighted ? ' agents-page__card--highlighted' : ''}`}
    onClick={onClick}
    disabled={disabled}
  >
    <div className="agents-page__card-avatar">
      {isImageAvatar(agent.avatar) ? (
        <img src={agent.avatar} alt={agent.name} className="agents-page__card-avatar-img" />
      ) : (
        <span className="agents-page__card-avatar-fallback">AI</span>
      )}
    </div>

    <div className="agents-page__card-content">
      <div className="agents-page__card-title-row">
        <span className="agents-page__card-title">{agent.name}</span>
        {agent.isDefault && <span className="agents-page__card-pro">PRO</span>}
      </div>
      <p className="agents-page__card-desc">{agent.description}</p>
    </div>

    <div className={`agents-page__card-tail ${busy ? 'agents-page__card-tail--busy' : ''}`}>
      {busy ? (
        <span className="agents-page__card-tail-text">{enteringLabel}</span>
      ) : (
        <Icon name="arrow-right" size={18} />
      )}
    </div>
  </button>
);

const AgentsSkeleton: React.FC = () => (
  <div className="agents-page__skeleton-list">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="agents-page__skeleton-item">
        <Skeleton width={56} height={56} style={{ borderRadius: '14px', flexShrink: 0 }} />
        <div className="agents-page__skeleton-body">
          <Skeleton width="40%" height={20} style={{ marginBottom: '8px' }} />
          <Skeleton width="100%" height={14} style={{ marginBottom: '6px' }} />
          <Skeleton width="80%" height={14} />
        </div>
      </div>
    ))}
  </div>
);

interface AgentsPageProps {
  onAgentClick?: (agentId: string) => void | Promise<void>;
  scannedAgent?: { id?: string; name?: string };
  onOpenScannedAgent?: (agentId: string) => void | Promise<void>;
  onSearchClick?: () => void;
  onCreateAgentClick?: () => void;
  showBack?: boolean;
}

const matchesCategory = (agent: Agent, categoryId: string) => {
  if (categoryId === 'all') return true;

  const tags = (agent.tags || []).join(' ').toLowerCase();
  const description = agent.description.toLowerCase();
  const capabilities = agent.capabilities;

  if (categoryId === 'productivity') {
    return (
      capabilities.includes('code_assistant') ||
      capabilities.includes('writing') ||
      capabilities.includes('data_analysis') ||
      capabilities.includes('summarization') ||
      tags.includes('coding')
    );
  }

  if (categoryId === 'image') {
    return capabilities.includes('image_generation') || tags.includes('image') || description.includes('image');
  }

  if (categoryId === 'study') {
    return (
      capabilities.includes('translation') ||
      capabilities.includes('summarization') ||
      capabilities.includes('reasoning') ||
      tags.includes('research') ||
      description.includes('analysis')
    );
  }

  if (categoryId === 'life') {
    return capabilities.includes('chat') || capabilities.includes('creative') || tags.includes('general');
  }

  return true;
};

const AgentsPage: React.FC<AgentsPageProps> = ({
  onAgentClick,
  scannedAgent,
  onOpenScannedAgent,
  onSearchClick,
}) => {
  const { t } = useAgentsI18n();
  const { agents, isLoading } = useAgents();
  const [activeCategory, setActiveCategory] = useState('all');
  const [pendingAgentId, setPendingAgentId] = useState<string | null>(null);
  const scanAgentId = (scannedAgent?.id || '').trim();
  const scanAgentName = (scannedAgent?.name || '').trim();

  const categoryTabs = useMemo<TopTabItem[]>(
    () =>
      categories.map((cat) => ({
        id: cat.id,
        label: t(cat.labelKey as any),
      })),
    [t]
  );

  const filteredAgents = useMemo(
    () => agents.filter((agent) => matchesCategory(agent, activeCategory)),
    [agents, activeCategory]
  );

  const handleAgentClick = useCallback(
    async (agentId: string) => {
      if (!onAgentClick || pendingAgentId) return;

      setPendingAgentId(agentId);
      void HapticBridge.light();

      try {
        await onAgentClick(agentId);
      } catch (error) {
        console.error('[AgentsPage] Failed to open conversation:', error);
        Toast.error(t('pages.agents.open_failed'));
      } finally {
        setPendingAgentId(null);
      }
    },
    [onAgentClick, pendingAgentId, t]
  );

  const handleCategoryChange = useCallback(async (categoryId: string) => {
    setActiveCategory(categoryId);
    await HapticBridge.selection();
  }, []);

  const handleOpenScannedAgent = useCallback(async () => {
    if (!scanAgentId || pendingAgentId) return;

    if (onOpenScannedAgent) {
      setPendingAgentId(scanAgentId);
      try {
        await onOpenScannedAgent(scanAgentId);
      } catch (error) {
        console.error('[AgentsPage] Failed to open scanned agent:', error);
        Toast.error(t('pages.agents.open_failed'));
      } finally {
        setPendingAgentId(null);
      }
      return;
    }

    await handleAgentClick(scanAgentId);
  }, [handleAgentClick, onOpenScannedAgent, pendingAgentId, scanAgentId, t]);

  return (
    <Page noNavbar noPadding background="var(--bg-body)">
      <div className="agents-page">
        <TopTabsNavbar
          tabs={categoryTabs}
          activeTab={activeCategory}
          onTabChange={handleCategoryChange}
          activeColor="#1e8fff"
          inactiveColor="var(--text-secondary)"
          indicatorColor="#1e8fff"
          rightAction={(
            <button type="button" className="agents-page__search-btn" onClick={onSearchClick} aria-label="search agents">
              <Icon name="search" size={20} />
            </button>
          )}
        />

        <div className="agents-page__content">
          {(scanAgentId || scanAgentName) ? (
            <div className="agents-page__scan-banner">
              <div className="agents-page__scan-main">
                <div className="agents-page__scan-title">{t('pages.agents.scan.title') || 'Recognized Agent'}</div>
                <div className="agents-page__scan-desc">
                  {scanAgentName || scanAgentId}
                  {scanAgentId && scanAgentName ? ` (${scanAgentId})` : ''}
                </div>
              </div>
              <button
                type="button"
                className="agents-page__scan-btn"
                onClick={() => void handleOpenScannedAgent()}
                disabled={!scanAgentId || !!pendingAgentId}
              >
                {t('pages.agents.scan.open') || 'Open'}
              </button>
            </div>
          ) : null}

          {isLoading ? (
            <AgentsSkeleton />
          ) : (
            <div className="agents-page__list">
              {filteredAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  enteringLabel={t('pages.agents.entering')}
                  onClick={() => handleAgentClick(agent.id)}
                  disabled={!!pendingAgentId}
                  busy={pendingAgentId === agent.id}
                  highlighted={!!scanAgentId && scanAgentId === agent.id}
                />
              ))}
            </div>
          )}

          {!isLoading && filteredAgents.length === 0 && (
            <div className="agents-page__empty">
              <div className="agents-page__empty-icon">AI</div>
              <div className="agents-page__empty-text">{t('pages.agents.empty')}</div>
            </div>
          )}
        </div>
      </div>
    </Page>
  );
};

export default AgentsPage;
