import React from 'react';
import { useChatStoreActions } from '../stores/chatStore';

interface PluginItem {
  id: string;
  labelKey: string;
  fallback: string;
  icon: string;
  color: string;
  action?: string;
  agentId?: string;
}

interface ChatPluginPanelProps {
  t?: (key: string) => string;
  visible: boolean;
  onPluginClick: (label: string) => void;
  onNavigate?: (path: string, params?: any) => void;
}

const PLUGIN_ITEMS: PluginItem[] = [
  {
    id: 'shopping',
    labelKey: 'chat.plugins.recommend_goods',
    fallback: 'Product Picks',
    icon: '[Shop]',
    color: '#ff4d4f',
    agentId: 'agent_shopper',
  },
  {
    id: 'prompts',
    labelKey: 'chat.plugins.prompt_library',
    fallback: 'Prompt Library',
    icon: '📚',
    color: '#722ed1',
  },
  {
    id: 'translator',
    labelKey: 'chat.plugins.translator',
    fallback: 'Translator',
    icon: '🌍',
    color: '#1890ff',
  },
  {
    id: 'snippet',
    labelKey: 'chat.plugins.code_snippet',
    fallback: 'Code Snippet',
    icon: '💻',
    color: '#fa8c16',
  },
  {
    id: 'polish',
    labelKey: 'chat.plugins.polish_text',
    fallback: 'Polish Text',
    icon: '[Polish]',
    color: '#eb2f96',
  },
  {
    id: 'image',
    labelKey: 'chat.plugins.ai_image',
    fallback: 'AI Image',
    icon: '🎨',
    color: '#13c2c2',
    action: '/creation',
  },
  {
    id: 'document',
    labelKey: 'chat.plugins.document_analysis',
    fallback: 'Document Analysis',
    icon: '📄',
    color: '#52c41a',
  },
];

export const ChatPluginPanel: React.FC<ChatPluginPanelProps> = ({ t, visible, onPluginClick, onNavigate }) => {
  const { createSession } = useChatStoreActions();
  const tr = (key: string, fallback: string) => {
    const value = t?.(key);
    if (value && value !== key) return value;
    return fallback;
  };

  const handleItemClick = async (plugin: PluginItem) => {
    const label = tr(plugin.labelKey, plugin.fallback);
    if (plugin.action) {
      onNavigate?.(plugin.action);
      return;
    }
    if (plugin.agentId) {
      const sessionId = await createSession(plugin.agentId);
      onNavigate?.('/chat', { id: sessionId });
      return;
    }
    onPluginClick(label);
  };

  return (
    <div
      style={{
        height: visible ? '180px' : '0px',
        overflow: 'hidden',
        transition: 'height 0.25s cubic-bezier(0.19, 1, 0.22, 1)',
        background: 'var(--bg-body)',
        borderTop: visible ? '0.5px solid var(--border-color)' : 'none',
      }}
    >
      <div style={{ padding: '16px', height: '100%', overflowY: 'auto' }}>
        <div
          style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            marginBottom: '12px',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>{tr('chat.plugins.header', 'Smart assistants & prompts')}</span>
          <span style={{ color: 'var(--primary-color)' }}>{tr('chat.plugins.market', 'App Market >')}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {PLUGIN_ITEMS.map((plugin) => {
            const label = tr(plugin.labelKey, plugin.fallback);
            return (
              <div
                key={plugin.id}
                onClick={() => {
                  void handleItemClick(plugin);
                }}
                style={{
                  background: 'var(--bg-card)',
                  padding: '12px',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ fontSize: '24px', zIndex: 1 }}>{plugin.icon}</div>
                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-primary)',
                    zIndex: 1,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                  }}
                >
                  {label}
                </div>

                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '4px',
                    background: plugin.color,
                    opacity: 0.8,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

