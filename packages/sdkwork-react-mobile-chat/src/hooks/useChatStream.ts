import { useState, useCallback, useRef, useEffect } from 'react';
import { Toast } from '@sdkwork/react-mobile-commons';
import { useChatStoreActions } from '../stores/chatStore';
import { chatService } from '../services/ChatService';
import {
  chatConversationService,
  type ChatConversationImage,
  type ChatConversationReplyTo,
} from '../services/ChatConversationService';
import type { ChatSession } from '../types';
import type { Agent } from '../config/agentRegistry';

const MAX_HISTORY_MESSAGES = 20;

export const useChatStream = () => {
  const { addMessage, updateMessage } = useChatStoreActions();
  const [isLoading, setIsLoading] = useState(false);

  const processingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const pendingUpdateRef = useRef<{ sessionId: string; msgId: string; content: string } | null>(null);
  const lastTickRef = useRef<number>(0);
  const lastRenderRef = useRef<number>(0);

  const processUpdates = useCallback(() => {
    const now = Date.now();
    if (pendingUpdateRef.current && now - lastRenderRef.current > 48) {
      const { sessionId, msgId, content } = pendingUpdateRef.current;
      updateMessage(sessionId, msgId, { content, isStreaming: true });
      lastRenderRef.current = now;

      if (now - lastTickRef.current > 100) {
        lastTickRef.current = now;
      }

      pendingUpdateRef.current = null;
    }
    rafIdRef.current = requestAnimationFrame(processUpdates);
  }, [updateMessage]);

  useEffect(() => {
    if (isLoading) {
      if (!rafIdRef.current) {
        rafIdRef.current = requestAnimationFrame(processUpdates);
      }
    } else if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [isLoading, processUpdates]);

  const sendMessage = useCallback(
    async (
      text: string,
      session: ChatSession,
      agent: Agent,
      replyTo?: ChatConversationReplyTo,
      images?: ChatConversationImage[],
    ) => {
      if ((!text.trim() && (!images || images.length === 0)) || !session || !agent || processingRef.current) {
        return;
      }

      processingRef.current = true;
      setIsLoading(true);
      abortControllerRef.current = new AbortController();

      chatService.emitStatusChange({ status: 'loading', message: 'AI thinking...' });

      const userMsgId = Date.now().toString();
      const modelMsgId = (Date.now() + 1).toString();

      try {
        let userContent = text;
        if (images && images.length > 0 && !text) {
          userContent = `data:${images[0].mimeType};base64,${images[0].data}`;
        }

        await addMessage(session.id, {
          id: userMsgId,
          role: 'user',
          content: userContent,
          createTime: Date.now(),
          status: 'sending',
          replyTo,
        });

        setTimeout(() => {
          updateMessage(session.id, userMsgId, { status: 'sent' });
        }, 500);

        await addMessage(session.id, {
          id: modelMsgId,
          role: 'model',
          content: 'Thinking...',
          createTime: Date.now(),
          isStreaming: true,
          status: 'sending',
        });

        const history = session.messages
          .filter((m) => m.id !== userMsgId && m.id !== modelMsgId && m.role !== 'system')
          .slice(-MAX_HISTORY_MESSAGES)
          .map((m) => ({ role: m.role as 'user' | 'model', content: m.content }));

        const promptToSend = chatConversationService.buildPrompt(text, replyTo, images);
        const stream = chatConversationService.streamReply({
          sessionId: session.id,
          history,
          prompt: promptToSend,
          agent,
          images,
        });

        let fullText = '';
        let isFirstChunk = true;

        for await (const chunk of stream) {
          if (abortControllerRef.current?.signal.aborted) break;

          if (isFirstChunk) {
            fullText = '';
            isFirstChunk = false;
            updateMessage(session.id, modelMsgId, { status: 'sent' });
          }

          fullText += chunk;
          pendingUpdateRef.current = {
            sessionId: session.id,
            msgId: modelMsgId,
            content: fullText,
          };
        }

        if (!abortControllerRef.current?.signal.aborted) {
          const finalContent = fullText || 'Sorry, I could not generate valid content. Please try again.';
          updateMessage(session.id, modelMsgId, { content: finalContent, isStreaming: false, status: 'sent' });
          chatService.emitStatusChange({ status: 'idle' });
        }
      } catch (error) {
        console.error('[ChatStream] Error:', error);
        Toast.error('Send failed. Please retry.');
        updateMessage(session.id, modelMsgId, { isStreaming: false, status: 'error' });
        chatService.emitStatusChange({ status: 'error', message: 'Failed' });
      } finally {
        setIsLoading(false);
        processingRef.current = false;
        pendingUpdateRef.current = null;
        abortControllerRef.current = null;
      }
    },
    [addMessage, updateMessage],
  );

  return { sendMessage, isLoading };
};

