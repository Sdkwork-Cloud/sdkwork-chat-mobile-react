import React from 'react';
import { Icon } from '@sdkwork/react-mobile-commons';
import './UserProfileHeader.css';

const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=OpenChat';

export interface UserProfileHeaderProps {
  name?: string;
  idText?: string;
  avatarUrl?: string;
  statusText?: string;
  statusPlaceholder?: string;
  onClick?: () => void;
  onStatusClick?: () => void;
  showArrow?: boolean;
  className?: string;
}

const joinClassNames = (...classNames: Array<string | false | null | undefined>) =>
  classNames.filter(Boolean).join(' ');

export const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  name,
  idText,
  avatarUrl,
  statusText,
  statusPlaceholder = 'Set Status',
  onClick,
  onStatusClick,
  showArrow = true,
  className,
}) => {
  const clickable = Boolean(onClick);
  const displayName = name || 'User';
  const resolvedAvatar = avatarUrl || DEFAULT_AVATAR;
  const [avatarSrc, setAvatarSrc] = React.useState(resolvedAvatar);

  React.useEffect(() => {
    setAvatarSrc(resolvedAvatar);
  }, [resolvedAvatar]);

  const handleRootKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!clickable) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
  };

  const handleStatusClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onStatusClick?.();
  };

  const handleStatusKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    event.stopPropagation();
    onStatusClick?.();
  };

  return (
    <div className={joinClassNames('user-profile-header', className)}>
      <div
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : -1}
        className={joinClassNames('user-profile-header__cell', clickable && 'user-profile-header__cell--clickable')}
        onClick={onClick}
        onKeyDown={handleRootKeyDown}
      >
        <div className="user-profile-header__avatar">
          <img
            src={avatarSrc}
            alt={displayName}
            className="user-profile-header__avatar-image"
            onError={() => {
              if (avatarSrc !== DEFAULT_AVATAR) {
                setAvatarSrc(DEFAULT_AVATAR);
              }
            }}
          />
        </div>

        <div className="user-profile-header__main">
          <div className="user-profile-header__name">{displayName}</div>
          <div className="user-profile-header__id">{idText || '--'}</div>
          <button
            type="button"
            className="user-profile-header__status"
            onClick={handleStatusClick}
            onKeyDown={handleStatusKeyDown}
            disabled={!onStatusClick}
          >
            {statusText || statusPlaceholder}
          </button>
        </div>

        {showArrow ? (
          <span className="user-profile-header__arrow">
            <Icon name="arrow-right" size={18} color="var(--text-secondary, #6b7280)" />
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default UserProfileHeader;
