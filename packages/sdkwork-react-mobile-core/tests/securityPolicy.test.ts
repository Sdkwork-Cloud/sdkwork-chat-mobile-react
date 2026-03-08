import { describe, expect, it } from 'vitest';
import { isSensitiveStorageKey, resolveBiometricRequirement } from '../src/platform/securityPolicy';

describe('security policy', () => {
  it('detects sensitive storage key patterns', () => {
    expect(isSensitiveStorageKey('sdkwork_token')).toBe(true);
    expect(isSensitiveStorageKey('user_secret_key')).toBe(true);
    expect(isSensitiveStorageKey(' password_hint ')).toBe(true);
    expect(isSensitiveStorageKey('profile_name')).toBe(false);
    expect(isSensitiveStorageKey('   ')).toBe(false);
  });

  it('resolves biometric requirement from metadata', () => {
    expect(resolveBiometricRequirement()).toEqual({ required: false });
    expect(resolveBiometricRequirement({ requireBiometric: false })).toEqual({ required: false });
    expect(
      resolveBiometricRequirement({ requireBiometric: true, biometricReason: 'Confirm payment' }),
    ).toEqual({
      required: true,
      reason: 'Confirm payment',
    });
    expect(resolveBiometricRequirement({ requireBiometric: true, biometricReason: '   ' })).toEqual({
      required: true,
      reason: undefined,
    });
  });
});
