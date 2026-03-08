import { describe, expect, it } from 'vitest';
import { formatMomentRelativeTime } from './momentTime';

describe('formatMomentRelativeTime', () => {
  it('returns "Just now" within one minute', () => {
    const now = 1_000_000;
    expect(formatMomentRelativeTime(now - 30_000, now)).toBe('Just now');
  });

  it('returns minute granularity within one hour', () => {
    const now = 1_000_000;
    expect(formatMomentRelativeTime(now - 5 * 60_000, now)).toBe('5 min ago');
  });

  it('returns day granularity after one day', () => {
    const now = 1_000_000;
    expect(formatMomentRelativeTime(now - 2 * 24 * 60 * 60_000, now)).toBe('2 d ago');
  });
});
