import React from 'react';
import { Icon } from '@sdkwork/react-mobile-commons';
import './VoiceOverlay.css';

interface VoiceOverlayProps {
  isRecording: boolean;
  cancelVoice: boolean;
  bottomOffset?: number;
  recordingHint?: string;
  cancelHint?: string;
}

export const VoiceOverlay: React.FC<VoiceOverlayProps> = ({
  isRecording,
  cancelVoice,
  bottomOffset = 112,
  recordingHint = '\u4e0a\u6ed1\u53d6\u6d88\u53d1\u9001',
  cancelHint = '\u677e\u5f00\u53d6\u6d88',
}) => {
  if (!isRecording) return null;

  return (
    <div
      className="voice-overlay"
      style={{ paddingBottom: `calc(env(safe-area-inset-bottom) + ${Math.max(96, Math.min(188, bottomOffset))}px)` }}
    >
      <div className={`voice-overlay__card${cancelVoice ? ' is-cancel' : ''}`}>
        <div className="voice-overlay__icon-wrap" aria-hidden="true">
          <Icon name={cancelVoice ? 'close' : 'voice'} size={46} />
        </div>

        <div className="voice-overlay__hint">
          {cancelVoice ? cancelHint : recordingHint}
        </div>

        {!cancelVoice ? (
          <div className="voice-overlay__wave" aria-hidden="true">
            {Array.from({ length: 7 }).map((_, index) => (
              <span
                key={`wave-${index + 1}`}
                style={{ animationDelay: `${index * 0.08}s` }}
              />
            ))}
          </div>
        ) : (
          <div className="voice-overlay__cancel-tip">{'\u5411\u4e0a\u6ed1\u52a8\u4f1a\u53d6\u6d88\u53d1\u9001'}</div>
        )}
      </div>
    </div>
  );
};
