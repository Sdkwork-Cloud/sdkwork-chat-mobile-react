import type { Locale } from './config';

const toDate = (value: Date | number | string) => (value instanceof Date ? value : new Date(value));

export const formatDate = (
  value: Date | number | string,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions
): string => new Intl.DateTimeFormat(locale, options).format(toDate(value));

export const formatTime = (
  value: Date | number | string,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions
): string =>
  new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }).format(toDate(value));

export const formatDateTime = (
  value: Date | number | string,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions
): string =>
  new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }).format(toDate(value));

export const formatNumber = (
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions
): string => new Intl.NumberFormat(locale, options).format(value);
