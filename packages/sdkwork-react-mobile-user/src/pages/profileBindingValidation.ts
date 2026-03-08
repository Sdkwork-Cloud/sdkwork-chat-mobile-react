export type BindingValidationField = 'email' | 'phone' | 'wechat' | 'qq';

export interface BindingValidationDraft {
  field: BindingValidationField;
  account: string;
  verifyCode: string;
  authCode: string;
  thirdPartyUserId: string;
}

export interface BindingValidationMessages {
  emailRequired: string;
  emailInvalid: string;
  phoneRequired: string;
  phoneInvalid: string;
  socialRequired: string;
}

export interface BindingValidationResult {
  valid: boolean;
  message?: string;
  normalizedAccount: string;
  normalizedVerifyCode: string;
  normalizedAuthCode: string;
  normalizedThirdPartyUserId: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CN_MOBILE_PATTERN = /^1[3-9]\d{9}$/;

const trim = (value: string): string => value.trim();

export function normalizePhoneInput(value: string): string {
  const compact = trim(value).replace(/[\s-]/g, '');
  if (compact.startsWith('+86')) {
    return compact.slice(3);
  }
  if (compact.startsWith('86') && compact.length === 13) {
    return compact.slice(2);
  }
  return compact;
}

export function isValidEmailInput(value: string): boolean {
  return EMAIL_PATTERN.test(trim(value));
}

export function isValidPhoneInput(value: string): boolean {
  return CN_MOBILE_PATTERN.test(normalizePhoneInput(value));
}

export function validateBindingDraft(
  draft: BindingValidationDraft,
  messages: BindingValidationMessages
): BindingValidationResult {
  const normalizedVerifyCode = trim(draft.verifyCode);
  const normalizedAuthCode = trim(draft.authCode);
  const normalizedThirdPartyUserId = trim(draft.thirdPartyUserId);

  if (draft.field === 'email') {
    const normalizedAccount = trim(draft.account).toLowerCase();
    if (!normalizedAccount) {
      return {
        valid: false,
        message: messages.emailRequired,
        normalizedAccount,
        normalizedVerifyCode,
        normalizedAuthCode,
        normalizedThirdPartyUserId,
      };
    }
    if (!isValidEmailInput(normalizedAccount)) {
      return {
        valid: false,
        message: messages.emailInvalid,
        normalizedAccount,
        normalizedVerifyCode,
        normalizedAuthCode,
        normalizedThirdPartyUserId,
      };
    }
    return {
      valid: true,
      normalizedAccount,
      normalizedVerifyCode,
      normalizedAuthCode,
      normalizedThirdPartyUserId,
    };
  }

  if (draft.field === 'phone') {
    const normalizedAccount = normalizePhoneInput(draft.account);
    if (!normalizedAccount) {
      return {
        valid: false,
        message: messages.phoneRequired,
        normalizedAccount,
        normalizedVerifyCode,
        normalizedAuthCode,
        normalizedThirdPartyUserId,
      };
    }
    if (!isValidPhoneInput(normalizedAccount)) {
      return {
        valid: false,
        message: messages.phoneInvalid,
        normalizedAccount,
        normalizedVerifyCode,
        normalizedAuthCode,
        normalizedThirdPartyUserId,
      };
    }
    return {
      valid: true,
      normalizedAccount,
      normalizedVerifyCode,
      normalizedAuthCode,
      normalizedThirdPartyUserId,
    };
  }

  if (!normalizedAuthCode && !normalizedThirdPartyUserId) {
    return {
      valid: false,
      message: messages.socialRequired,
      normalizedAccount: trim(draft.account),
      normalizedVerifyCode,
      normalizedAuthCode,
      normalizedThirdPartyUserId,
    };
  }

  return {
    valid: true,
    normalizedAccount: trim(draft.account),
    normalizedVerifyCode,
    normalizedAuthCode,
    normalizedThirdPartyUserId,
  };
}

