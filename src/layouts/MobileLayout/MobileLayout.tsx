
import React, { useEffect } from 'react';
import { Tabbar } from '../../components/Tabbar';
import { FloatingBall } from '../../components/FloatingBall/FloatingBall';
import { MiniPlayer } from '../../components/MiniPlayer/MiniPlayer';
import { useSettingsStore } from '@sdkwork/react-mobile-settings';
import { shouldRenderFloatingAssistant } from './visibility';
import '../../styles/safe-area.css';
import './MobileLayout.css';

interface MobileLayoutProps {
  children: React.ReactNode;
  showTabbar?: boolean;
  showFloatingBall?: boolean;
  disableBottomSafeArea?: boolean;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  showTabbar = true,
  showFloatingBall = showTabbar,
  disableBottomSafeArea = false,
}) => {
  const config = useSettingsStore((state) => state.config);
  const loadConfig = useSettingsStore((state) => state.loadConfig);

  useEffect(() => {
    void loadConfig();
  }, [loadConfig]);

  const floatingAssistantVisible = shouldRenderFloatingAssistant({
    pageAllowsFloatingBall: showFloatingBall,
    openAIAssistantEnabled: config?.openAIAssistantEnabled ?? false,
  });

  return (
    <div className="mobile-layout">
      <main
        className={[
          'mobile-layout__content',
          showTabbar ? 'mobile-layout__content--with-tabbar' : '',
          disableBottomSafeArea ? 'mobile-layout__content--no-bottom-safe-area' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </main>
      
      {/* Global Interactive Layers */}
      <MiniPlayer hasTabbar={showTabbar} />
      {floatingAssistantVisible ? <FloatingBall /> : null}
      {showTabbar ? <Tabbar /> : null}
    </div>
  );
};
