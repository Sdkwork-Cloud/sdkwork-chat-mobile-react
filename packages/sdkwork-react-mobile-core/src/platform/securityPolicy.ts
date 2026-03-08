const SENSITIVE_STORAGE_KEY_HINTS = ['token', 'secret', 'password', 'credential', 'private_key'] as const;

export function isSensitiveStorageKey(key: string): boolean {
  const normalized = key.trim().toLowerCase();
  if (!normalized) return false;
  return SENSITIVE_STORAGE_KEY_HINTS.some((hint) => normalized.includes(hint));
}

export interface BiometricRequirement {
  required: boolean;
  reason?: string;
}

export function resolveBiometricRequirement(metadata?: Record<string, unknown>): BiometricRequirement {
  if (!metadata || metadata.requireBiometric !== true) {
    return { required: false };
  }

  const rawReason = metadata.biometricReason;
  const reason = typeof rawReason === 'string' ? rawReason.trim() : '';
  return {
    required: true,
    reason: reason || undefined,
  };
}
