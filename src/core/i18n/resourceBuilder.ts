import type { Locale } from './config';
import appEnUS from './locales/en-US';
import appZhCN from './locales/zh-CN';
import agentsEnUS from '../../../packages/sdkwork-react-mobile-agents/src/i18n/locales/en-US';
import agentsZhCN from '../../../packages/sdkwork-react-mobile-agents/src/i18n/locales/zh-CN';
import appointmentsEn from '../../../packages/sdkwork-react-mobile-appointments/src/i18n/en';
import appointmentsZh from '../../../packages/sdkwork-react-mobile-appointments/src/i18n/zh';
import authEn from '../../../packages/sdkwork-react-mobile-auth/src/i18n/en';
import authZh from '../../../packages/sdkwork-react-mobile-auth/src/i18n/zh';
import chatEn from '../../../packages/sdkwork-react-mobile-chat/src/i18n/en';
import chatZh from '../../../packages/sdkwork-react-mobile-chat/src/i18n/zh';
import commerceEn from '../../../packages/sdkwork-react-mobile-commerce/src/i18n/en';
import commerceZh from '../../../packages/sdkwork-react-mobile-commerce/src/i18n/zh';
import communicationEn from '../../../packages/sdkwork-react-mobile-communication/src/i18n/en';
import communicationZh from '../../../packages/sdkwork-react-mobile-communication/src/i18n/zh';
import contactsEn from '../../../packages/sdkwork-react-mobile-contacts/src/i18n/en';
import contactsZh from '../../../packages/sdkwork-react-mobile-contacts/src/i18n/zh';
import contentEn from '../../../packages/sdkwork-react-mobile-content/src/i18n/en';
import contentZh from '../../../packages/sdkwork-react-mobile-content/src/i18n/zh';
import creationEn from '../../../packages/sdkwork-react-mobile-creation/src/i18n/en';
import creationZh from '../../../packages/sdkwork-react-mobile-creation/src/i18n/zh';
import discoverEn from '../../../packages/sdkwork-react-mobile-discover/src/i18n/en';
import discoverZh from '../../../packages/sdkwork-react-mobile-discover/src/i18n/zh';
import driveEn from '../../../packages/sdkwork-react-mobile-drive/src/i18n/en';
import driveZh from '../../../packages/sdkwork-react-mobile-drive/src/i18n/zh';
import notificationEn from '../../../packages/sdkwork-react-mobile-notification/src/i18n/en';
import notificationZh from '../../../packages/sdkwork-react-mobile-notification/src/i18n/zh';
import searchEn from '../../../packages/sdkwork-react-mobile-search/src/i18n/en';
import searchZh from '../../../packages/sdkwork-react-mobile-search/src/i18n/zh';
import settingsEn from '../../../packages/sdkwork-react-mobile-settings/src/i18n/en';
import settingsZh from '../../../packages/sdkwork-react-mobile-settings/src/i18n/zh';
import socialEn from '../../../packages/sdkwork-react-mobile-social/src/i18n/en';
import socialZh from '../../../packages/sdkwork-react-mobile-social/src/i18n/zh';
import toolsEn from '../../../packages/sdkwork-react-mobile-tools/src/i18n/en';
import toolsZh from '../../../packages/sdkwork-react-mobile-tools/src/i18n/zh';
import userEn from '../../../packages/sdkwork-react-mobile-user/src/i18n/en';
import userZh from '../../../packages/sdkwork-react-mobile-user/src/i18n/zh';
import userFlatEn from '../../../packages/sdkwork-react-mobile-user/src/i18n/locales/en-US';
import userFlatZh from '../../../packages/sdkwork-react-mobile-user/src/i18n/locales/zh-CN';
import videoEn from '../../../packages/sdkwork-react-mobile-video/src/i18n/en';
import videoZh from '../../../packages/sdkwork-react-mobile-video/src/i18n/zh';
import walletEn from '../../../packages/sdkwork-react-mobile-wallet/src/i18n/en';
import walletZh from '../../../packages/sdkwork-react-mobile-wallet/src/i18n/zh';

type TranslationValue = string | number | boolean | null | undefined | TranslationTree;
export interface TranslationTree {
  [key: string]: TranslationValue;
}

interface TranslationResource {
  translation: TranslationTree;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const assignByPath = (target: TranslationTree, path: string, value: TranslationValue) => {
  const parts = path.split('.').filter(Boolean);
  if (parts.length === 0) {
    return;
  }

  let cursor: TranslationTree = target;
  parts.forEach((part, index) => {
    if (index === parts.length - 1) {
      cursor[part] = value;
      return;
    }

    if (!isObject(cursor[part])) {
      cursor[part] = {};
    }

    cursor = cursor[part] as TranslationTree;
  });
};

const normalizeTree = (source: TranslationTree): TranslationTree => {
  const target: TranslationTree = {};

  for (const [key, value] of Object.entries(source || {})) {
    if (key.includes('.') && !isObject(value)) {
      assignByPath(target, key, value);
      continue;
    }

    if (isObject(value)) {
      target[key] = normalizeTree(value as TranslationTree);
      continue;
    }

    target[key] = value;
  }

  return target;
};

const deepMerge = (base: TranslationTree, patch: TranslationTree): TranslationTree => {
  const output: TranslationTree = { ...base };

  for (const [key, value] of Object.entries(patch)) {
    if (isObject(value) && isObject(output[key])) {
      output[key] = deepMerge(output[key] as TranslationTree, value as TranslationTree);
      continue;
    }
    output[key] = value as TranslationValue;
  }

  return output;
};

const buildLocaleTranslation = (sources: TranslationTree[]): TranslationTree =>
  sources.reduce((accumulator, source) => deepMerge(accumulator, normalizeTree(source)), {});

export const buildTranslationResources = (): Record<Locale, TranslationResource> => ({
  'en-US': {
    translation: buildLocaleTranslation([
      appEnUS,
      agentsEnUS,
      appointmentsEn,
      authEn,
      chatEn,
      commerceEn,
      communicationEn,
      contactsEn,
      contentEn,
      creationEn,
      discoverEn,
      driveEn,
      notificationEn,
      searchEn,
      settingsEn,
      socialEn,
      toolsEn,
      userEn,
      userFlatEn,
      videoEn,
      walletEn,
    ]),
  },
  'zh-CN': {
    translation: buildLocaleTranslation([
      appZhCN,
      agentsZhCN,
      appointmentsZh,
      authZh,
      chatZh,
      commerceZh,
      communicationZh,
      contactsZh,
      contentZh,
      creationZh,
      discoverZh,
      driveZh,
      notificationZh,
      searchZh,
      settingsZh,
      socialZh,
      toolsZh,
      userZh,
      userFlatZh,
      videoZh,
      walletZh,
    ]),
  },
});
