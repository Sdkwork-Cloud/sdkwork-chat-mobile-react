import React from 'react';

export interface SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
  style,
  className = '',
}) => {
  const sizes = {
    sm: { width: 36, height: 20, thumb: 16 },
    md: { width: 44, height: 24, thumb: 20 },
    lg: { width: 52, height: 28, thumb: 24 },
  };

  const { width, height, thumb } = sizes[size];

  const handleClick = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={className}
      style={{
        width,
        height,
        borderRadius: height / 2,
        background: checked ? 'var(--primary-color)' : 'var(--border-color)',
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background 0.2s',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: (height - thumb) / 2,
          left: checked ? width - thumb - 2 : 2,
          width: thumb,
          height: thumb,
          borderRadius: '50%',
          background: 'white',
          transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
      />
    </div>
  );
};
