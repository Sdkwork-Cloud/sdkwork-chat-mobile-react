import React from 'react';
import { Popup } from '../Popup';
import {
  DEFAULT_ACTION_SHEET_VARIANT,
  resolveActionSheetVariantClass,
  resolveDefaultCancelText,
  type ActionSheetAction,
  type ActionSheetShowOptions,
  type ActionSheetVariant,
} from './actionSheetConfig';
import './ActionSheet.css';

interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: React.ReactNode;
  height?: string | number;
  zIndex?: number;
  className?: string;
  variant?: ActionSheetVariant;
}

export const ActionSheet: React.FC<ActionSheetProps> & {
  showActions: (options: ActionSheetShowOptions) => Promise<ActionSheetAction | null>;
} = ({
  visible,
  onClose,
  children,
  title,
  height,
  zIndex,
  className = '',
  variant = DEFAULT_ACTION_SHEET_VARIANT,
}) => {
  const popupClassName = ['c-action-sheet-popup', resolveActionSheetVariantClass(variant), className]
    .filter(Boolean)
    .join(' ');

  return (
    <Popup
      visible={visible}
      onClose={onClose}
      position="bottom"
      round
      zIndex={zIndex}
      style={height ? { height } : undefined}
      className={popupClassName}
    >
      <div className="c-action-sheet">
        <div className="c-action-sheet__handle-wrap">
          <div className="c-action-sheet__handle" />
        </div>

        {title ? (
          <div className="c-action-sheet__title-row">
            <div className="c-action-sheet__title">{title}</div>
            <button
              type="button"
              className="c-action-sheet__close-btn"
              onClick={onClose}
              aria-label="close action sheet"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ) : null}

        <div className="c-action-sheet__body">{children}</div>
      </div>
    </Popup>
  );
};

let actionSheetResolver: ((value: ActionSheetAction | null) => void) | null = null;
let currentActions: ActionSheetAction[] = [];
let currentTitle = '';
let currentCancelText = resolveDefaultCancelText();
let currentVariant: ActionSheetVariant = DEFAULT_ACTION_SHEET_VARIANT;
let actionSheetVisible = false;
let actionSheetListeners: Array<() => void> = [];

const notifyListeners = () => {
  actionSheetListeners.forEach((listener) => listener());
};

export const ActionSheetContainer: React.FC = () => {
  const [, forceUpdate] = React.useReducer((value) => value + 1, 0);

  React.useEffect(() => {
    actionSheetListeners.push(forceUpdate);
    return () => {
      actionSheetListeners = actionSheetListeners.filter((listener) => listener !== forceUpdate);
    };
  }, []);

  const handleActionClick = (action: ActionSheetAction) => {
    if (action.disabled) return;
    actionSheetVisible = false;
    actionSheetResolver?.(action);
    notifyListeners();
  };

  const handleClose = () => {
    actionSheetVisible = false;
    actionSheetResolver?.(null);
    notifyListeners();
  };

  if (!actionSheetVisible) return null;

  return (
    <ActionSheet
      visible={actionSheetVisible}
      onClose={handleClose}
      title={currentTitle}
      variant={currentVariant}
    >
      <div className="c-action-sheet-list">
        {currentActions.map((action, index) => (
          <button
            type="button"
            key={action.key || index}
            onClick={() => handleActionClick(action)}
            className="c-action-sheet-list__item"
            style={action.color ? { color: action.color } : undefined}
            disabled={action.disabled}
          >
            {action.text}
          </button>
        ))}

        <div className="c-action-sheet-list__gap" />

        <button type="button" className="c-action-sheet-list__cancel" onClick={handleClose}>
          {currentCancelText}
        </button>
      </div>
    </ActionSheet>
  );
};

ActionSheet.showActions = async (options: ActionSheetShowOptions): Promise<ActionSheetAction | null> => {
  currentTitle = options.title || '';
  currentActions = options.actions;
  currentCancelText = options.cancelText || resolveDefaultCancelText();
  currentVariant = options.variant || DEFAULT_ACTION_SHEET_VARIANT;
  actionSheetVisible = true;
  notifyListeners();

  return new Promise((resolve) => {
    actionSheetResolver = resolve;
  });
};
