import { describe, expect, it } from 'vitest';
import { resolveChatBackground } from './chatBackgroundResolver';

describe('resolveChatBackground', () => {
  it('prefers session background when both session and global values exist', () => {
    const value = resolveChatBackground({
      sessionBackground: 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)',
      globalBackground: '#f5f5f5',
    });

    expect(value).toBe('linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)');
  });

  it('falls back to global background when session background is empty', () => {
    const value = resolveChatBackground({
      sessionBackground: '',
      globalBackground: '#f5f5f5',
    });

    expect(value).toBe('#f5f5f5');
  });

  it('returns empty value when both session and global backgrounds are empty', () => {
    const value = resolveChatBackground({
      sessionBackground: '   ',
      globalBackground: '  ',
    });

    expect(value).toBe('');
  });
});
