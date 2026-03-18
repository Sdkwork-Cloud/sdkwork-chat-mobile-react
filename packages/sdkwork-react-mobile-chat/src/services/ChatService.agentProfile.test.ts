import { describe, expect, it } from 'vitest';
import { createChatService } from './ChatService';

describe('ChatService agent profile integration', () => {
  it('keeps external agent identity instead of collapsing to the default assistant', async () => {
    const service = createChatService({
      clock: { now: () => 1_710_000_000_000 },
      idGenerator: { next: (prefix?: string) => `${prefix || 'id'}_fixed` },
    });

    const result = await service.createSession('character_42', {
      name: 'Data Analyst',
      description: 'Specialized in metrics review.',
      avatar: 'https://example.com/agent.png',
      behaviorId: 'agent_coder',
      sdkModelId: 'gpt-4.1',
    });

    expect(result.success).toBe(true);
    expect(result.data?.agentId).toBe('character_42');
    expect(result.data?.agentProfile).toEqual(
      expect.objectContaining({
        id: 'character_42',
        name: 'Data Analyst',
        description: 'Specialized in metrics review.',
        behaviorId: 'agent_coder',
        sdkModelId: 'gpt-4.1',
      }),
    );
    expect(result.data?.messages[0]?.content).toContain('bug');
  });

  it('can create multiple independent sessions for the same agent when reuseExisting is disabled', async () => {
    let now = 1_710_000_000_000;
    let counter = 0;
    const service = createChatService({
      clock: { now: () => now++ },
      idGenerator: {
        next: (prefix?: string) => `${prefix || 'id'}_${++counter}`,
      },
    });

    const first = await service.createSession('agent_coder', undefined, { reuseExisting: false });
    const second = await service.createSession('agent_coder', undefined, { reuseExisting: false });
    const list = await service.getSessionList();

    expect(first.success).toBe(true);
    expect(second.success).toBe(true);
    expect(first.data?.id).not.toBe(second.data?.id);
    expect(list.data?.filter((session) => session.agentId === 'agent_coder')).toHaveLength(2);
  });

  it('assigns distinct thread titles and reuses the most recent session for the same agent', async () => {
    let now = 1_710_000_000_000;
    let counter = 0;
    const service = createChatService({
      clock: { now: () => now++ },
      idGenerator: {
        next: (prefix?: string) => `${prefix || 'id'}_${++counter}`,
      },
    });

    const first = await service.createSession('agent_coder', undefined, { reuseExisting: false });
    const second = await service.createSession('agent_coder', undefined, { reuseExisting: false });
    const reopened = await service.createSession('agent_coder');

    expect(first.success).toBe(true);
    expect(second.success).toBe(true);
    expect(first.data?.title).toBe('Coding Expert');
    expect(second.data?.title).toBe('Coding Expert #2');
    expect(reopened.success).toBe(true);
    expect(reopened.data?.id).toBe(second.data?.id);
    expect(reopened.data?.title).toBe('Coding Expert #2');
  });
});
