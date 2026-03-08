import React from 'react';
import { ActionSheet, CellGroup, CellItem, Icon, Navbar, Toast } from '@sdkwork/react-mobile-commons';
import { AGENT_REGISTRY } from '@sdkwork/react-mobile-chat';
import { agentPreferenceService } from '../services/AgentPreferenceService';
import type { AgentPreferenceOverride } from '../types';
import {
  applyAgentPreferences,
  buildAgentList,
  formatAgentCreatedDate,
  resolveAgentAvatarText,
  type AgentRegistryMap,
  type DisplayAgent,
} from './myAgentsListModel';
import './MyAgentsPage.css';

interface MyAgentsPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
  onCreateAgent?: () => void;
  onChatWithAgent?: (agentId: string) => void | Promise<void>;
}

export const MyAgentsPage: React.FC<MyAgentsPageProps> = ({ t, onBack, onChatWithAgent }) => {
  const [openingAgentId, setOpeningAgentId] = React.useState('');
  const [hiddenIds, setHiddenIds] = React.useState<Set<string>>(new Set());
  const [overrides, setOverrides] = React.useState<Record<string, AgentPreferenceOverride>>({});

  const tr = React.useCallback(
    (key: string, fallback: string) => {
      const value = t?.(key);
      if (value && value !== key) return value;
      return fallback;
    },
    [t]
  );

  React.useEffect(() => {
    let disposed = false;
    void Promise.all([
      agentPreferenceService.getHiddenAgentIds(),
      agentPreferenceService.getAgentOverrides(),
    ]).then(([hiddenAgentIds, savedOverrides]) => {
      if (disposed) return;
      setHiddenIds(new Set(hiddenAgentIds));
      setOverrides(savedOverrides);
    });

    return () => {
      disposed = true;
    };
  }, []);

  const baseAgents = React.useMemo(() => buildAgentList(AGENT_REGISTRY as AgentRegistryMap), []);

  const agents = React.useMemo(
    () => applyAgentPreferences(baseAgents, hiddenIds, overrides),
    [baseAgents, hiddenIds, overrides]
  );

  const handleOpenChat = React.useCallback(
    async (agentId: string) => {
      if (!onChatWithAgent || openingAgentId) return;
      setOpeningAgentId(agentId);
      try {
        await onChatWithAgent(agentId);
      } catch (error) {
        console.error('[MyAgentsPage] open chat failed:', error);
        Toast.error(tr('my_agents.errors.open_failed', 'Failed to open chat. Please try again.'));
      } finally {
        setOpeningAgentId('');
      }
    },
    [onChatWithAgent, openingAgentId, tr]
  );

  const handleManageAgent = React.useCallback(
    async (agent: DisplayAgent) => {
      const action = await ActionSheet.showActions({
        title: agent.name,
        actions: [
          { text: tr('my_agents.actions.open', 'Open Chat'), key: 'open' },
          { text: tr('my_agents.actions.rename', 'Rename'), key: 'rename' },
          { text: tr('my_agents.actions.delete', 'Delete Agent'), key: 'delete', color: '#fa5151' },
        ],
        variant: 'user-center',
      });

      if (!action) return;

      if (action.key === 'open') {
        await handleOpenChat(agent.id);
        return;
      }

      if (action.key === 'rename') {
        const nextName = window
          .prompt(tr('my_agents.rename_prompt', 'Enter a new agent name'), agent.name)
          ?.trim();
        if (!nextName) return;
        const nextOverrides = {
          ...overrides,
          [agent.id]: {
            ...overrides[agent.id],
            name: nextName,
          },
        };
        setOverrides(nextOverrides);
        void agentPreferenceService.setAgentOverrides(nextOverrides);
        Toast.success(tr('my_agents.messages.renamed', 'Renamed'));
        return;
      }

      if (action.key === 'delete') {
        const confirmed = window.confirm(
          `${tr('my_agents.confirm_delete_prefix', 'Delete')} "${agent.name}"?`
        );
        if (!confirmed) return;
        const nextHidden = new Set(hiddenIds);
        nextHidden.add(agent.id);
        setHiddenIds(nextHidden);
        void agentPreferenceService.setHiddenAgentIds(Array.from(nextHidden));
        Toast.success(tr('my_agents.messages.deleted', 'Deleted'));
      }
    },
    [handleOpenChat, hiddenIds, overrides, tr]
  );

  return (
    <div className="my-agents-page user-center-page">
      <Navbar title={tr('my_agents.title', 'My Agents')} onBack={onBack} />

      <div className="my-agents-page__scroll user-center-page__scroll">
        {agents.length === 0 ? (
          <CellGroup>
            <CellItem
              title={tr('my_agents.empty', 'No agents yet')}
              description={tr('my_agents.empty_desc', 'Agents you can access will appear here')}
              noBorder
            />
          </CellGroup>
        ) : (
          <CellGroup>
            {agents.map((agent, index) => (
              <CellItem
                key={agent.id}
                icon={<span className="my-agents-page__avatar">{resolveAgentAvatarText(agent)}</span>}
                title={agent.name}
                description={agent.description || tr('my_agents.default_desc', 'No description')}
                value={
                  openingAgentId === agent.id ? (
                    <span className="my-agents-page__meta my-agents-page__meta--opening">
                      <Icon name="loading" size={12} spin color="var(--primary-color)" />
                      {tr('my_agents.opening', 'Opening...')}
                    </span>
                  ) : (
                    <span className="my-agents-page__meta">
                      {`${tr('my_agents.created_at', 'Created at')} ${formatAgentCreatedDate(agent.createTime)}`}
                    </span>
                  )
                }
                isLink
                className={`my-agents-page__item ${openingAgentId === agent.id ? 'is-opening' : ''}`}
                onClick={() => {
                  void handleOpenChat(agent.id);
                }}
                rightSlot={(
                  <button
                    type="button"
                    className="my-agents-page__more-btn"
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleManageAgent(agent);
                    }}
                    aria-label={`manage ${agent.name}`}
                  >
                    <Icon name="more" size={18} color="var(--text-secondary)" />
                  </button>
                )}
                noBorder={index === agents.length - 1}
              />
            ))}
          </CellGroup>
        )}
      </div>
    </div>
  );
};

export default MyAgentsPage;
