import React from 'react';
import { ActionSheet, Button, Icon, Navbar, Toast } from '@sdkwork/react-mobile-commons';
import { AGENT_REGISTRY } from '@sdkwork/react-mobile-chat';
import { agentPreferenceService } from '../services/AgentPreferenceService';
import type { AgentPreferenceOverride } from '../types';

interface MyAgentsPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
  onCreateAgent?: () => void;
  onChatWithAgent?: (agentId: string) => void | Promise<void>;
}

interface DisplayAgent {
  id: string;
  name: string;
  avatar: string;
  description: string;
  tags: string[];
  createTime: number;
}

const formatDate = (value: number): string => new Date(value).toLocaleDateString();

const buildAgentList = (): DisplayAgent[] => {
  const now = Date.now();
  const entries = Object.values(AGENT_REGISTRY).filter((item) => item.id.startsWith('custom_') || item.tags.includes('mine'));
  const defaultList = entries.length > 0 ? entries : Object.values(AGENT_REGISTRY).slice(0, 3);

  return defaultList.map((item, index) => ({
    id: item.id,
    name: item.name,
    avatar: item.avatar,
    description: item.description,
    tags: item.tags,
    createTime: now - (index + 1) * 86400000 * 3,
  }));
};

export const MyAgentsPage: React.FC<MyAgentsPageProps> = ({ t, onBack, onCreateAgent, onChatWithAgent }) => {
  const [openingAgentId, setOpeningAgentId] = React.useState('');
  const [hiddenIds, setHiddenIds] = React.useState<Set<string>>(new Set());
  const [overrides, setOverrides] = React.useState<Record<string, AgentPreferenceOverride>>({});
  const longPressTimerRef = React.useRef<number | null>(null);
  const suppressNextClickRef = React.useRef(false);
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

  const agents = React.useMemo(() => {
    const base = buildAgentList();
    return base
      .filter((item) => !hiddenIds.has(item.id))
      .map((item) => ({
        ...item,
        name: overrides[item.id]?.name || item.name,
        description: overrides[item.id]?.description || item.description,
      }));
  }, [hiddenIds, overrides]);

  const clearPressTimer = React.useCallback(() => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

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
      });

      if (!action) return;

      if (action.key === 'open') {
        await handleOpenChat(agent.id);
        return;
      }

      if (action.key === 'rename') {
        const nextName = window.prompt(tr('my_agents.rename_prompt', 'Enter a new agent name'), agent.name)?.trim();
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
        const confirmed = window.confirm(`${tr('my_agents.confirm_delete_prefix', 'Delete')} "${agent.name}"?`);
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

  const handlePressStart = React.useCallback(
    (agent: DisplayAgent) => {
      clearPressTimer();
      longPressTimerRef.current = window.setTimeout(() => {
        longPressTimerRef.current = null;
        suppressNextClickRef.current = true;
        void handleManageAgent(agent);
      }, 550);
    },
    [clearPressTimer, handleManageAgent]
  );

  React.useEffect(() => {
    return () => {
      clearPressTimer();
    };
  }, [clearPressTimer]);

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg-body)' }}>
      <Navbar
        title={tr('my_agents.title', 'My Agents')}
        onBack={onBack}
        rightElement={
          <button
            type="button"
            onClick={onCreateAgent}
            style={{
              border: 'none',
              background: 'transparent',
              color: 'var(--text-primary)',
              fontSize: '22px',
              lineHeight: 1,
              cursor: 'pointer',
            }}
            aria-label="create-agent"
          >
            +
          </button>
        }
      />

      <div style={{ padding: '12px', paddingBottom: 'calc(16px + env(safe-area-inset-bottom))' }}>
        {agents.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '36px 0' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🤖</div>
            <div style={{ marginBottom: '12px' }}>{tr('my_agents.empty', 'No agents yet')}</div>
            <Button size="sm" onClick={onCreateAgent}>
              {tr('my_agents.create', 'Create')}
            </Button>
          </div>
        ) : (
          agents.map((agent) => (
            <button
              type="button"
              key={agent.id}
              onClick={() => {
                if (suppressNextClickRef.current) {
                  suppressNextClickRef.current = false;
                  return;
                }
                void handleOpenChat(agent.id);
              }}
              onTouchStart={() => handlePressStart(agent)}
              onTouchEnd={clearPressTimer}
              onTouchCancel={clearPressTimer}
              onMouseDown={() => handlePressStart(agent)}
              onMouseUp={clearPressTimer}
              onMouseLeave={clearPressTimer}
              style={{
                width: '100%',
                border: '0.5px solid var(--border-color)',
                borderRadius: '14px',
                padding: '12px',
                marginBottom: '10px',
                background: 'var(--bg-card)',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: 'linear-gradient(145deg, rgba(64,128,255,0.1), rgba(121,40,202,0.12))',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  flexShrink: 0,
                }}
              >
                {agent.avatar}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{agent.name}</div>
                <div
                  style={{
                    marginTop: '4px',
                    color: 'var(--text-secondary)',
                    fontSize: '13px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {agent.description}
                </div>
                <div style={{ marginTop: '6px', color: 'var(--text-placeholder)', fontSize: '12px' }}>
                  {tr('my_agents.created_at', 'Created at')} {formatDate(agent.createTime)}
                </div>
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {openingAgentId === agent.id ? tr('my_agents.opening', 'Opening...') : tr('my_agents.open', 'Open')}
                <Icon name="arrow-right" size={14} color="currentColor" />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default MyAgentsPage;
