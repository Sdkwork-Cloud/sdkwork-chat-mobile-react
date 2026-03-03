import React from 'react';
import { Toast } from '@sdkwork/react-mobile-commons';
import { ChatPanelContainer } from './ChatPanelContainer';

interface ChatActionPanelProps {
  t?: (key: string) => string;
  sessionId: string;
  visible?: boolean;
  onSendImage: (file: File) => void;
}

const pickFile = (accept: string, options?: { capture?: 'environment' | 'user' }): Promise<File | null> => {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    if (options?.capture) {
      input.setAttribute('capture', options.capture);
    }
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      resolve(file || null);
    };
    input.click();
  });
};

export const ChatActionPanel: React.FC<ChatActionPanelProps> = ({ t, visible = false, onSendImage }) => {
  const tr = React.useCallback(
    (key: string, fallback: string) => {
      const value = t?.(key);
      if (value && value !== key) return value;
      return fallback;
    },
    [t]
  );

  const actions = [
    {
      icon: '📷',
      label: tr('chat.actions.camera', 'Camera'),
      onClick: async () => {
        const file = await pickFile('image/*', { capture: 'environment' });
        if (!file) return;
        onSendImage(file);
      },
    },
    {
      icon: '🖼️',
      label: tr('chat.actions.photo', 'Photos'),
      onClick: async () => {
        const file = await pickFile('image/*');
        if (!file) return;
        onSendImage(file);
      },
    },
    {
      icon: '🎥',
      label: tr('chat.actions.video_call', 'Video'),
      onClick: async () => {
        const file = await pickFile('video/*');
        if (!file) return;
        Toast.info(`${tr('chat.actions.selected_video', 'Selected video')}: ${file.name}`);
      },
    },
    {
      icon: '📍',
      label: tr('chat.actions.location', 'Location'),
      onClick: () => {
        if (!navigator.geolocation) {
          Toast.info(tr('chat.actions.location_not_supported', 'Location is not supported on this device'));
          return;
        }

        const loading = Toast.loading(tr('chat.actions.locating', 'Locating...'));
        navigator.geolocation.getCurrentPosition(
          (position) => {
            loading.close();
            const latitude = position.coords.latitude.toFixed(6);
            const longitude = position.coords.longitude.toFixed(6);
            Toast.success(`${tr('chat.actions.location_success', 'Location')}: ${latitude}, ${longitude}`);
          },
          () => {
            loading.close();
            Toast.error(tr('chat.actions.location_failed', 'Location failed, please check permissions'));
          },
          { enableHighAccuracy: true, timeout: 8000 }
        );
      },
    },
    {
      icon: '📁',
      label: tr('chat.actions.file', 'File'),
      onClick: async () => {
        const file = await pickFile('*/*');
        if (!file) return;
        Toast.info(`${tr('chat.actions.selected_file', 'Selected file')}: ${file.name}`);
      },
    },
  ];

  return (
    <ChatPanelContainer visible={visible} height={220} style={{ padding: visible ? '16px' : '0 16px' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
        }}
      >
        {actions.map((action) => (
          <div
            key={action.label}
            onClick={() => {
              void action.onClick();
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'var(--bg-body)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
              }}
            >
              {action.icon}
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{action.label}</span>
          </div>
        ))}
      </div>
    </ChatPanelContainer>
  );
};
