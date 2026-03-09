import type { ChatConfig, ChatSession } from '../types';

type ChatSessionLike = Pick<ChatSession, 'sessionConfig'> | undefined;

export const resolveChatConfig = (session: ChatSessionLike): ChatConfig => {
  const showAvatar = session?.sessionConfig?.showAvatar ?? false;
  return {
    showUserAvatar: showAvatar,
    showModelAvatar: showAvatar,
  };
};
