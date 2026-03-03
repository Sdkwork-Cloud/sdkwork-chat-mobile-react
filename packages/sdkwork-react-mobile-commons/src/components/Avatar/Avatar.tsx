import React, { forwardRef } from 'react';
import cn from 'classnames';
import './Avatar.css';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'circle' | 'square' | 'rounded';
  status?: 'online' | 'offline' | 'away' | 'busy';
  fallback?: React.ReactNode;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getRandomColor(name: string): string {
  const colors = [
    '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981',
    '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt = '',
      name,
      size = 'md',
      shape = 'circle',
      status,
      fallback,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const [imageError, setImageError] = React.useState(false);

    const showImage = src && !imageError;
    const showInitials = name && (!showImage || imageError);
    const showFallback = fallback && !showImage && !showInitials;

    const avatarStyle: React.CSSProperties = {
      ...style,
      ...(showInitials && { backgroundColor: getRandomColor(name) }),
    };

    return (
      <div
        ref={ref}
        className={cn(
          'oc-avatar',
          `oc-avatar--${size}`,
          `oc-avatar--${shape}`,
          className
        )}
        style={avatarStyle}
        {...props}
      >
        {showImage && (
          <img
            src={src}
            alt={alt}
            className="oc-avatar__image"
            onError={() => setImageError(true)}
          />
        )}
        {showInitials && (
          <span className="oc-avatar__initials">{getInitials(name)}</span>
        )}
        {showFallback && <span className="oc-avatar__fallback">{fallback}</span>}
        {status && <span className={cn('oc-avatar__status', `oc-avatar__status--${status}`)} />}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number;
  spacing?: 'sm' | 'md' | 'lg';
}

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ children, max = 4, spacing = 'md', className, ...props }, ref) => {
    const childrenArray = React.Children.toArray(children);
    const visibleChildren = childrenArray.slice(0, max);
    const remainingCount = childrenArray.length - max;

    return (
      <div
        ref={ref}
        className={cn('oc-avatar-group', `oc-avatar-group--${spacing}`, className)}
        {...props}
      >
        {visibleChildren}
        {remainingCount > 0 && (
          <div className="oc-avatar oc-avatar--md oc-avatar--circle oc-avatar--more">
            <span className="oc-avatar__initials">+{remainingCount}</span>
          </div>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';
