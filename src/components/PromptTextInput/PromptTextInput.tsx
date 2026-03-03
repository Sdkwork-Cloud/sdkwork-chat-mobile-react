
import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';

export interface PromptTextInputRef {
    focus: () => void;
    blur: () => void;
    clear: () => void;
}

interface PromptTextInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    onSubmit?: () => void;
    className?: string;
    style?: React.CSSProperties;
    autoFocus?: boolean;
    disabled?: boolean;
    maxHeight?: string;
}

export const PromptTextInput = forwardRef<PromptTextInputRef, PromptTextInputProps>(({
    value,
    onChange,
    placeholder = '请输入...',
    onSubmit,
    className = '',
    style,
    autoFocus = false,
    disabled = false,
    maxHeight = '120px'
}, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => ({
        focus: () => textareaRef.current?.focus(),
        blur: () => textareaRef.current?.blur(),
        clear: () => {
            if (textareaRef.current) {
                textareaRef.current.value = '';
                onChange('');
            }
        }
    }));

    useEffect(() => {
        if (autoFocus && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [autoFocus]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSubmit?.();
        }
    };

    return (
        <div
            className={className}
            style={{
                position: 'relative',
                width: '100%',
                ...style
            }}
        >
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                style={{
                    width: '100%',
                    minHeight: '44px',
                    maxHeight,
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontSize: '15px',
                    lineHeight: 1.5,
                    resize: 'none',
                    outline: 'none',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                }}
            />
        </div>
    );
});

PromptTextInput.displayName = 'PromptTextInput';
