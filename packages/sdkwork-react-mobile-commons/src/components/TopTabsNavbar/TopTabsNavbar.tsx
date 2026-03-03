import React, { useCallback, useLayoutEffect, useRef } from 'react';
import { Icon, IconName } from '../Icon';
import './TopTabsNavbar.css';

export interface TopTabItem {
  id: string;
  label: string;
  icon?: IconName | string;
}

export interface TopTabsNavbarProps {
  tabs: TopTabItem[];
  activeTab: string;
  onTabChange: (id: string) => void | Promise<void>;
  rightAction?: React.ReactNode;
  className?: string;
  variant?: 'underline' | 'chip';
  sticky?: boolean;
  topOffset?: number;
  activeColor?: string;
  inactiveColor?: string;
  indicatorColor?: string;
  activeBackground?: string;
  inactiveBackground?: string;
}

export const TopTabsNavbar: React.FC<TopTabsNavbarProps> = ({
  tabs,
  activeTab,
  onTabChange,
  rightAction,
  className = '',
  variant = 'underline',
  sticky = true,
  topOffset = 0,
  activeColor,
  inactiveColor,
  indicatorColor,
  activeBackground,
  inactiveBackground,
}) => {
  const tabsRef = useRef<HTMLDivElement>(null);
  const hasInitializedRef = useRef(false);
  const tabButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const setTabButtonRef = useCallback(
    (tabId: string) => (node: HTMLButtonElement | null) => {
      tabButtonRefs.current[tabId] = node;
    },
    []
  );

  const centerActiveTab = useCallback(
    (behavior: ScrollBehavior) => {
      const tabsNode = tabsRef.current;
      const activeTabNode = tabButtonRefs.current[activeTab];
      if (!tabsNode || !activeTabNode) return;

      const tabsRect = tabsNode.getBoundingClientRect();
      const activeRect = activeTabNode.getBoundingClientRect();
      const offset = activeRect.left - tabsRect.left;
      const targetLeft = tabsNode.scrollLeft + offset - (tabsRect.width - activeRect.width) / 2;
      const maxScrollLeft = tabsNode.scrollWidth - tabsNode.clientWidth;
      const nextScrollLeft = Math.max(0, Math.min(maxScrollLeft, targetLeft));
      const currentScrollLeft = tabsNode.scrollLeft;

      if (Math.abs(nextScrollLeft - currentScrollLeft) < 1) return;
      tabsNode.scrollTo({ left: nextScrollLeft, behavior });
    },
    [activeTab]
  );

  useLayoutEffect(() => {
    const behavior: ScrollBehavior = hasInitializedRef.current ? 'smooth' : 'auto';
    centerActiveTab(behavior);
    hasInitializedRef.current = true;
  }, [activeTab, tabs.length, centerActiveTab]);

  const styleVars: React.CSSProperties = {
    '--oc-top-tabs-active-color': activeColor,
    '--oc-top-tabs-inactive-color': inactiveColor,
    '--oc-top-tabs-indicator-color': indicatorColor,
    '--oc-top-tabs-active-bg': activeBackground,
    '--oc-top-tabs-inactive-bg': inactiveBackground,
    '--oc-top-tabs-top': `${topOffset}px`,
  } as React.CSSProperties;

  return (
    <div
      className={[
        'oc-top-tabs-navbar',
        sticky ? 'oc-top-tabs-navbar--sticky' : '',
        variant === 'chip' ? 'oc-top-tabs-navbar--chip' : 'oc-top-tabs-navbar--underline',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={styleVars}
    >
      <div className="oc-top-tabs-navbar__inner">
        <div className="oc-top-tabs-navbar__tabs" role="tablist" aria-orientation="horizontal" ref={tabsRef}>
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                ref={setTabButtonRef(tab.id)}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`oc-top-tabs-navbar__tab ${isActive ? 'oc-top-tabs-navbar__tab--active' : ''}`}
                onClick={() => {
                  if (!isActive) onTabChange(tab.id);
                }}
              >
                {tab.icon ? <Icon name={tab.icon} size={14} /> : null}
                <span>{tab.label}</span>
                {variant === 'underline' && isActive ? (
                  <span className="oc-top-tabs-navbar__indicator" aria-hidden="true" />
                ) : null}
              </button>
            );
          })}
        </div>

        {rightAction ? <div className="oc-top-tabs-navbar__right">{rightAction}</div> : null}
      </div>
    </div>
  );
};

export default TopTabsNavbar;
