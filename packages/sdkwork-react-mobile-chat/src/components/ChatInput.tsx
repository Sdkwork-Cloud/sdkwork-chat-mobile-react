import React from 'react';
import { Toast, Icon } from '@sdkwork/react-mobile-commons';
import { ChatActionPanel } from './ChatActionPanel';
import { ChatEmojiPanel } from './ChatEmojiPanel';
import { VoiceOverlay } from './VoiceOverlay';
import type { Message } from '../types';
import { useChatComposerController } from '../hooks/useChatComposerController';
import './ChatInput.css';

interface ChatInputProps {
  t?: (key: string) => string;
  sessionId: string;
  onSend: (text: string, replyTo?: Message, image?: File) => void;
  isLoading: boolean;
  replyMessage: Message | null;
  onCancelReply: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  t,
  sessionId,
  onSend,
  isLoading,
  replyMessage,
  onCancelReply,
}) => {
  const tr = React.useCallback(
    (key: string, fallback: string) => {
      const value = t?.(key);
      if (value && value !== key) return value;
      return fallback;
    },
    [t]
  );
  const voicePointerIdRef = React.useRef<number | null>(null);
  const inputBarRef = React.useRef<HTMLDivElement>(null);
  const [voiceOverlayBottom, setVoiceOverlayBottom] = React.useState(112);

  const {
    input,
    setInput,
    mode,
    activePanel,
    isRecording,
    cancelVoice,
    textareaRef,
    handleSend,
    handleEmojiSelect,
    handleKeyDown,
    togglePanel,
    toggleMode,
    startVoiceRecording,
    moveVoiceRecording,
    endVoiceRecording,
    handleTextFocus,
  } = useChatComposerController({
    isLoading,
    replyMessage,
    onSend,
    onCancelReply,
    onVoiceSent: () => Toast.success(tr('chat.voice_sent', 'Voice message sent')),
    onVoiceCancelled: () => Toast.info(tr('chat.voice_cancelled', 'Cancelled')),
  });

  const handleSendImage = React.useCallback(
    (file: File) => {
      if (isLoading) return;
      onSend('', replyMessage || undefined, file);
      if (replyMessage) {
        onCancelReply();
      }
      if (activePanel === 'action') {
        togglePanel('action');
      }
    },
    [activePanel, isLoading, onCancelReply, onSend, replyMessage, togglePanel]
  );

  const handleVoicePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      event.preventDefault();
      voicePointerIdRef.current = event.pointerId;
      event.currentTarget.setPointerCapture?.(event.pointerId);
      const rect = inputBarRef.current?.getBoundingClientRect();
      if (rect) {
        // Keep voice overlay anchored above the composer across viewport/keyboard changes.
        const anchoredBottom = Math.round(window.innerHeight - rect.top + 16);
        setVoiceOverlayBottom(Math.max(96, Math.min(188, anchoredBottom)));
      }
      startVoiceRecording(event.clientY);
    },
    [startVoiceRecording]
  );

  const handleVoicePointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (voicePointerIdRef.current !== event.pointerId) return;
      moveVoiceRecording(event.clientY);
    },
    [moveVoiceRecording]
  );

  const handleVoicePointerEnd = React.useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (voicePointerIdRef.current !== event.pointerId) return;
      voicePointerIdRef.current = null;
      endVoiceRecording();
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    },
    [endVoiceRecording]
  );

  const voiceButtonText = cancelVoice
    ? tr('chat.voice_release_cancel', 'Release to cancel')
    : isRecording
      ? tr('chat.voice_release_send', 'Release to send')
      : tr('chat.voice_hold', 'Hold to Talk');

  const showSendButton = mode === 'text' && input.trim().length > 0;

  React.useEffect(() => {
    const updateVoiceOverlayBottom = () => {
      const rect = inputBarRef.current?.getBoundingClientRect();
      if (!rect) return;
      const anchoredBottom = Math.round(window.innerHeight - rect.top + 16);
      setVoiceOverlayBottom((prev) => {
        const next = Math.max(96, Math.min(188, anchoredBottom));
        return prev === next ? prev : next;
      });
    };

    updateVoiceOverlayBottom();
    window.addEventListener('resize', updateVoiceOverlayBottom);
    window.addEventListener('orientationchange', updateVoiceOverlayBottom);
    window.visualViewport?.addEventListener('resize', updateVoiceOverlayBottom);
    window.visualViewport?.addEventListener('scroll', updateVoiceOverlayBottom);

    return () => {
      window.removeEventListener('resize', updateVoiceOverlayBottom);
      window.removeEventListener('orientationchange', updateVoiceOverlayBottom);
      window.visualViewport?.removeEventListener('resize', updateVoiceOverlayBottom);
      window.visualViewport?.removeEventListener('scroll', updateVoiceOverlayBottom);
    };
  }, []);

  return (
    <div className={`chat-input${activePanel !== 'none' ? ' is-panel-open' : ''}`}>
      <VoiceOverlay
        isRecording={isRecording}
        cancelVoice={cancelVoice}
        bottomOffset={voiceOverlayBottom}
        recordingHint={tr('chat.swipe_to_cancel', 'Swipe up to cancel')}
        cancelHint={tr('chat.voice_release_cancel', 'Release to cancel')}
      />

      {replyMessage && (
        <div className="chat-input__reply">
          <div className="chat-input__reply-main">
            <div className="chat-input__reply-line" />
            <span className="chat-input__reply-text">
              {tr('chat.replying_to', 'Reply')} {replyMessage.content}
            </span>
          </div>
          <button type="button" className="chat-input__reply-close" onClick={onCancelReply}>
            <Icon name="close" size={14} />
          </button>
        </div>
      )}

      <div className="chat-input-bar" ref={inputBarRef}>
        <button
          type="button"
          className="chat-input__icon-btn"
          onClick={toggleMode}
          aria-label={mode === 'text' ? 'voice-mode' : 'text-mode'}
        >
          <Icon name={mode === 'text' ? 'voice' : 'keyboard'} size={24} />
        </button>

        <div className={`chat-input__editor-wrap${mode === 'voice' ? ' is-voice' : ''}`}>
          {mode === 'text' ? (
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleTextFocus}
              placeholder={tr('chat.input_placeholder', 'Type a message...')}
              rows={1}
              className="chat-input__textarea"
            />
          ) : (
            <button
              type="button"
              className={`chat-input__voice-hold${isRecording ? ' is-recording' : ''}${cancelVoice ? ' is-cancel' : ''}`}
              onPointerDown={handleVoicePointerDown}
              onPointerMove={handleVoicePointerMove}
              onPointerUp={handleVoicePointerEnd}
              onPointerCancel={handleVoicePointerEnd}
            >
              {voiceButtonText}
            </button>
          )}
        </div>

        <button
          type="button"
          className={`chat-input__icon-btn${activePanel === 'emoji' ? ' is-active' : ''}`}
          onClick={() => togglePanel('emoji')}
          aria-label="emoji-panel"
        >
          <Icon name="emoji" size={24} />
        </button>

        {showSendButton ? (
          <button
            type="button"
            onClick={handleSend}
            className="chat-input__send-btn"
            disabled={isLoading}
          >
            {tr('chat.send', 'Send')}
          </button>
        ) : (
          <button
            type="button"
            className={`chat-input__icon-btn chat-input__plus-btn${activePanel === 'action' ? ' is-rotated' : ''}`}
            onClick={() => togglePanel('action')}
            aria-label="action-panel"
          >
            <Icon name="plus" size={24} />
          </button>
        )}
      </div>

      <ChatEmojiPanel t={t} visible={activePanel === 'emoji'} onSelect={handleEmojiSelect} />
      <ChatActionPanel t={t} sessionId={sessionId} visible={activePanel === 'action'} onSendImage={handleSendImage} />
    </div>
  );
};
