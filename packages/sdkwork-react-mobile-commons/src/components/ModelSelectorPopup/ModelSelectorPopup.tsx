import React, { useEffect, useMemo, useState } from 'react';
import { Popup } from '../Popup';

export interface ModelSelectorOption {
  id: string;
  name: string;
  description?: string;
  badge?: string;
}

export interface ModelChannelOption {
  id: string;
  name: string;
  icon?: React.ReactNode;
  description?: string;
  models: ModelSelectorOption[];
}

interface ModelSelectorPopupProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  channels: ModelChannelOption[];
  initialChannelId?: string;
  selectedModelId?: string;
  onSelect: (channelId: string, modelId: string) => void;
}

export const ModelSelectorPopup: React.FC<ModelSelectorPopupProps> = ({
  visible,
  onClose,
  title = 'Select Model',
  channels,
  initialChannelId,
  selectedModelId,
  onSelect,
}) => {
  const [activeChannelId, setActiveChannelId] = useState<string | undefined>(initialChannelId || channels[0]?.id);

  const selectedChannel = useMemo(() => {
    if (selectedModelId) {
      const channel = channels.find((item) => item.models.some((model) => model.id === selectedModelId));
      if (channel) return channel;
    }
    if (initialChannelId) {
      const channel = channels.find((item) => item.id === initialChannelId);
      if (channel) return channel;
    }
    return channels[0];
  }, [channels, initialChannelId, selectedModelId]);

  useEffect(() => {
    if (!visible) return;
    setActiveChannelId(selectedChannel?.id);
  }, [visible, selectedChannel]);

  const activeChannel = channels.find((item) => item.id === activeChannelId) || channels[0];

  return (
    <Popup visible={visible} onClose={onClose} position="bottom" round style={{ height: '75vh' }}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: 'inherit' }}>
        <div
          style={{
            padding: '16px',
            textAlign: 'center',
            fontWeight: 600,
            borderBottom: '0.5px solid var(--border-color)',
            background: 'rgba(var(--bg-card-rgb), 0.95)',
            backdropFilter: 'blur(10px)',
            fontSize: '17px',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          <span>{title}</span>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              right: 16,
              top: 16,
              border: 'none',
              background: 'var(--bg-body)',
              color: 'var(--text-secondary)',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              lineHeight: 1,
            }}
            aria-label="Close model selector"
          >
            ×
          </button>
        </div>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <div
            style={{
              width: '136px',
              background: 'var(--bg-body)',
              overflowY: 'auto',
              borderRight: '0.5px solid var(--border-color)',
            }}
          >
            {channels.map((channel) => {
              const isActive = channel.id === activeChannel?.id;
              return (
                <button
                  key={channel.id}
                  onClick={() => setActiveChannelId(channel.id)}
                  style={{
                    width: '100%',
                    border: 'none',
                    background: isActive ? 'var(--bg-card)' : 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    padding: '14px 12px',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {isActive ? (
                    <span
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '3px',
                        height: '22px',
                        background: 'var(--primary-color)',
                        borderRadius: '0 3px 3px 0',
                      }}
                    />
                  ) : null}
                  <span style={{ fontSize: '18px', width: '20px', textAlign: 'center' }}>{channel.icon || '🤖'}</span>
                  <span
                    style={{
                      fontSize: '12px',
                      color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)',
                      fontWeight: isActive ? 600 : 400,
                      lineHeight: 1.3,
                    }}
                  >
                    {channel.name}
                  </span>
                </button>
              );
            })}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-card)' }}>
            <div style={{ padding: '18px 18px 12px' }}>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>{activeChannel?.icon || '🤖'}</span>
                <span>{activeChannel?.name || 'Channel'}</span>
              </div>
              {activeChannel?.description ? (
                <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {activeChannel.description}
                </div>
              ) : null}
            </div>

            <div style={{ padding: '8px 18px 20px' }}>
              {activeChannel?.models.map((model) => {
                const isSelected = selectedModelId === model.id;
                return (
                  <button
                    key={model.id}
                    onClick={() => onSelect(activeChannel.id, model.id)}
                    style={{
                      width: '100%',
                      border: isSelected ? '1px solid rgba(41, 121, 255, 0.35)' : '1px solid transparent',
                      borderRadius: '12px',
                      marginBottom: '10px',
                      background: isSelected ? 'rgba(41, 121, 255, 0.08)' : 'var(--bg-body)',
                      color: isSelected ? 'var(--primary-color)' : 'var(--text-primary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      padding: '14px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ fontSize: '14px', fontWeight: isSelected ? 600 : 500 }}>{model.name}</div>
                      {model.badge ? (
                        <span
                          style={{
                            fontSize: '10px',
                            padding: '1px 6px',
                            borderRadius: '999px',
                            background: 'rgba(255,255,255,0.1)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {model.badge}
                        </span>
                      ) : null}
                    </div>
                    {model.description ? (
                      <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                        {model.description}
                      </div>
                    ) : null}
                  </button>
                );
              })}
              {!activeChannel || activeChannel.models.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px', padding: '24px 0' }}>
                  No models available
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </Popup>
  );
};

