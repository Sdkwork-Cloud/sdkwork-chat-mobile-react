import {
  ANDROID_CALL_PERMISSION_BASELINE,
  ANDROID_COMMON_PERMISSION_BASELINE,
  ANDROID_FEATURE_LINES,
  ANDROID_PERMISSION_LINES,
  IOS_BACKGROUND_MODES,
  IOS_CALL_PERMISSION_BASELINE,
  IOS_COMMON_PERMISSION_BASELINE,
  IOS_PERMISSION_ENTRIES,
} from './native-permission-baseline.mjs';

const ANDROID_PERMISSION_PATTERN =
  /^<uses-permission android:name="(android\.permission\.[A-Z0-9_]+)"(?: android:[A-Za-z0-9_]+="[^"]+")* \/>$/;
const ANDROID_FEATURE_PATTERN =
  /^<uses-feature android:name="(android\.hardware\.[a-z0-9_.]+)" android:required="(true|false)" \/>$/;
const IOS_USAGE_KEY_PATTERN = /^NS[A-Za-z0-9]+UsageDescription$/;
const ALLOWED_IOS_BACKGROUND_MODES = new Set(['audio', 'voip', 'remote-notification']);

function pushError(errors, condition, message) {
  if (!condition) {
    errors.push(message);
  }
}

function findDuplicateValues(values) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
      continue;
    }
    seen.add(value);
  }
  return Array.from(duplicates);
}

function parseAndroidPermissionName(line) {
  const match = line.match(ANDROID_PERMISSION_PATTERN);
  return match?.[1] ?? null;
}

function parseAndroidFeatureName(line) {
  const match = line.match(ANDROID_FEATURE_PATTERN);
  return match?.[1] ?? null;
}

function collectIosUsageKeys(entries) {
  return entries.map(([key]) => key);
}

export function validateNativePermissionBaselineSchema() {
  const errors = [];

  const androidPermissionNames = [];
  for (const line of ANDROID_PERMISSION_LINES) {
    const name = parseAndroidPermissionName(line);
    pushError(errors, Boolean(name), `Invalid Android permission line format: ${line}`);
    if (name) {
      androidPermissionNames.push(name);
    }
  }

  const androidFeatureNames = [];
  for (const line of ANDROID_FEATURE_LINES) {
    const name = parseAndroidFeatureName(line);
    pushError(errors, Boolean(name), `Invalid Android feature line format: ${line}`);
    if (name) {
      androidFeatureNames.push(name);
    }
  }

  const duplicatedAndroidPermissions = findDuplicateValues(androidPermissionNames);
  if (duplicatedAndroidPermissions.length) {
    errors.push(`Duplicate Android permissions: ${duplicatedAndroidPermissions.join(', ')}`);
  }

  const duplicatedAndroidFeatures = findDuplicateValues(androidFeatureNames);
  if (duplicatedAndroidFeatures.length) {
    errors.push(`Duplicate Android features: ${duplicatedAndroidFeatures.join(', ')}`);
  }

  for (const permission of ANDROID_CALL_PERMISSION_BASELINE) {
    pushError(
      errors,
      androidPermissionNames.includes(permission),
      `Android call baseline permission missing from permission lines: ${permission}`,
    );
  }

  for (const permission of ANDROID_COMMON_PERMISSION_BASELINE) {
    pushError(
      errors,
      androidPermissionNames.includes(permission),
      `Android common baseline permission missing from permission lines: ${permission}`,
    );
  }

  for (const entry of IOS_PERMISSION_ENTRIES) {
    const [key, value] = entry;
    pushError(errors, IOS_USAGE_KEY_PATTERN.test(key), `Invalid iOS usage description key: ${key}`);
    pushError(
      errors,
      typeof value === 'string' && value.trim().length >= 12,
      `iOS usage description value is too short for key: ${key}`,
    );
  }

  const iosUsageKeys = collectIosUsageKeys(IOS_PERMISSION_ENTRIES);
  const duplicatedIosKeys = findDuplicateValues(iosUsageKeys);
  if (duplicatedIosKeys.length) {
    errors.push(`Duplicate iOS usage description keys: ${duplicatedIosKeys.join(', ')}`);
  }

  for (const mode of IOS_BACKGROUND_MODES) {
    pushError(
      errors,
      ALLOWED_IOS_BACKGROUND_MODES.has(mode),
      `Unsupported iOS background mode in baseline: ${mode}`,
    );
  }

  const duplicatedIosModes = findDuplicateValues(IOS_BACKGROUND_MODES);
  if (duplicatedIosModes.length) {
    errors.push(`Duplicate iOS background modes: ${duplicatedIosModes.join(', ')}`);
  }

  const iosCoverageSource = [
    ...iosUsageKeys,
    'UIBackgroundModes',
    ...IOS_BACKGROUND_MODES.map((mode) => `<string>${mode}</string>`),
  ].join('\n');

  for (const token of IOS_CALL_PERMISSION_BASELINE) {
    pushError(
      errors,
      iosCoverageSource.includes(token),
      `iOS call baseline token missing from permissions/background modes: ${token}`,
    );
  }

  for (const token of IOS_COMMON_PERMISSION_BASELINE) {
    pushError(
      errors,
      iosCoverageSource.includes(token),
      `iOS common baseline token missing from permissions/background modes: ${token}`,
    );
  }

  return {
    errors,
  };
}
