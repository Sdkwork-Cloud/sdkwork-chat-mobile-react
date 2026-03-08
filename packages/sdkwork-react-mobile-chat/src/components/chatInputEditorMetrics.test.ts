import { describe, expect, it } from 'vitest';
import { resolveChatInputEditorMetrics } from './chatInputEditorMetrics';

describe('resolveChatInputEditorMetrics', () => {
  it('clamps editor height between min and max values', () => {
    expect(resolveChatInputEditorMetrics(10, 24, 136).height).toBe(24);
    expect(resolveChatInputEditorMetrics(40, 24, 136).height).toBe(40);
    expect(resolveChatInputEditorMetrics(260, 24, 136).height).toBe(136);
  });

  it('marks overflow only when content exceeds max height', () => {
    expect(resolveChatInputEditorMetrics(136, 24, 136).overflow).toBe(false);
    expect(resolveChatInputEditorMetrics(137, 24, 136).overflow).toBe(true);
  });
});
