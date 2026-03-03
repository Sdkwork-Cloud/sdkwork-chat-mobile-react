import { chatService, DEFAULT_AGENT_ID } from '@sdkwork/react-mobile-chat';
import { navigate } from '../router';

export const openOmniChat = async () => {
  const result = await chatService.createSession(DEFAULT_AGENT_ID);
  const sessionId = result.data?.id;

  if (result.success && sessionId) {
    navigate('/chat', { id: sessionId });
    return;
  }

  navigate('/conversation-list');
};
