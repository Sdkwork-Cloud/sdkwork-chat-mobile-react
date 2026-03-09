import React from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import type { Editor, JSONContent } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Toast, Icon } from '@sdkwork/react-mobile-commons';
import { ChatActionPanel } from './ChatActionPanel';
import { ChatEmojiPanel } from './ChatEmojiPanel';
import { VoiceOverlay } from './VoiceOverlay';
import { resolveChatInputEditorMetrics } from './chatInputEditorMetrics';
import type { Message } from '../types';
import { useChatComposerController } from '../hooks/useChatComposerController';
import './ChatInput.css';

interface ChatInputProps {
  t?: (key: string) => string;
  sessionId: string;
  onSend: (text: string, replyTo?: Message, image?: File) => void;
  onStartVideoCall?: (payload: {
    sessionId: string;
    mode: 'video' | 'audio';
    fallbackApplied: boolean;
  }) => void;
  isLoading: boolean;
  replyMessage: Message | null;
  onCancelReply: () => void;
}

const EDITOR_MIN_HEIGHT = 24;
const EDITOR_MAX_HEIGHT = 136;

const buildPlainTextContent = (text: string): JSONContent => {
  const lines = text.split('\n');
  return {
    type: 'doc',
    content: lines.map((line) => {
      if (!line) {
        return { type: 'paragraph' };
      }
      return {
        type: 'paragraph',
        content: [{ type: 'text', text: line }],
      };
    }),
  };
};

export const ChatInput: React.FC<ChatInputProps> = ({
  t,
  sessionId,
  onSend,
  onStartVideoCall,
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
  const editorRef = React.useRef<Editor | null>(null);
  const [editorHeight, setEditorHeight] = React.useState(EDITOR_MIN_HEIGHT);
  const [editorOverflow, setEditorOverflow] = React.useState(false);

  const requestFocusText = React.useCallback(() => {
    editorRef.current?.commands.focus('end');
  }, []);

  const requestBlurText = React.useCallback(() => {
    editorRef.current?.commands.blur();
  }, []);

  const syncEditorMetrics = React.useCallback((currentEditor?: Editor | null) => {
    const targetEditor = currentEditor ?? editorRef.current;
    if (!targetEditor) return;
    const dom = targetEditor.view.dom as HTMLElement;
    if (!dom) return;
    const metrics = resolveChatInputEditorMetrics(dom.scrollHeight, EDITOR_MIN_HEIGHT, EDITOR_MAX_HEIGHT);
    setEditorHeight((prev) => (prev === metrics.height ? prev : metrics.height));
    setEditorOverflow((prev) => (prev === metrics.overflow ? prev : metrics.overflow));
  }, []);

  const {
    input,
    setInput,
    mode,
    activePanel,
    isRecording,
    cancelVoice,
    handleSend,
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
    onRequestFocusText: requestFocusText,
    onRequestBlurText: requestBlurText,
  });

  const handleEmojiSelect = React.useCallback(
    (emoji: string) => {
      if (!editorRef.current || mode !== 'text') return;
      if (navigator.vibrate) navigator.vibrate(5);
      editorRef.current.chain().focus().insertContent(emoji).run();
      syncEditorMetrics(editorRef.current);
    },
    [mode, syncEditorMetrics]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
        bold: false,
        italic: false,
        strike: false,
      }),
      Placeholder.configure({
        placeholder: tr('chat.input_placeholder', 'Type a message...'),
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'chat-input__prosemirror',
      },
      handleKeyDown: (_view, event) => {
        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && !event.isComposing) {
          event.preventDefault();
          handleSend();
          return true;
        }
        return false;
      },
      handleDOMEvents: {
        focus: () => {
          handleTextFocus();
          return false;
        },
      },
    },
    onCreate: ({ editor: instance }) => {
      editorRef.current = instance;
      syncEditorMetrics(instance);
    },
    onUpdate: ({ editor: instance }) => {
      const text = instance.getText({ blockSeparator: '\n' });
      setInput(text);
      syncEditorMetrics(instance);
    },
    onDestroy: () => {
      editorRef.current = null;
    },
    immediatelyRender: false,
  });

  React.useEffect(() => {
    if (!editor) return;
    const editable = mode === 'text' && !isLoading;
    editor.setEditable(editable);
  }, [editor, mode, isLoading]);

  React.useEffect(() => {
    if (!editor) return;
    const currentText = editor.getText({ blockSeparator: '\n' });
    if (currentText === input) return;
    if (!input) {
      editor.commands.clearContent();
      syncEditorMetrics(editor);
      return;
    }
    editor.commands.setContent(buildPlainTextContent(input), { emitUpdate: false });
    syncEditorMetrics(editor);
  }, [editor, input, syncEditorMetrics]);

  React.useEffect(() => {
    if (!editor || mode !== 'text' || activePanel !== 'none') return;
    window.setTimeout(() => {
      editor.commands.focus('end');
    }, 40);
  }, [activePanel, editor, mode]);

  React.useEffect(() => {
    const onResize = () => syncEditorMetrics();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [syncEditorMetrics]);

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

  return (
    <div className={`chat-input${activePanel !== 'none' ? ' is-panel-open' : ''}${mode === 'voice' ? ' is-voice-mode' : ''}`}>
      <VoiceOverlay
        isRecording={isRecording}
        cancelVoice={cancelVoice}
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

      <div className={`chat-input-bar${showSendButton ? ' has-send' : ''}`}>
        <button
          type="button"
          className="chat-input__icon-btn chat-input__mode-btn"
          onClick={toggleMode}
          aria-label={mode === 'text' ? 'voice-mode' : 'text-mode'}
        >
          <Icon name={mode === 'text' ? 'voice' : 'keyboard'} size={22} />
        </button>

        <div className={`chat-input__editor-wrap${mode === 'voice' ? ' is-voice' : ''}`}>
          {mode === 'text' ? (
            <div
              className={`chat-input__editor-host${editorOverflow ? ' is-overflow' : ''}`}
              style={{ '--chat-editor-height': `${editorHeight}px` } as React.CSSProperties}
              onClick={() => editor?.commands.focus('end')}
            >
              <EditorContent editor={editor} className="chat-input__editor-content" />
            </div>
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
          className={`chat-input__icon-btn chat-input__emoji-btn${activePanel === 'emoji' ? ' is-active' : ''}`}
          onClick={() => togglePanel('emoji')}
          aria-label="emoji-panel"
        >
          <Icon name="emoji" size={22} />
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
            className={`chat-input__icon-btn chat-input__plus-btn${activePanel === 'action' ? ' is-rotated is-active' : ''}`}
            onClick={() => togglePanel('action')}
            aria-label="action-panel"
          >
            <Icon name="plus" size={22} />
          </button>
        )}
      </div>

      <ChatEmojiPanel t={t} visible={activePanel === 'emoji'} onSelect={handleEmojiSelect} />
      <ChatActionPanel
        t={t}
        sessionId={sessionId}
        visible={activePanel === 'action'}
        onSendImage={handleSendImage}
        onStartVideoCall={onStartVideoCall}
      />
    </div>
  );
};
