import { describe, expect, it } from 'vitest';
import { DEFAULT_AGENT_ID, resolveAgentProfile } from './agentRegistry';

describe('resolveAgentProfile', () => {
  it('returns a stable built-in profile when no override is provided', () => {
    const profile = resolveAgentProfile(DEFAULT_AGENT_ID);

    expect(profile.id).toBe(DEFAULT_AGENT_ID);
    expect(profile.behaviorId).toBe(DEFAULT_AGENT_ID);
    expect(profile.name).toBe('OpenChat Assistant');
    expect(profile.initialMessage.length).toBeGreaterThan(0);
    expect(profile.systemInstruction.length).toBeGreaterThan(0);
  });

  it('preserves external agent identity while inheriting fallback behavior', () => {
    const profile = resolveAgentProfile('character_42', {
      name: 'Data Analyst',
      avatar: 'https://example.com/agent.png',
      description: 'Specialized in dashboards and BI.',
      behaviorId: 'agent_coder',
      sdkModelId: 'gpt-4.1',
    });

    expect(profile.id).toBe('character_42');
    expect(profile.behaviorId).toBe('agent_coder');
    expect(profile.sdkModelId).toBe('gpt-4.1');
    expect(profile.name).toBe('Data Analyst');
    expect(profile.avatar).toBe('https://example.com/agent.png');
    expect(profile.description).toBe('Specialized in dashboards and BI.');
    expect(profile.initialMessage).toContain('bug');
    expect(profile.systemInstruction).toContain('senior engineer');
  });
});
