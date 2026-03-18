import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Agent } from '../config/agentRegistry';

const createSession = vi.fn();
const sendMessage = vi.fn();
const getClient = vi.fn(async () => ({
  chat: {
    createSession,
    sendMessage,
  },
}));

vi.mock('@sdkwork/react-mobile-core', () => ({
  APP_SDK_AUTH_TOKEN_STORAGE_KEY: 'auth_token',
  createAppSdkCoreConfig: () => ({ baseUrl: 'https://example.com' }),
  getAppSdkCoreClientWithSession: getClient,
  resolveServiceFactoryRuntimeDeps: (deps?: Record<string, unknown>) => ({
    storage: deps?.storage ?? {},
    logger: deps?.logger ?? { warn: vi.fn() },
  }),
}));

describe('ChatSdkService', () => {
  beforeEach(() => {
    createSession.mockReset();
    sendMessage.mockReset();
    getClient.mockClear();
  });

  it('passes model and system prompt into remote session and message requests', async () => {
    createSession.mockResolvedValue({
      code: '2000',
      msg: 'ok',
      data: { id: 'remote-session-1' },
    });
    sendMessage.mockResolvedValue({
      code: '2000',
      msg: 'ok',
      data: { content: 'Remote reply' },
    });

    const { createChatSdkService } = await import('./ChatSdkService');
    const service = createChatSdkService({
      logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
      },
    });

    const agent: Agent = {
      id: 'external_agent_1',
      behaviorId: 'agent_coder',
      sdkModelId: 'gpt-4.1',
      name: 'Code Expert Pro',
      avatar: 'https://example.com/avatar.png',
      description: 'Helps with production debugging.',
      initialMessage: 'How can I help?',
      systemInstruction: 'Act like a rigorous senior debugging engineer.',
      tags: ['coding'],
    };

    const reply = await service.requestReply({
      localSessionId: 'session_local_1',
      prompt: 'Help me debug this race condition',
      agent,
    });

    expect(reply).toEqual({
      content: 'Remote reply',
      remoteSessionId: 'remote-session-1',
    });
    expect(createSession).toHaveBeenCalledWith({
      name: 'Code Expert Pro',
      type: 'chat',
      description: 'Helps with production debugging.',
      modelId: 'gpt-4.1',
      systemPrompt: 'Act like a rigorous senior debugging engineer.',
    });
    expect(sendMessage).toHaveBeenCalledWith('remote-session-1', {
      content: 'Help me debug this race condition',
      type: 'text',
      format: 'markdown',
      systemPrompt: 'Act like a rigorous senior debugging engineer.',
      modelId: 'gpt-4.1',
    });
  });
});
