import React from 'react';
import { Toast } from '@sdkwork/react-mobile-commons';
import { prepareCallMediaSession } from '@sdkwork/react-mobile-core';
import { ChatPanelContainer } from './ChatPanelContainer';
import './ChatActionPanel.css';

interface ChatActionPanelProps {
  t?: (key: string) => string;
  sessionId: string;
  visible?: boolean;
  onSendImage: (file: File) => void;
  onStartVideoCall?: (payload: {
    sessionId: string;
    mode: 'video' | 'audio';
    fallbackApplied: boolean;
  }) => void;
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

export const ChatActionPanel: React.FC<ChatActionPanelProps> = ({
  t,
  sessionId,
  visible = false,
  onSendImage,
  onStartVideoCall,
}) => {
  const tr = React.useCallback(
    (key: string, fallback: string) => {
      const value = t?.(key);
      if (value && value !== key) return value;
      return fallback;
    },
    [t]
  );

  const resolveCallFailureMessage = (reason?: string) => {
    if (reason === 'unsupported') {
      return tr('chat.actions.call_not_supported', 'Call media is not supported on this device');
    }

    if (reason === 'microphone_denied' || reason === 'microphone_unsupported') {
      return tr('chat.actions.microphone_permission_required', 'Microphone permission is required to place calls');
    }

    return tr(
      'chat.actions.call_permission_required',
      'Unable to place call, please check camera and microphone permissions',
    );
  };

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
        const session = await prepareCallMediaSession({
          preferredMode: 'video',
          allowAudioFallback: true,
        });

        if (!session.ready) {
          Toast.error(resolveCallFailureMessage(session.reason));
          return;
        }

        if (session.mode === 'audio' && session.fallbackApplied) {
          Toast.info(tr('chat.actions.video_fallback_audio', 'Camera permission unavailable, switched to voice call'));
        }

        onStartVideoCall?.({ sessionId, mode: session.mode, fallbackApplied: session.fallbackApplied });

        if (!onStartVideoCall) {
          Toast.info(tr('chat.actions.call_ready', 'Call permissions passed, call session is ready'));
        }
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
    <ChatPanelContainer visible={visible} height={232} className="chat-input-panel chat-input-panel--action">
      <div className="chat-action-panel">
        {actions.map((action) => (
          <button
            type="button"
            key={action.label}
            className="chat-action-panel__item"
            onClick={() => {
              void action.onClick();
            }}
          >
            <span className="chat-action-panel__icon">{action.icon}</span>
            <span className="chat-action-panel__label">{action.label}</span>
          </button>
        ))}
      </div>
    </ChatPanelContainer>
  );
};
