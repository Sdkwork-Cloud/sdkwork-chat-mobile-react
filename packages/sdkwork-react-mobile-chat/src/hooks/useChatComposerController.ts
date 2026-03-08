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
  onRequestFocusText?: () => void;
  onRequestBlurText?: () => void;
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
  onRequestFocusText,
  onRequestBlurText,
}: UseChatComposerControllerOptions) => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<ComposerMode>('text');
  const [activePanel, setActivePanel] = useState<ComposerPanel>('none');
  const [isRecording, setIsRecording] = useState(false);
  const [cancelVoice, setCancelVoice] = useState(false);

  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const startYRef = useRef<number>(0);
  const requestFocus = useCallback(() => {
    onRequestFocusText?.();
    if (!onRequestFocusText) {
      textInputRef.current?.focus();
    }
  }, [onRequestFocusText]);
  const requestBlur = useCallback(() => {
    onRequestBlurText?.();
    if (!onRequestBlurText) {
      textInputRef.current?.blur();
    }
  }, [onRequestBlurText]);

  const closePanel = useCallback((focus = false) => {
    setActivePanel('none');
    if (focus) {
      window.setTimeout(() => requestFocus(), 100);
    }
  }, [requestFocus]);

  const handleSend = useCallback(() => {
    if (!input.trim() || isLoading) return false;

    Haptic.success();
    onSend(input, replyMessage || undefined);
    setInput('');
    closePanel();

    if (replyMessage) {
      onCancelReply();
    }

    window.setTimeout(() => requestFocus(), 50);
    return true;
  }, [input, isLoading, onSend, replyMessage, onCancelReply, closePanel, requestFocus]);

  const togglePanel = useCallback((panel: Exclude<ComposerPanel, 'none'>) => {
    setMode('text');
    setIsRecording(false);
    setCancelVoice(false);

    setActivePanel((prev) => {
      const next = prev === panel ? 'none' : panel;
      if (next === 'none') {
        window.setTimeout(() => requestFocus(), 100);
      } else {
        requestBlur();
      }
      return next;
    });

    Haptic.selection();
  }, [requestBlur, requestFocus]);

  const toggleMode = useCallback(() => {
    Haptic.selection();
    const nextMode: ComposerMode = mode === 'text' ? 'voice' : 'text';
    setMode(nextMode);
    closePanel();
    if (nextMode === 'voice') {
      requestBlur();
    }
    setIsRecording(false);
    setCancelVoice(false);
    return nextMode;
  }, [closePanel, mode, requestBlur]);

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
    handleSend,
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
