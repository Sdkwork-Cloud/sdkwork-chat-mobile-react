import { useCallback, useEffect, useRef, useState } from 'react';
import type { Message } from '../types';

export type ComposerMode = 'text' | 'voice';
export type ComposerPanel = 'none' | 'action' | 'emoji';

interface UseChatComposerControllerOptions {
  isLoading: boolean;
  replyMessage: Message | null;
  onSend: (text: string, replyTo?: Message, image?: File) => void;
  onCancelReply: () => void;
  onVoiceSent?: () => void;
  onVoiceCancelled?: () => void;
}

const Haptic = {
  success: () => {
    if (navigator.vibrate) navigator.vibrate(10);
  },
  selection: () => {
    if (navigator.vibrate) navigator.vibrate(5);
  },
  heavy: () => {
    if (navigator.vibrate) navigator.vibrate(20);
  },
};

export const useChatComposerController = ({
  isLoading,
  replyMessage,
  onSend,
  onCancelReply,
  onVoiceSent,
  onVoiceCancelled,
}: UseChatComposerControllerOptions) => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<ComposerMode>('text');
  const [activePanel, setActivePanel] = useState<ComposerPanel>('none');
  const [isRecording, setIsRecording] = useState(false);
  const [cancelVoice, setCancelVoice] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const startYRef = useRef<number>(0);

  const closePanel = useCallback((focus = false) => {
    setActivePanel('none');
    if (focus) {
      window.setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, []);

  const handleSend = useCallback(() => {
    if (!input.trim() || isLoading) return false;

    Haptic.success();
    onSend(input, replyMessage || undefined);
    setInput('');
    closePanel();

    if (replyMessage) {
      onCancelReply();
    }

    window.setTimeout(() => textareaRef.current?.focus(), 50);
    return true;
  }, [input, isLoading, onSend, replyMessage, onCancelReply, closePanel]);

  const handleEmojiSelect = useCallback((emoji: string) => {
    setInput((prev) => prev + emoji);
    Haptic.selection();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const togglePanel = useCallback((panel: Exclude<ComposerPanel, 'none'>) => {
    setMode('text');
    setIsRecording(false);
    setCancelVoice(false);

    setActivePanel((prev) => {
      const next = prev === panel ? 'none' : panel;
      if (next === 'none') {
        window.setTimeout(() => textareaRef.current?.focus(), 100);
      } else {
        textareaRef.current?.blur();
      }
      return next;
    });

    Haptic.selection();
  }, []);

  const toggleMode = useCallback(() => {
    Haptic.selection();
    const nextMode: ComposerMode = mode === 'text' ? 'voice' : 'text';
    setMode(nextMode);
    closePanel();
    setIsRecording(false);
    setCancelVoice(false);
    return nextMode;
  }, [mode, closePanel]);

  const startVoiceRecording = useCallback(
    (clientY: number) => {
      closePanel();
      setIsRecording(true);
      setCancelVoice(false);
      Haptic.heavy();
      startYRef.current = clientY;
    },
    [closePanel]
  );

  const moveVoiceRecording = useCallback(
    (clientY: number) => {
      if (!isRecording) return;

      const diff = startYRef.current - clientY;
      const shouldCancel = diff > 80;
      if (shouldCancel !== cancelVoice) {
        Haptic.selection();
        setCancelVoice(shouldCancel);
      }
    },
    [isRecording, cancelVoice]
  );

  const endVoiceRecording = useCallback(() => {
    if (!isRecording) return false;

    const shouldSend = !cancelVoice;
    setIsRecording(false);
    setCancelVoice(false);

    if (shouldSend) {
      Haptic.success();
      onVoiceSent?.();
    } else {
      onVoiceCancelled?.();
    }

    return shouldSend;
  }, [isRecording, cancelVoice, onVoiceSent, onVoiceCancelled]);

  const handleVoiceStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (!touch) return;
      startVoiceRecording(touch.clientY);
    },
    [startVoiceRecording]
  );

  const handleVoiceMove = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      moveVoiceRecording(touch.clientY);
    },
    [moveVoiceRecording]
  );

  const handleVoiceEnd = endVoiceRecording;

  const handleTextFocus = useCallback(() => {
    closePanel();
  }, [closePanel]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (activePanel === 'none') return;

      const target = e.target as HTMLElement;
      if (!target.closest('.chat-input-panel') && !target.closest('.chat-input-bar')) {
        closePanel();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activePanel, closePanel]);

  useEffect(() => {
    if (activePanel === 'action' && input.trim()) {
      closePanel(false);
    }
  }, [activePanel, input, closePanel]);

  return {
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
    handleVoiceStart,
    handleVoiceMove,
    handleVoiceEnd,
    handleTextFocus,
  };
};
