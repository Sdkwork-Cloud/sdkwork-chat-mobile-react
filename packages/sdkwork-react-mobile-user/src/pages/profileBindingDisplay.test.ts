import { describe, expect, it } from 'vitest';
import {
  formatEmailBindingValue,
  formatPhoneBindingValue,
  toBindingStatusLabel,
} from './profileBindingDisplay';

describe('profileBindingDisplay', () => {
  it('masks phone number when bound', () => {
    expect(formatPhoneBindingValue('13812345678')).toBe('138****5678');
  });

  it('returns unbound fallback when phone is empty', () => {
    expect(formatPhoneBindingValue('')).toBe('--');
    expect(formatPhoneBindingValue(undefined)).toBe('--');
  });

  it('masks email address when bound', () => {
    expect(formatEmailBindingValue('openchat@example.com')).toBe('op***t@example.com');
  });

  it('keeps email prefix visible for short usernames', () => {
    expect(formatEmailBindingValue('ab@example.com')).toBe('a***b@example.com');
  });

  it('maps binding status label from value presence', () => {
    expect(toBindingStatusLabel('foo@bar.com', 'Bound', 'Not bound')).toBe('Bound');
    expect(toBindingStatusLabel(' ', 'Bound', 'Not bound')).toBe('Not bound');
    expect(toBindingStatusLabel(undefined, 'Bound', 'Not bound')).toBe('Not bound');
  });
});

