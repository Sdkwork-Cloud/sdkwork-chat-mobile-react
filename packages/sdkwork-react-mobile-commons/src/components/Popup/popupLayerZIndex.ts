import type { CSSProperties } from 'react';

export type PopupLayerZIndex = CSSProperties['zIndex'];

export const DEFAULT_POPUP_Z_INDEX: PopupLayerZIndex = 'var(--z-popup, 1400)';

export const resolvePopupZIndex = (zIndex?: PopupLayerZIndex): PopupLayerZIndex =>
  zIndex ?? DEFAULT_POPUP_Z_INDEX;

export const resolvePopupMaskZIndex = (popupZIndex: PopupLayerZIndex): PopupLayerZIndex => {
  if (typeof popupZIndex === 'number') {
    return popupZIndex - 1;
  }
  return `calc(${popupZIndex} - 1)`;
};
