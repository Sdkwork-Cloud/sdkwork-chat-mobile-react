import { describe, expect, it } from 'vitest';
import { buildTranslationResources, type TranslationTree } from './resourceBuilder';

const expectTree = (value: TranslationTree[string]): TranslationTree => {
  expect(value).toBeTypeOf('object');
  expect(value).not.toBeNull();
  return value as TranslationTree;
};

const expectString = (value: TranslationTree[string]): string => {
  expect(typeof value).toBe('string');
  return value as string;
};

describe('resourceBuilder', () => {
  it('merges root and package resources into en-US and zh-CN translations', () => {
    const resources = buildTranslationResources();
    const enTranslation = resources['en-US'].translation;
    const zhTranslation = resources['zh-CN'].translation;

    expect(expectString(expectTree(enTranslation.common).confirm)).toBe('Confirm');
    expect(expectString(expectTree(zhTranslation.common).confirm)).toBe('\u786e\u5b9a');
    expect(expectString(expectTree(enTranslation.wallet).title)).toBeTruthy();
    expect(expectString(expectTree(expectTree(zhTranslation.pages).agents).entering)).toBeTruthy();
    expect(expectString(expectTree(enTranslation.search).cancel)).toBeTruthy();
  });
});
