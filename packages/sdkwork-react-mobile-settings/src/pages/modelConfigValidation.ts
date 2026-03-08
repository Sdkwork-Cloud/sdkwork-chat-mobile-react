export type ModelProviderMode = 'cloud' | 'local';

export interface ModelConfigValidationInput {
  enabled: boolean;
  mode: ModelProviderMode;
  apiKey?: string;
  endpoint?: string;
}

export type ModelConfigValidationResult =
  | { ok: true }
  | { ok: false; reason: 'missing-api-key' | 'missing-endpoint' };

export const validateModelConfigInput = (
  input: ModelConfigValidationInput
): ModelConfigValidationResult => {
  if (!input.enabled) return { ok: true };

  if (input.mode === 'cloud') {
    if (!(input.apiKey || '').trim()) {
      return { ok: false, reason: 'missing-api-key' };
    }
    return { ok: true };
  }

  if (!(input.endpoint || '').trim()) {
    return { ok: false, reason: 'missing-endpoint' };
  }
  return { ok: true };
};
