
import type { CapacitorConfig } from '@capacitor/cli';

const capServerUrl = process.env.CAP_SERVER_URL?.trim();
const useNativeDevServer = Boolean(capServerUrl);

const config: CapacitorConfig = {
  appId: 'com.openchat.ai',
  appName: 'OpenChat',
  webDir: 'dist',
  server: useNativeDevServer
    ? {
        url: capServerUrl,
        cleartext: capServerUrl?.startsWith('http://') ?? false,
      }
    : undefined,
  ios: {
    contentInset: 'always',
    scrollEnabled: true,
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: useNativeDevServer,
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#ffffff',
    },
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: '#ffffff',
      androidSplashResourceName: 'splash',
    },
    Keyboard: {
      resize: 'body',
      style: 'DARK',
      resizeOnFullScreen: true,
    },
    Camera: {
      promptLabelHeader: '相机与相册权限',
      promptLabelPhoto: '从相册选择',
      promptLabelPicture: '拍照',
      promptLabelCancel: '取消',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#ffffff',
    },
  },
};

export default config;
