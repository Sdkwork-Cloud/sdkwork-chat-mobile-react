/**
 * Web Platform Implementation
 * Implements platform interfaces for browser environment
 */

import type {
  IPlatform,
  PlatformType,
  IDevice,
  IStorage,
  IClipboard,
  ICamera,
  IFileSystem,
  INotifications,
  IPush,
  IPayment,
  IShare,
  INetwork,
  IKeyboard,
  IStatusBar,
  ISplashScreen,
  IApp,
  KeyboardListenerEvent,
  DeviceInfo,
  OpenDialogOptions,
  SaveDialogOptions,
  NotificationOptions,
  PushPermissionState,
  PushRegistrationResult,
  PushListenerEvent,
  PaymentChannel,
  PaymentLaunchRequest,
  PaymentLaunchResult,
  AppListenerEvent,
  AppListenerPayloadMap,
} from './types';

class WebDevice implements IDevice {
  async getInfo(): Promise<DeviceInfo> {
    const platform = navigator.platform;

    return {
      model: 'Browser',
      manufacturer: 'Unknown',
      platform: platform,
      platformVersion: navigator.appVersion,
      osVersion: '',
      uuid: this.generateUUID(),
    };
  }

  async vibrate(pattern: number | number[]): Promise<void> {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }

  async getUUID(): Promise<string> {
    return this.generateUUID();
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

class WebStorage implements IStorage {
  async get<T>(key: string): Promise<T | null> {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    localStorage.setItem(key, JSON.stringify(value));
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    localStorage.clear();
  }

  async keys(): Promise<string[]> {
    return Object.keys(localStorage);
  }
}

class WebClipboard implements IClipboard {
  async read(): Promise<string> {
    return navigator.clipboard.readText();
  }

  async write(text: string): Promise<void> {
    await navigator.clipboard.writeText(text);
  }
}

class WebCamera implements ICamera {
  async takePhoto(): Promise<string> {
    throw new Error('Camera not supported in web platform. Use native app.');
  }

  async pickPhoto(): Promise<string> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = () => {
        const file = input.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        } else {
          reject(new Error('No file selected'));
        }
      };
      input.click();
    });
  }

  async scanQRCode(): Promise<string> {
    throw new Error('QR Code scanning not supported in web platform. Use native app.');
  }
}

class WebFileSystem implements IFileSystem {
  async readFile(path: string): Promise<string> {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to read file: ${path}`);
    }
    return response.text();
  }

  async writeFile(path: string, content: string): Promise<void> {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = path.split('/').pop() || 'file';
    a.click();
    URL.revokeObjectURL(url);
  }

  async deleteFile(): Promise<void> {
    throw new Error('File deletion not supported in web platform');
  }

  async fileExists(): Promise<boolean> {
    throw new Error('File exists check not supported in web platform');
  }

  async getDocumentsDir(): Promise<string> {
    return 'browser-downloads';
  }

  async showOpenDialog(options: OpenDialogOptions): Promise<string[] | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = options.multiple || false;
      
      if (options.filters) {
        input.accept = options.filters
          .flatMap(f => f.extensions.map(ext => `.${ext}`))
          .join(',');
      }

      input.onchange = () => {
        const files = Array.from(input.files || []);
        resolve(files.length > 0 ? files.map(f => f.name) : null);
      };

      input.click();
    });
  }

  async showSaveDialog(options: SaveDialogOptions): Promise<string | null> {
    return options.defaultPath ?? null;
  }
}

class WebNotifications implements INotifications {
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async show(options: NotificationOptions): Promise<void> {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(options.title, {
        body: options.body,
        icon: options.icon,
        data: options.data,
      });
    }
  }

  async schedule(options: NotificationOptions & { at: Date }): Promise<string> {
    const id = Date.now().toString();
    const delay = options.at.getTime() - Date.now();
    if (delay > 0) {
      setTimeout(() => this.show(options), delay);
    }
    return id;
  }

  async cancel(): Promise<void> {
    // Web notifications cannot be cancelled once scheduled
  }
}

class WebPush implements IPush {
  isSupported(): boolean {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return false;
    }
    const hasNotification = 'Notification' in window;
    const hasServiceWorker = 'serviceWorker' in navigator && Boolean(navigator.serviceWorker);
    const hasPushManager = 'PushManager' in globalThis;
    return hasNotification && hasServiceWorker && hasPushManager;
  }

  async requestPermission(): Promise<PushPermissionState> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') return 'granted';
      if (permission === 'denied') return 'denied';
      return 'prompt';
    }

    return Notification.permission === 'granted' ? 'granted' : 'denied';
  }

  async register(): Promise<PushRegistrationResult> {
    return {
      success: false,
      error: 'Push notifications require native runtime and @capacitor/push-notifications',
    };
  }

  async unregister(): Promise<void> {
    // No-op on web.
  }

  async addListener(_event: PushListenerEvent, _callback: (payload: unknown) => void): Promise<() => void> {
    // No-op on web.
    return () => {};
  }
}

class WebPayment implements IPayment {
  isSupported(channel?: PaymentChannel): boolean {
    if (channel === 'apple_pay' || channel === 'google_pay' || channel === 'web') {
      return typeof window !== 'undefined' && 'PaymentRequest' in window;
    }
    return typeof window !== 'undefined';
  }

  async launch(request: PaymentLaunchRequest): Promise<PaymentLaunchResult> {
    const paymentUrl = request.paymentUrl.trim();

    if (!paymentUrl) {
      return {
        success: false,
        status: 'failed',
        channel: request.channel,
        orderId: request.orderId,
        error: 'paymentUrl is required for payment launch',
      };
    }

    if (!this.isSupported(request.channel)) {
      return {
        success: false,
        status: 'unsupported',
        channel: request.channel,
        orderId: request.orderId,
        error: `${request.channel} is not supported on current web runtime`,
      };
    }

    try {
      window.location.assign(paymentUrl);
      return {
        success: true,
        status: 'launched',
        channel: request.channel,
        orderId: request.orderId,
      };
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        channel: request.channel,
        orderId: request.orderId,
        error: error instanceof Error ? error.message : 'Failed to launch payment URL',
      };
    }
  }
}

class WebShare implements IShare {
  async share(content: { title?: string; text?: string; url?: string; files?: string[] }): Promise<void> {
    if (navigator.share) {
      await navigator.share({
        title: content.title,
        text: content.text,
        url: content.url,
      });
    } else {
      throw new Error('Web Share API not supported');
    }
  }
}

class WebNetwork implements INetwork {
  async getStatus(): Promise<{ connected: boolean; connectionType: string }> {
    return {
      connected: navigator.onLine,
      connectionType: 'unknown',
    };
  }

  async addListener(callback: (status: { connected: boolean; connectionType: string }) => void): Promise<() => void> {
    const handleOnline = () => callback({ connected: true, connectionType: 'unknown' });
    const handleOffline = () => callback({ connected: false, connectionType: 'none' });
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }
}

class WebKeyboard implements IKeyboard {
  async show(): Promise<void> {
    // No-op on web
  }

  async hide(): Promise<void> {
    // Blur active element
    (document.activeElement as HTMLElement)?.blur();
  }

  async addListener(
    _event: KeyboardListenerEvent,
    _callback: (info: { keyboardHeight: number }) => void,
  ): Promise<() => void> {
    // No-op on web, return dummy cleanup
    return () => {};
  }
}

class WebStatusBar implements IStatusBar {
  async setStyle(style: 'light' | 'dark'): Promise<void> {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', style === 'dark' ? '#000000' : '#ffffff');
    }
  }

  async setBackgroundColor(color: string): Promise<void> {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', color);
    }
  }

  async hide(): Promise<void> {
    // Not supported on web
  }

  async show(): Promise<void> {
    // Not supported on web
  }
}

class WebSplashScreen implements ISplashScreen {
  async show(): Promise<void> {
    // No-op on web
  }

  async hide(): Promise<void> {
    // No-op on web
  }
}

class WebApp implements IApp {
  async exit(): Promise<void> {
    window.close();
  }

  async minimize(): Promise<void> {
    // Not supported on web
  }

  async getLaunchUrl(): Promise<{ url?: string | null }> {
    return { url: window.location.href };
  }

  async addListener<E extends AppListenerEvent>(
    event: E,
    callback: (payload: AppListenerPayloadMap[E]) => void,
  ): Promise<() => void> {
    if (event === 'appStateChange') {
      const handleVisibility = () => {
        callback({ isActive: document.visibilityState === 'visible' } as AppListenerPayloadMap[E]);
      };

      document.addEventListener('visibilitychange', handleVisibility);
      return () => document.removeEventListener('visibilitychange', handleVisibility);
    }

    const handleRouteChange = () => {
      callback({ url: window.location.href } as AppListenerPayloadMap[E]);
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }
}

export class WebPlatform implements IPlatform {
  type: PlatformType = 'web';
  isNative = false;
  isWeb = true;
  isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  isAndroid = /Android/.test(navigator.userAgent);
  isPWA = window.matchMedia('(display-mode: standalone)').matches;

  device = new WebDevice();
  storage = new WebStorage();
  clipboard = new WebClipboard();
  camera = new WebCamera();
  fileSystem = new WebFileSystem();
  notifications = new WebNotifications();
  push = new WebPush();
  payment = new WebPayment();
  share = new WebShare();
  network = new WebNetwork();
  keyboard = new WebKeyboard();
  statusBar = new WebStatusBar();
  splashScreen = new WebSplashScreen();
  app = new WebApp();

  async initialize(): Promise<void> {
    // Web platform doesn't need special initialization
    console.log('[Platform] Web platform initialized');
  }
}
