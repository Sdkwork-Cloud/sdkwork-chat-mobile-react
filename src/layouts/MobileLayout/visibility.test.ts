import { describe, expect, it } from 'vitest';
import { shouldRenderFloatingAssistant } from './visibility';

describe('shouldRenderFloatingAssistant', () => {
  it('returns false when user setting is disabled', () => {
    expect(
      shouldRenderFloatingAssistant({
        pageAllowsFloatingBall: true,
        openAIAssistantEnabled: false,
      })
    ).toBe(false);
  });

  it('returns false when current page disallows floating ball', () => {
    expect(
      shouldRenderFloatingAssistant({
        pageAllowsFloatingBall: false,
        openAIAssistantEnabled: true,
      })
    ).toBe(false);
  });

  it('returns true only when both conditions are true', () => {
    expect(
      shouldRenderFloatingAssistant({
        pageAllowsFloatingBall: true,
        openAIAssistantEnabled: true,
      })
    ).toBe(true);
  });
});
