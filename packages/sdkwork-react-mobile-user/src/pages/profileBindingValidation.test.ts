import { describe, expect, it } from 'vitest';
import {
  isValidEmailInput,
  isValidPhoneInput,
  normalizePhoneInput,
  validateBindingDraft,
} from './profileBindingValidation';

const MESSAGES = {
  emailRequired: 'email required',
  emailInvalid: 'email invalid',
  phoneRequired: 'phone required',
  phoneInvalid: 'phone invalid',
  socialRequired: 'social required',
};

describe('profileBindingValidation', () => {
  it('normalizes common phone input formats', () => {
    expect(normalizePhoneInput('138 1234 5678')).toBe('13812345678');
    expect(normalizePhoneInput('+8613812345678')).toBe('13812345678');
    expect(normalizePhoneInput('86-138-1234-5678')).toBe('13812345678');
  });

  it('validates email format', () => {
    expect(isValidEmailInput('name@example.com')).toBe(true);
    expect(isValidEmailInput('bad@format')).toBe(false);
  });

  it('validates cn mobile phone format', () => {
    expect(isValidPhoneInput('13812345678')).toBe(true);
    expect(isValidPhoneInput('12812345678')).toBe(false);
  });

  it('returns invalid when email is missing or malformed', () => {
    expect(
      validateBindingDraft(
        {
          field: 'email',
          account: '',
          verifyCode: '',
          authCode: '',
          thirdPartyUserId: '',
        },
        MESSAGES
      )
    ).toMatchObject({ valid: false, message: 'email required' });

    expect(
      validateBindingDraft(
        {
          field: 'email',
          account: 'bad-format',
          verifyCode: '',
          authCode: '',
          thirdPartyUserId: '',
        },
        MESSAGES
      )
    ).toMatchObject({ valid: false, message: 'email invalid' });
  });

  it('returns invalid when phone is missing or malformed', () => {
    expect(
      validateBindingDraft(
        {
          field: 'phone',
          account: '',
          verifyCode: '',
          authCode: '',
          thirdPartyUserId: '',
        },
        MESSAGES
      )
    ).toMatchObject({ valid: false, message: 'phone required' });

    expect(
      validateBindingDraft(
        {
          field: 'phone',
          account: '12345',
          verifyCode: '',
          authCode: '',
          thirdPartyUserId: '',
        },
        MESSAGES
      )
    ).toMatchObject({ valid: false, message: 'phone invalid' });
  });

  it('returns invalid for social binding when both auth fields are empty', () => {
    expect(
      validateBindingDraft(
        {
          field: 'wechat',
          account: '',
          verifyCode: '',
          authCode: ' ',
          thirdPartyUserId: '',
        },
        MESSAGES
      )
    ).toMatchObject({ valid: false, message: 'social required' });
  });

  it('returns normalized values when binding draft is valid', () => {
    expect(
      validateBindingDraft(
        {
          field: 'phone',
          account: ' 138 1234 5678 ',
          verifyCode: ' 123456 ',
          authCode: '',
          thirdPartyUserId: '',
        },
        MESSAGES
      )
    ).toMatchObject({
      valid: true,
      normalizedAccount: '13812345678',
      normalizedVerifyCode: '123456',
    });
  });
});

