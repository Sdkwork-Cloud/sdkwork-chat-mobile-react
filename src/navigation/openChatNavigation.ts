import { chatService, DEFAULT_AGENT_ID } from '@sdkwork/react-mobile-chat';
import { navigate } from '../router';
import { ROUTE_PATHS } from '../router/paths';

export const openOmniChat = async () => {
  const result = await chatService.createSession(DEFAULT_AGENT_ID);
  const sessionId = result.data?.id;

  if (result.success && sessionId) {
    navigate(ROUTE_PATHS.chat, { id: sessionId });
    return;
  }

  navigate(ROUTE_PATHS.conversationList);
};
