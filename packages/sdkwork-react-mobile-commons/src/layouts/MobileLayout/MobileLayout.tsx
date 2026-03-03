import React, { forwardRef } from 'react';
import cn from 'classnames';
import './MobileLayout.css';

export interface MobileLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  safeArea?: boolean;
  fullHeight?: boolean;
}

export const MobileLayout = forwardRef<HTMLDivElement, MobileLayoutProps>(
  (
    { children, header, footer, safeArea = true, fullHeight = true, className, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'oc-mobile-layout',
          {
            'oc-mobile-layout--safe-area': safeArea,
            'oc-mobile-layout--full-height': fullHeight,
          },
          className
        )}
        {...props}
      >
        {header && <header className="oc-mobile-layout__header">{header}</header>}
        <main className="oc-mobile-layout__content">{children}</main>
        {footer && <footer className="oc-mobile-layout__footer">{footer}</footer>}
      </div>
    );
  }
);

MobileLayout.displayName = 'MobileLayout';

export interface MobileHeaderProps extends React.HTMLAttributes<HTMLElement> {
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
  sticky?: boolean;
}

export const MobileHeader = forwardRef<HTMLElement, MobileHeaderProps>(
  ({ left, center, right, sticky = true, className, children, ...props }, ref) => {
    return (
      <header
        ref={ref}
        className={cn(
          'oc-mobile-header',
          { 'oc-mobile-header--sticky': sticky },
          className
        )}
        {...props}
      >
        <div className="oc-mobile-header__left">{left}</div>
        <div className="oc-mobile-header__center">{center || children}</div>
        <div className="oc-mobile-header__right">{right}</div>
      </header>
    );
  }
);

MobileHeader.displayName = 'MobileHeader';

export interface MobileFooterProps extends React.HTMLAttributes<HTMLElement> {
  sticky?: boolean;
}

export const MobileFooter = forwardRef<HTMLElement, MobileFooterProps>(
  ({ sticky = true, className, children, ...props }, ref) => {
    return (
      <footer
        ref={ref}
        className={cn(
          'oc-mobile-footer',
          { 'oc-mobile-footer--sticky': sticky },
          className
        )}
        {...props}
      >
        {children}
      </footer>
    );
  }
);

MobileFooter.displayName = 'MobileFooter';

export interface MobileContentProps extends React.HTMLAttributes<HTMLDivElement> {
  scrollable?: boolean;
  padded?: boolean;
}

export const MobileContent = forwardRef<HTMLDivElement, MobileContentProps>(
  ({ scrollable = true, padded = true, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'oc-mobile-content',
          {
            'oc-mobile-content--scrollable': scrollable,
            'oc-mobile-content--padded': padded,
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

MobileContent.displayName = 'MobileContent';
