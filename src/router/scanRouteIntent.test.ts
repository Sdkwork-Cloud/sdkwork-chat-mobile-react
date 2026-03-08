import { describe, expect, it } from 'vitest';
import { resolveScanRouteIntent } from './scanRouteIntent';

describe('resolveScanRouteIntent', () => {
  it('parses sdkwork scheme qr payload for user', () => {
    const intent = resolveScanRouteIntent('sdkwork://qr/entity?type=user&id=u_1001&name=Alice');
    expect(intent.type).toBe('user');
    expect(intent.id).toBe('u_1001');
    expect(intent.name).toBe('Alice');
  });

  it('parses https qr payload for group from path and query', () => {
    const intent = resolveScanRouteIntent('https://sdkwork.ai/qr/group?id=g_core&name=SDKWORK-Core');
    expect(intent.type).toBe('group');
    expect(intent.id).toBe('g_core');
    expect(intent.name).toBe('SDKWORK-Core');
  });

  it('parses json payload for agent', () => {
    const intent = resolveScanRouteIntent('{\"type\":\"agent\",\"id\":\"omni_core\",\"name\":\"Omni Core\"}');
    expect(intent.type).toBe('agent');
    expect(intent.id).toBe('omni_core');
    expect(intent.name).toBe('Omni Core');
  });

  it('returns unknown for unsupported payload', () => {
    const intent = resolveScanRouteIntent('https://example.com/random-content');
    expect(intent.type).toBe('unknown');
    expect(intent.raw).toBe('https://example.com/random-content');
  });
});

