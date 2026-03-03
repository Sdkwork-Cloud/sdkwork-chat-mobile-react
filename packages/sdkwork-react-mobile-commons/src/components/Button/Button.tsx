import React, { forwardRef } from 'react';
import cn from 'classnames';
import './Button.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      block = false,
      fullWidth = false,
      loading = false,
      leftIcon,
      rightIcon,
      icon,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const isFullWidth = block || fullWidth;
    
    return (
      <button
        ref={ref}
        className={cn(
          'oc-button',
          `oc-button--${variant}`,
          `oc-button--${size}`,
          {
            'oc-button--full-width': isFullWidth,
            'oc-button--loading': loading,
          },
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <span className="oc-button__spinner" />}
        {!loading && (leftIcon || icon) && <span className="oc-button__icon oc-button__icon--left">{leftIcon || icon}</span>}
        <span className="oc-button__text">{children}</span>
        {!loading && rightIcon && <span className="oc-button__icon oc-button__icon--right">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
