import React from 'react';
import './Skeleton.css';

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  style,
  className = '',
}) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        background: 'var(--skeleton-bg, linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%))',
        backgroundSize: '200% 100%',
        animation: 'skeleton-loading 1.5s ease-in-out infinite',
        borderRadius: '4px',
        ...style,
      }}
    />
  );
};
