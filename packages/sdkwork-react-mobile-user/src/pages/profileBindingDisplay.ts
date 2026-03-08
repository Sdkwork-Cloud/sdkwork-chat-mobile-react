const PHONE_MASK_REPLACEMENT = '****';
const EMAIL_MASK_REPLACEMENT = '***';

const trimValue = (value?: string): string => (value || '').trim();

export function formatPhoneBindingValue(phone?: string): string {
  const normalized = trimValue(phone);
  if (!normalized) {
    return '--';
  }
  if (normalized.length < 7) {
    return normalized;
  }
  const start = normalized.slice(0, 3);
  const end = normalized.slice(-4);
  return `${start}${PHONE_MASK_REPLACEMENT}${end}`;
}

export function formatEmailBindingValue(email?: string): string {
  const normalized = trimValue(email);
  if (!normalized) {
    return '--';
  }

  const atIndex = normalized.indexOf('@');
  if (atIndex <= 0 || atIndex === normalized.length - 1) {
    return normalized;
  }

  const name = normalized.slice(0, atIndex);
  const domain = normalized.slice(atIndex + 1);

  if (name.length <= 2) {
    return `${name.slice(0, 1)}${EMAIL_MASK_REPLACEMENT}${name.slice(-1)}@${domain}`;
  }

  return `${name.slice(0, 2)}${EMAIL_MASK_REPLACEMENT}${name.slice(-1)}@${domain}`;
}

export function toBindingStatusLabel(value: string | undefined, boundLabel: string, unboundLabel: string): string {
  return trimValue(value) ? boundLabel : unboundLabel;
}

