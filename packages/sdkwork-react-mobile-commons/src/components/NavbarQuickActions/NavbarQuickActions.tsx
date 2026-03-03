import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../Icon';
import './NavbarQuickActions.css';

export interface NavbarQuickActionItem {
  key: string;
  label: string;
  icon: string;
  onClick: () => void;
}

interface NavbarQuickActionsProps {
  onSearch?: () => void;
  actions: NavbarQuickActionItem[];
  searchAriaLabel?: string;
  menuAriaLabel?: string;
}

interface MenuPosition {
  top: number;
  right: number;
}

const MENU_OFFSET_Y = 8;
const MIN_MENU_RIGHT = 8;

export const NavbarQuickActions: React.FC<NavbarQuickActionsProps> = ({
  onSearch,
  actions,
  searchAriaLabel = 'search',
  menuAriaLabel = 'quick-actions',
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({ top: 52, right: 12 });
  const plusButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const resolvedActions = useMemo(() => actions.filter((action) => !!action.onClick), [actions]);

  const syncMenuPosition = useCallback(() => {
    const triggerRect = plusButtonRef.current?.getBoundingClientRect();
    if (!triggerRect) return;

    setMenuPosition({
      top: triggerRect.bottom + MENU_OFFSET_Y,
      right: Math.max(MIN_MENU_RIGHT, window.innerWidth - triggerRect.right),
    });
  }, []);

  useEffect(() => {
    if (!menuVisible) return;

    syncMenuPosition();
    const handleWindowUpdate = () => syncMenuPosition();
    window.addEventListener('resize', handleWindowUpdate);
    window.addEventListener('scroll', handleWindowUpdate, true);

    return () => {
      window.removeEventListener('resize', handleWindowUpdate);
      window.removeEventListener('scroll', handleWindowUpdate, true);
    };
  }, [menuVisible, syncMenuPosition]);

  useEffect(() => {
    if (!menuVisible) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (menuRef.current?.contains(target)) return;
      if (plusButtonRef.current?.contains(target)) return;
      setMenuVisible(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [menuVisible]);

  const handleActionClick = useCallback((action: NavbarQuickActionItem) => {
    setMenuVisible(false);
    action.onClick();
  }, []);

  return (
    <div className="oc-navbar-quick-actions">
      {onSearch ? (
        <button
          type="button"
          className="oc-navbar-quick-actions__btn"
          onClick={onSearch}
          aria-label={searchAriaLabel}
        >
          <Icon name="search" size={20} />
        </button>
      ) : null}

      <button
        ref={plusButtonRef}
        type="button"
        className={`oc-navbar-quick-actions__btn ${menuVisible ? 'is-active' : ''}`}
        onClick={() => setMenuVisible((prev) => !prev)}
        aria-label={menuAriaLabel}
      >
        <Icon name="plus" size={20} />
      </button>

      {menuVisible ? (
        <div
          ref={menuRef}
          className="oc-navbar-quick-actions__menu"
          style={{ top: `${menuPosition.top}px`, right: `${menuPosition.right}px` }}
        >
          {resolvedActions.map((action) => (
            <button
              key={action.key}
              type="button"
              className="oc-navbar-quick-actions__menu-item"
              onClick={() => handleActionClick(action)}
            >
              <Icon name={action.icon} size={17} />
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default NavbarQuickActions;
