import { describe, expect, it } from 'vitest';
import { DEFAULT_POPUP_Z_INDEX, resolvePopupMaskZIndex, resolvePopupZIndex } from './popupLayerZIndex';

describe('commons popupLayerZIndex', () => {
  it('defaults popup z-index to css variable with fallback', () => {
    expect(resolvePopupZIndex()).toBe(DEFAULT_POPUP_Z_INDEX);
    expect(DEFAULT_POPUP_Z_INDEX).toBe('var(--z-popup, 1400)');
  });

  it('returns mask z-index one level below popup z-index', () => {
    expect(resolvePopupMaskZIndex(1400)).toBe(1399);
    expect(resolvePopupMaskZIndex('var(--z-popup, 1400)')).toBe('calc(var(--z-popup, 1400) - 1)');
  });
});
