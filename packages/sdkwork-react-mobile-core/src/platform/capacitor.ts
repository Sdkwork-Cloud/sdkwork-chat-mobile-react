/**
 * Capacitor Platform Implementation
 * Implements platform interfaces for iOS/Android native environment
 */

import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { AppLauncher } from '@capacitor/app-launcher';
import { Browser } from '@capacitor/browser';
import { Device } from '@capacitor/device';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Clipboard } from '@capacitor/clipboard';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { BarcodeFormat, BarcodeScanner, type PermissionStatus } from '@capacitor-mlkit/barcode-scanning';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Network } from '@capacitor/network';
import { Keyboard } from '@capacitor/keyboard';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Preferences } from '@capacitor/preferences';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';

// isCapacitorPlatform check is handled by Capacitor.isNativePlatform()

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
  DeviceInfo,
  OpenDialogOptions,
  SaveDialogOptions,
  NotificationOptions,
  PushPermissionState,
  PushListenerEvent,
  PushRegistrationResult,
  PaymentChannel,
  PaymentLaunchRequest,
  PaymentLaunchResult,
  AppListenerEvent,
  AppListenerPayloadMap,
} from './types';
import { normalizePickedFiles, toFilePickerTypes } from './filePicker';

const PAYMENT_SUPPORTED_CHANNELS: ReadonlySet<PaymentChannel> = new Set([
  'wechat_pay',
  'alipay',
  'apple_pay',
  'google_pay',
  'custom',
]);

function normalizePushPermissionState(value: string | undefined): PushPermissionState {
  if (value === 'granted') return 'granted';
  if (value === 'denied') return 'denied';
  return 'prompt';
}

function createNotificationId(): number {
  // Capacitor local notification id is an integer. Keep it stable and bounded.
  return Number(String(Date.now()).slice(-9));
}

interface FilePickerPickedFile {
  path?: string | null;
  uri?: string | null;
  name?: string | null;
}

interface FilePickerResult {
  files?: FilePickerPickedFile[];
}

interface FilePickerPluginLike {
  pickFiles(options?: {
    types?: string[];
    multiple?: boolean;
    readData?: boolean;
  }): Promise<FilePickerResult>;
}

class CapacitorDevice implements IDevice {
  async getInfo(): Promise<DeviceInfo> {
    const info = await Device.getInfo();
    const id = await Device.getId();
    
    return {
      model: info.model || 'Unknown',
      manufacturer: info.manufacturer || 'Unknown',
      platform: info.platform || 'unknown',
      platformVersion: info.osVersion || '',
      osVersion: info.osVersion || '',
      uuid: id.identifier || '',
    };
  }

  async vibrate(_pattern: number | number[]): Promise<void> {
    await Haptics.impact({ style: ImpactStyle.Light });
  }

  async getUUID(): Promise<string> {
    const id = await Device.getId();
    return id.identifier || '';
  }
}

class CapacitorStorage implements IStorage {
  async get<T>(key: string): Promise<T | null> {
    const { value } = await Preferences.get({ key });
    return value ? JSON.parse(value) : null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    await Preferences.set({ key, value: JSON.stringify(value) });
  }

  async remove(key: string): Promise<void> {
    await Preferences.remove({ key });
  }

  async clear(): Promise<void> {
    await Preferences.clear();
  }

  async keys(): Promise<string[]> {
    const { keys } = await Preferences.keys();
    return keys;
  }
}

class CapacitorClipboard implements IClipboard {
  async read(): Promise<string> {
    const { value } = await Clipboard.read();
    return value || '';
  }

  async write(text: string): Promise<void> {
    await Clipboard.write({ string: text });
  }
}

class CapacitorCamera implements ICamera {
  private async ensureScannerSupported(): Promise<void> {
    const support = await BarcodeScanner.isSupported();
    if (!support.supported) {
      throw new Error('QR scanner not supported on this device');
    }
  }

  private async ensureScannerPermission(): Promise<void> {
    const current: PermissionStatus = await BarcodeScanner.checkPermissions();
    if (current.camera === 'granted') {
      return;
    }

    const requested: PermissionStatus = await BarcodeScanner.requestPermissions();
    if (requested.camera !== 'granted') {
      throw new Error('Camera permission denied for QR scanning');
    }
  }

  async takePhoto(): Promise<string> {
    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
    });
    return photo.webPath || '';
  }

  async pickPhoto(): Promise<string> {
    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos,
    });
    return photo.webPath || '';
  }

  async scanQRCode(): Promise<string> {
    try {
      await this.ensureScannerSupported();
      await this.ensureScannerPermission();

      const result = await BarcodeScanner.scan({
        formats: [BarcodeFormat.QrCode],
      });

      const firstBarcode = result.barcodes?.[0];
      const content = (firstBarcode?.rawValue || firstBarcode?.displayValue || '').trim();
      if (!content) {
        throw new Error('No QR content detected');
      }
      return content;
    } catch (error) {
      const message = error instanceof Error ? error.message.toLowerCase() : '';
      if (
        message.includes('not implemented')
        || message.includes('plugin is not implemented')
        || message.includes('missing')
      ) {
        throw new Error('QR scanner plugin is missing. Install @capacitor-mlkit/barcode-scanning and sync native.');
      }
      throw error;
    }
  }
}

class CapacitorFileSystem implements IFileSystem {
  private async loadFilePicker(): Promise<FilePickerPluginLike> {
    const module = await import('@capawesome/capacitor-file-picker').catch(() => null);
    const filePicker = (module as { FilePicker?: FilePickerPluginLike } | null)?.FilePicker;
    if (!filePicker) {
      throw new Error(
        'File picker plugin is missing. Install @capawesome/capacitor-file-picker and sync native.',
      );
    }
    return filePicker;
  }

  async readFile(path: string): Promise<string> {
    const result = await Filesystem.readFile({
      path,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });
    return result.data as string;
  }

  async writeFile(path: string, content: string): Promise<void> {
    await Filesystem.writeFile({
      path,
      data: content,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
      recursive: true,
    });
  }

  async deleteFile(path: string): Promise<void> {
    await Filesystem.deleteFile({
      path,
      directory: Directory.Documents,
    });
  }

  async fileExists(path: string): Promise<boolean> {
    try {
      await Filesystem.stat({
        path,
        directory: Directory.Documents,
      });
      return true;
    } catch {
      return false;
    }
  }

  async getDocumentsDir(): Promise<string> {
    return Directory.Documents;
  }

  async showOpenDialog(options: OpenDialogOptions): Promise<string[] | null> {
    const filePicker = await this.loadFilePicker();
    const result = await filePicker.pickFiles({
      multiple: options.multiple ?? false,
      types: toFilePickerTypes(options.filters),
      readData: false,
    });
    return normalizePickedFiles(result.files);
  }

  async showSaveDialog(options: SaveDialogOptions): Promise<string | null> {
    return options.defaultPath ?? null;
  }
}

class CapacitorNotifications implements INotifications {
  async requestPermission(): Promise<boolean> {
    try {
      const result = await LocalNotifications.requestPermissions();
      const display = (result as { display?: string }).display;
      if (display) {
        return display === 'granted';
      }
      return (result as { granted?: boolean }).granted === true;
    } catch {
      return false;
    }
  }

  async show(options: NotificationOptions): Promise<void> {
    const id = createNotificationId();
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: options.title,
            body: options.body,
            id,
            schedule: { at: new Date() },
            extra: options.data,
            smallIcon: options.icon,
          },
        ],
      });
    } catch (error) {
      console.warn('[Platform] Failed to show local notification', error);
    }
  }

  async schedule(options: NotificationOptions & { at: Date }): Promise<string> {
    const id = createNotificationId();
    await LocalNotifications.schedule({
      notifications: [
        {
          id,
          title: options.title,
          body: options.body,
          schedule: { at: options.at },
          extra: options.data,
          smallIcon: options.icon,
        },
      ],
    });
    return id.toString();
  }

  async cancel(id: string): Promise<void> {
    const parsed = Number.parseInt(id, 10);
    if (Number.isNaN(parsed)) return;
    await LocalNotifications.cancel({ notifications: [{ id: parsed }] });
  }
}

class CapacitorPush implements IPush {
  isSupported(): boolean {
    return Capacitor.isNativePlatform();
  }

  async requestPermission(): Promise<PushPermissionState> {
    try {
      const current = await PushNotifications.checkPermissions();
      if (current.receive === 'prompt') {
        const requested = await PushNotifications.requestPermissions();
        return normalizePushPermissionState(requested.receive);
      }
      return normalizePushPermissionState(current.receive);
    } catch {
      return 'denied';
    }
  }

  async register(): Promise<PushRegistrationResult> {
    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      return {
        success: false,
        error: 'Push permission is not granted',
      };
    }

    return new Promise((resolve) => {
      let settled = false;
      let timeoutId: number | null = null;

      const settle = (result: PushRegistrationResult) => {
        if (settled) return;
        settled = true;
        if (timeoutId !== null) {
          window.clearTimeout(timeoutId);
        }
        cleanup();
        resolve(result);
      };

      let removeRegistered: (() => void) | null = null;
      let removeError: (() => void) | null = null;

      const cleanup = () => {
        removeRegistered?.();
        removeError?.();
      };

      Promise.all([
        PushNotifications.addListener('registration', (token: { value: string }) => {
          settle({
            success: true,
            token: token.value,
          });
        }),
        PushNotifications.addListener('registrationError', (error: { error?: string }) => {
          settle({
            success: false,
            error: error.error || 'Push registration failed',
          });
        }),
      ])
        .then(([registrationListener, registrationErrorListener]) => {
          removeRegistered = () => registrationListener.remove();
          removeError = () => registrationErrorListener.remove();
          PushNotifications.register().catch((error: unknown) => {
            settle({
              success: false,
              error: error instanceof Error ? error.message : 'Push registration failed',
            });
          });
        })
        .catch((error: unknown) => {
          settle({
            success: false,
            error: error instanceof Error ? error.message : 'Push listener setup failed',
          });
        });

      timeoutId = window.setTimeout(() => {
        settle({
          success: false,
          error: 'Push registration timeout',
        });
      }, 10000);
    });
  }

  async unregister(): Promise<void> {
    const plugin = PushNotifications as unknown as { unregister?: () => Promise<void> };
    if (typeof plugin.unregister === 'function') {
      await plugin.unregister();
      return;
    }
    await PushNotifications.removeAllListeners();
  }

  async addListener(event: PushListenerEvent, callback: (payload: unknown) => void): Promise<() => void> {
    const listener = await (PushNotifications as any).addListener(event, (payload: unknown) => callback(payload));
    return () => listener.remove();
  }
}

class CapacitorPayment implements IPayment {
  isSupported(channel?: PaymentChannel): boolean {
    if (!channel) {
      return true;
    }
    return PAYMENT_SUPPORTED_CHANNELS.has(channel);
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
        error: `${request.channel} is not supported on current native runtime`,
      };
    }

    try {
      if (/^https?:\/\//i.test(paymentUrl)) {
        await Browser.open({
          url: paymentUrl,
          presentationStyle: 'fullscreen',
        });
      } else {
        await AppLauncher.openUrl({ url: paymentUrl });
      }
      return {
        success: true,
        status: 'launched',
        channel: request.channel,
        orderId: request.orderId,
      };
    } catch (error) {
      if (request.returnUrl) {
        try {
          await AppLauncher.openUrl({ url: request.returnUrl });
        } catch {
          // Ignore fallback URL open errors and return the original payment launch error.
        }
      }

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

class CapacitorShare implements IShare {
  async share(content: { title?: string; text?: string; url?: string; files?: string[] }): Promise<void> {
    await Share.share({
      title: content.title,
      text: content.text,
      url: content.url,
      files: content.files,
    });
  }
}

class CapacitorNetwork implements INetwork {
  async getStatus(): Promise<{ connected: boolean; connectionType: string }> {
    const status = await Network.getStatus();
    return {
      connected: status.connected,
      connectionType: status.connectionType,
    };
  }

  async addListener(callback: (status: { connected: boolean; connectionType: string }) => void): Promise<() => void> {
    const listener = await Network.addListener('networkStatusChange', (status) => {
      callback({
        connected: status.connected,
        connectionType: status.connectionType,
      });
    });
    return () => listener.remove();
  }
}

class CapacitorKeyboard implements IKeyboard {
  async show(): Promise<void> {
    // Keyboard shows automatically when focusing input
  }

  async hide(): Promise<void> {
    await Keyboard.hide();
  }

  async addListener(
    event: 'keyboardWillShow' | 'keyboardWillHide',
    callback: (info: { keyboardHeight: number }) => void
  ): Promise<() => void> {
    try {
      if (event === 'keyboardWillShow') {
        const listener = await Keyboard.addListener('keyboardDidShow', callback as any);
        return () => listener.remove();
      } else {
        const listener = await Keyboard.addListener('keyboardDidHide', callback as any);
        return () => listener.remove();
      }
    } catch {
      return () => {};
    }
  }
}

class CapacitorStatusBar implements IStatusBar {
  async setStyle(style: 'light' | 'dark'): Promise<void> {
    await StatusBar.setStyle({ style: style === 'dark' ? Style.Dark : Style.Light });
  }

  async setBackgroundColor(color: string): Promise<void> {
    await StatusBar.setBackgroundColor({ color });
  }

  async hide(): Promise<void> {
    await StatusBar.hide();
  }

  async show(): Promise<void> {
    await StatusBar.show();
  }
}

class CapacitorSplashScreen implements ISplashScreen {
  async show(): Promise<void> {
    await SplashScreen.show();
  }

  async hide(): Promise<void> {
    await SplashScreen.hide();
  }
}

class CapacitorApp implements IApp {
  async exit(): Promise<void> {
    await App.exitApp();
  }

  async minimize(): Promise<void> {
    await App.exitApp();
  }

  async addListener<E extends AppListenerEvent>(
    event: E,
    callback: (payload: AppListenerPayloadMap[E]) => void,
  ): Promise<() => void> {
    if (event === 'appStateChange') {
      const listener = await App.addListener('appStateChange', ({ isActive }) => {
        callback({ isActive } as AppListenerPayloadMap[E]);
      });
      return () => listener.remove();
    }

    const listener = await App.addListener('appUrlOpen', ({ url }) => {
      callback({ url } as AppListenerPayloadMap[E]);
    });
    return () => listener.remove();
  }
}

export class CapacitorPlatform implements IPlatform {
  type: PlatformType;
  isNative = true;
  isWeb = false;
  isIOS: boolean;
  isAndroid: boolean;
  isPWA = false;

  device = new CapacitorDevice();
  storage = new CapacitorStorage();
  clipboard = new CapacitorClipboard();
  camera = new CapacitorCamera();
  fileSystem = new CapacitorFileSystem();
  notifications = new CapacitorNotifications();
  push = new CapacitorPush();
  payment = new CapacitorPayment();
  share = new CapacitorShare();
  network = new CapacitorNetwork();
  keyboard = new CapacitorKeyboard();
  statusBar = new CapacitorStatusBar();
  splashScreen = new CapacitorSplashScreen();
  app = new CapacitorApp();

  constructor() {
    this.isIOS = Capacitor.getPlatform() === 'ios';
    this.isAndroid = Capacitor.getPlatform() === 'android';
    this.type = this.isIOS ? 'ios' : this.isAndroid ? 'android' : 'web';
  }

  async initialize(): Promise<void> {
    await Camera.requestPermissions();
    try {
      await LocalNotifications.requestPermissions();
      await PushNotifications.checkPermissions();
    } catch (error) {
      console.warn('[Platform] Failed to preflight notification permissions', error);
    }
    console.log(`[Platform] Capacitor platform initialized (${this.type})`);
  }
}
