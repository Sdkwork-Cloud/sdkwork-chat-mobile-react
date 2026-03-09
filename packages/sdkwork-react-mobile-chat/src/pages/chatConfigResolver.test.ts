import { describe, expect, it } from 'vitest';
import { resolveChatConfig } from './chatConfigResolver';

describe('resolveChatConfig', () => {
  it('returns safe defaults when session is undefined', () => {
    const config = resolveChatConfig(undefined);
    expect(config.showUserAvatar).toBe(false);
    expect(config.showModelAvatar).toBe(false);
  });

  it('reads avatar switch from session config when present', () => {
    const config = resolveChatConfig({
      sessionConfig: { showAvatar: true },
    });
    expect(config.showUserAvatar).toBe(true);
    expect(config.showModelAvatar).toBe(true);
  });
});
