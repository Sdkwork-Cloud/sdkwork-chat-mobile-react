import { describe, expect, it } from 'vitest';
import { DEFAULT_POPUP_Z_INDEX, resolvePopupMaskZIndex, resolvePopupZIndex } from './popupLayerZIndex';

describe('popupLayerZIndex', () => {
  it('uses css variable fallback for popup z-index by default', () => {
    expect(resolvePopupZIndex()).toBe(DEFAULT_POPUP_Z_INDEX);
    expect(DEFAULT_POPUP_Z_INDEX).toBe('var(--z-popup, 1400)');
  });

  it('computes mask z-index one level below popup for number and css variable', () => {
    expect(resolvePopupMaskZIndex(1400)).toBe(1399);
    expect(resolvePopupMaskZIndex('var(--z-popup, 1400)')).toBe('calc(var(--z-popup, 1400) - 1)');
  });
});
