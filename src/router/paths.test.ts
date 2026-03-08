import { describe, expect, it } from 'vitest';
import { ROUTE_PATHS, ROUTE_PREFIXES } from './paths';

describe('ROUTE_PATHS', () => {
  it('keeps route path values unique to avoid ambiguous routing contracts', () => {
    const values = Object.values(ROUTE_PATHS);
    const uniqueValues = new Set(values);

    expect(uniqueValues.size).toBe(values.length);
  });

  it('uses normalized absolute paths without trailing slash', () => {
    const values = Object.values(ROUTE_PATHS);

    for (const value of values) {
      expect(value.startsWith('/')).toBe(true);
      if (value !== '/') {
        expect(value.endsWith('/')).toBe(false);
      }
    }
  });
});

describe('ROUTE_PREFIXES', () => {
  it('uses absolute prefixes that can be safely matched by startsWith', () => {
    const values = Object.values(ROUTE_PREFIXES);

    for (const value of values) {
      expect(value.startsWith('/')).toBe(true);
      expect(value.endsWith('/')).toBe(false);
    }
  });
});
