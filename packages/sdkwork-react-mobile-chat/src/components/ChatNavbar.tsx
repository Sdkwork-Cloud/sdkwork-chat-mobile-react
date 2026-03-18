
import React from 'react';
import { Navbar, Icon } from '@sdkwork/react-mobile-commons';

interface ChatNavbarProps {
  title: string;
  onBack: () => void;
  sessionId: string;
  onMenuClick?: () => void;
  variant?: 'default' | 'transparent';
}

export const ChatNavbar: React.FC<ChatNavbarProps> = ({ title, onBack, sessionId: _sessionId, onMenuClick, variant = 'default' }) => {
  const handleMenuClick = () => {
     onMenuClick?.();
  };

  const RightElement = (
      <div 
        onClick={handleMenuClick}
        style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', opacity: 0.9, cursor: 'pointer', color: 'inherit' }}
      >
        <Icon name="more" size={24} />
      </div>
  );

  return (
    <Navbar 
        title={title} 
        onBack={onBack} 
        rightElement={RightElement}
        variant={variant}
    />
  );
};
