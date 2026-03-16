const CJK_PATTERN = /[\u3400-\u9fff]/u;
const REPLACEMENT_CHAR_PATTERN = /\uFFFD/u;
const MOJIBAKE_LATIN1_PATTERN = /[\u00C2\u00C3\u00C5-\u00C9\u00D0\u00D1\u00E0-\u00EF\u00F0-\u00FF]/g;

export interface ResolveSettingsTranslationOptions {
  appT?: (key: string) => string;
  settingsT?: (key: string) => string;
  key: string;
  fallback: string;
}

export const isProbablyMojibake = (value: string): boolean => {
  const normalized = value.trim();
  if (!normalized) return false;
  if (REPLACEMENT_CHAR_PATTERN.test(normalized)) return true;
  if (CJK_PATTERN.test(normalized)) return false;
  const latin1Hits = normalized.match(MOJIBAKE_LATIN1_PATTERN)?.length ?? 0;
  return latin1Hits >= 2;
};

export const resolveSettingsTranslation = ({
  appT,
  settingsT,
  key,
  fallback,
}: ResolveSettingsTranslationOptions): string => {
  const appValue = appT?.(key);
  if (appValue && appValue !== key && !isProbablyMojibake(appValue)) {
    return appValue;
  }

  const settingsValue = settingsT?.(key);
  if (settingsValue && settingsValue !== key) {
    return settingsValue;
  }

  if (appValue && appValue !== key) {
    return appValue;
  }

  return fallback;
};
