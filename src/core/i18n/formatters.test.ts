import { describe, expect, it } from 'vitest';
import { formatDate, formatDateTime, formatNumber, formatTime } from './formatters';

describe('formatters', () => {
  const value = new Date('2026-03-17T08:09:10.000Z');

  it('formats date and time with the active locale', () => {
    const zhDate = formatDate(value, 'zh-CN', { timeZone: 'UTC' });
    const enDate = formatDate(value, 'en-US', { timeZone: 'UTC' });
    const zhTime = formatTime(value, 'zh-CN', { timeZone: 'UTC' });
    const enTime = formatTime(value, 'en-US', { timeZone: 'UTC' });

    expect(zhDate).not.toBe(enDate);
    expect(zhTime).not.toBe(enTime);
  });

  it('formats date time and numbers with the active locale', () => {
    const zhDateTime = formatDateTime(value, 'zh-CN', { timeZone: 'UTC' });
    const enDateTime = formatDateTime(value, 'en-US', { timeZone: 'UTC' });
    const zhNumber = formatNumber(1234567.89, 'zh-CN');
    const enNumber = formatNumber(1234567.89, 'en-US');

    expect(zhDateTime).not.toBe(enDateTime);
    expect(zhNumber).toBe('1,234,567.89');
    expect(enNumber).toBe('1,234,567.89');
  });
});
