import React, { forwardRef, useRef, useState, useImperativeHandle } from 'react';
import cn from 'classnames';
import './Input.css';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  error?: string | boolean;
  helperText?: string;
  maxLength?: number;
  showCount?: boolean;
  clearable?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  onClear?: () => void;
  variant?: 'filled' | 'outline' | 'ghost';
  containerStyle?: React.CSSProperties;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      maxLength,
      showCount,
      clearable,
      prefix,
      suffix,
      onClear,
      variant = 'outline',
      containerStyle,
      fullWidth = false,
      leftIcon,
      rightIcon,
      className,
      value,
      onChange,
      type,
      disabled,
      style,
      ...props
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const isError = !!error;
    const currentLength = value ? String(value).length : 0;

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled) return;
      if (onChange) {
        const event = { target: { value: '' } } as React.ChangeEvent<HTMLInputElement>;
        onChange(event);
      }
      if (onClear) onClear();
      inputRef.current?.focus();
    };

    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    const getBg = () => {
      if (variant === 'ghost') return 'transparent';
      if (variant === 'filled') return disabled ? 'rgba(0,0,0,0.02)' : 'var(--bg-body, #1c1c1e)';
      return 'transparent';
    };

    const getBorder = () => {
      if (variant === 'ghost') return 'none';
      if (isError) return '1px solid var(--danger, #fa5151)';
      if (isFocused && variant === 'outline') return '1px solid var(--primary-color, #007aff)';
      if (variant === 'outline') return '1px solid var(--border-color, rgba(255,255,255,0.08))';
      return '1px solid transparent';
    };

    return (
      <div 
        className={cn('oc-input-wrapper', { 'oc-input-wrapper--full-width': fullWidth })} 
        style={containerStyle}
      >
        {label && (
          <label className="oc-input__label">
            {label}
          </label>
        )}
        
        <div 
          className={cn('oc-input__container', { 
            'oc-input__container--error': isError,
            'oc-input__container--focused': isFocused,
            'oc-input__container--disabled': disabled
          })}
          style={{
            background: getBg(),
            border: getBorder(),
          }}
        >
          {(prefix || leftIcon) && (
            <div className="oc-input__prefix">
              {prefix || leftIcon}
            </div>
          )}
          
          <input
            ref={inputRef}
            type={inputType}
            value={value}
            onChange={onChange}
            disabled={disabled}
            maxLength={maxLength}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn('oc-input', `oc-input--${variant}`, className)}
            style={style}
            {...props}
          />

          {clearable && !disabled && value && String(value).length > 0 && (
            <div className="oc-input__clear" onClick={handleClear}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
              </svg>
            </div>
          )}

          {isPassword && !disabled && (
            <div 
              className="oc-input__password-toggle" 
              onClick={(e) => {
                e.stopPropagation();
                setShowPassword(!showPassword);
              }}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              )}
            </div>
          )}
          
          {(suffix || rightIcon) && (
            <div className="oc-input__suffix">
              {suffix || rightIcon}
            </div>
          )}
        </div>

        {(error || helperText || (maxLength && showCount)) && (
          <div className="oc-input__footer">
            <div className={cn('oc-input__helper', { 'oc-input__helper--error': isError })}>
              {isError ? (typeof error === 'string' ? error : '') : helperText}
            </div>
            {maxLength && showCount && (
              <div className="oc-input__count">
                {currentLength} / {maxLength}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
