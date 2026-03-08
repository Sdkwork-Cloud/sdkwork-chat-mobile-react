
import React, { lazy, Suspense, useEffect, useState } from 'react';
import AppProvider from './AppProvider';
import { Router } from '../router';
import { Platform } from '../platform';
import { InitActionSheet } from '../components/ActionSheet';
import { ActionSheetContainer as CommonsActionSheetContainer } from '@sdkwork/react-mobile-commons';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { getThemeMetaColor, useTheme } from '../theme/themeContext';
import { SplashScreen } from '../components/SplashScreen/SplashScreen';
import {
  createDefaultPlatformRuntimeHooks,
  flushDefaultPlatformRuntimeHookQueue,
  getPlatform as getCorePlatform,
  initializePlatformRuntime,
} from '@sdkwork/react-mobile-core/platform';

const InitToast = lazy(() => import('../components/Toast').then((m) => ({ default: m.InitToast })));
const InitImageViewer = lazy(() => import('../components/ImageViewer/ImageViewer').then((m) => ({ default: m.InitImageViewer })));
const InitDialog = lazy(() => import('../components/Dialog').then((m) => ({ default: m.InitDialog })));
const DynamicIsland = lazy(() => import('../components/DynamicIsland/DynamicIsland').then((m) => ({ default: m.DynamicIsland })));
const NetworkStatus = lazy(() => import('../components/NetworkStatus/NetworkStatus').then((m) => ({ default: m.NetworkStatus })));

const preloadPrimaryRoutes = () => {
  // Preload primary tabs after app is interactive to reduce first-switch latency.
  void import('../pages/HomePage');
  void import('@sdkwork/react-mobile-creation');
  void import('@sdkwork/react-mobile-agents');
  void import('@sdkwork/react-mobile-discover');
  void import('@sdkwork/react-mobile-user');
};

// Helper component to observe theme and update status bar
const StatusBarManager = () => {
    const { theme } = useTheme();
    
    useEffect(() => {
        const metaThemeColor = document.querySelector("meta[name=theme-color]");
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', getThemeMetaColor(theme));
        }
    }, [theme]);

    return null;
};

const App: React.FC = () => {
  const [initialized, setInitialized] = useState(false);
  const [runtimeLayersReady, setRuntimeLayersReady] = useState(false);

  useEffect(() => {
    let disposeRuntime: (() => void) | null = null;
    let onlineListener: (() => void) | null = null;
    let visibilityListener: (() => void) | null = null;

    const initApp = async () => {
      // Initialize app platform abstraction (delegates to core platform adapter).
      await Platform.initialize();

      // Bind native runtime listeners: push registration refresh, appUrlOpen payment callbacks, and network/app state events.
      try {
        const runtimeHookOptions = {
          platform: getCorePlatform(),
        };
        const runtimeHooks = createDefaultPlatformRuntimeHooks(runtimeHookOptions);
        const flushRetryQueue = () => {
          void flushDefaultPlatformRuntimeHookQueue(runtimeHookOptions).catch((error) => {
            console.warn('[App] Failed to flush runtime retry queue:', error);
          });
        };

        disposeRuntime = await initializePlatformRuntime(runtimeHooks);
        flushRetryQueue();

        onlineListener = () => flushRetryQueue();
        window.addEventListener('online', onlineListener);

        visibilityListener = () => {
          if (document.visibilityState === 'visible') {
            flushRetryQueue();
          }
        };
        document.addEventListener('visibilitychange', visibilityListener);
      } catch (error) {
        console.error('[App] Failed to initialize platform runtime listeners:', error);
      }

      console.log(`Running on platform: ${Platform.type}`);
      setInitialized(true);
    };

    initApp().catch((error) => {
      console.error('[App] Failed to initialize app:', error);
      setInitialized(true);
    });

    return () => {
      disposeRuntime?.();
      if (onlineListener) {
        window.removeEventListener('online', onlineListener);
      }
      if (visibilityListener) {
        document.removeEventListener('visibilitychange', visibilityListener);
      }
    };
  }, []);

  useEffect(() => {
    if (!initialized) return;

    let cancelled = false;
    const markReady = () => {
      if (!cancelled) {
        setRuntimeLayersReady(true);
      }
    };

    const win = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (typeof win.requestIdleCallback === 'function') {
      const idleId = win.requestIdleCallback(markReady, { timeout: 400 });
      return () => {
        cancelled = true;
        if (typeof win.cancelIdleCallback === 'function') {
          win.cancelIdleCallback(idleId);
        }
      };
    }

    const timer = window.setTimeout(markReady, 16);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [initialized]);

  useEffect(() => {
    if (!initialized) return;

    const timer = window.setTimeout(() => {
      preloadPrimaryRoutes();
    }, 320);

    return () => {
      window.clearTimeout(timer);
    };
  }, [initialized]);

  if (!initialized) {
    return <SplashScreen />;
  }

  return (
    <ErrorBoundary>
      <AppProvider>
        <StatusBarManager />
        <Router />
        {runtimeLayersReady ? (
          <Suspense fallback={null}>
            <NetworkStatus />
            <DynamicIsland />
            <InitToast />
            <InitDialog />
            <CommonsActionSheetContainer />
            <InitActionSheet />
            <InitImageViewer />
          </Suspense>
        ) : null}
      </AppProvider>
    </ErrorBoundary>
  );
};

export default App;
