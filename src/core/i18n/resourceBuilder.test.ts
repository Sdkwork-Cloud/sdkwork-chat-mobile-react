import { describe, expect, it } from 'vitest';
import { buildTranslationResources } from './resourceBuilder';

describe('resourceBuilder', () => {
  it('merges root and package resources into en-US and zh-CN translations', () => {
    const resources = buildTranslationResources();

    expect(resources['en-US'].translation.common.confirm).toBe('Confirm');
    expect(resources['zh-CN'].translation.common.confirm).toBe('确定');
    expect(resources['en-US'].translation.wallet.title).toBeTruthy();
    expect(resources['zh-CN'].translation.pages.agents.entering).toBeTruthy();
    expect(resources['en-US'].translation.search.cancel).toBeTruthy();
  });
});
