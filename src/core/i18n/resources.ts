import { DEFAULT_LOCALE, type Locale } from './config';
import { buildTranslationResources } from './resourceBuilder';

export const resources = buildTranslationResources();

const resolveNestedValue = (source: unknown, path: string): string | undefined => {
  if (!source || typeof source !== 'object' || !path) {
    return undefined;
  }

  const segments = path.split('.').filter(Boolean);
  if (segments.length === 0) {
    return undefined;
  }

  let cursor: unknown = source;
  for (const segment of segments) {
    if (!cursor || typeof cursor !== 'object' || !(segment in (cursor as Record<string, unknown>))) {
      return undefined;
    }
    cursor = (cursor as Record<string, unknown>)[segment];
  }

  return typeof cursor === 'string' ? cursor : undefined;
};

export const getTranslationValue = (locale: Locale, key: string): string | undefined => {
  const dictionary =
    (resources[locale]?.translation as Record<string, unknown> | undefined) ||
    (resources[DEFAULT_LOCALE]?.translation as Record<string, unknown> | undefined);

  if (!dictionary || !key) {
    return undefined;
  }

  const normalizedKey = key.replace(/:/g, '.');
  const paths = new Set<string>([key, normalizedKey]);
  const segments = normalizedKey.split('.').filter(Boolean);

  if (segments.length > 1 && segments[0] === segments[1]) {
    paths.add(segments.slice(1).join('.'));
  }

  for (const path of paths) {
    const direct = dictionary[path];
    if (typeof direct === 'string') {
      return direct;
    }

    const nested = resolveNestedValue(dictionary, path);
    if (nested) {
      return nested;
    }
  }

  return undefined;
};
