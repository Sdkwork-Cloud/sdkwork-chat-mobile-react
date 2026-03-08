import { describe, expect, it } from 'vitest';
import { validateModelConfigInput } from './modelConfigValidation';

describe('validateModelConfigInput', () => {
  it('passes when model service is disabled', () => {
    expect(
      validateModelConfigInput({
        enabled: false,
        mode: 'cloud',
        apiKey: '',
        endpoint: '',
      })
    ).toEqual({ ok: true });
  });

  it('requires api key in cloud mode', () => {
    expect(
      validateModelConfigInput({
        enabled: true,
        mode: 'cloud',
        apiKey: '   ',
      })
    ).toEqual({ ok: false, reason: 'missing-api-key' });
  });

  it('requires endpoint in local mode', () => {
    expect(
      validateModelConfigInput({
        enabled: true,
        mode: 'local',
        endpoint: '',
      })
    ).toEqual({ ok: false, reason: 'missing-endpoint' });
  });

  it('passes for valid cloud and local inputs', () => {
    expect(
      validateModelConfigInput({
        enabled: true,
        mode: 'cloud',
        apiKey: 'sk-123',
      })
    ).toEqual({ ok: true });
    expect(
      validateModelConfigInput({
        enabled: true,
        mode: 'local',
        endpoint: 'http://localhost:11434',
      })
    ).toEqual({ ok: true });
  });
});
