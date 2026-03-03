/**
 * Capacitor Platform Implementation
 * Implements platform interfaces for iOS/Android native environment
 */

import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Device } from '@capacitor/device';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Clipboard } from '@capacitor/clipboard';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Network } from '@capacitor/network';
import { Keyboard } from '@capacitor/keyboard';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Preferences } from '@capacitor/preferences';

// isCapacitorPlatform check is handled by Capacitor.isNativePlatform()

const LocalNotifications = {
  requestPermissions: async () => ({ granted: true }),
  register: async () => {},
  showNotifications: async () => {},
};

import type {
  IPlatform,
  PlatformType,
  IDevice,
  IStorage,
  IClipboard,
  ICamera,
  IFileSystem,
  INotifications,
  IShare,
  INetwork,
  IKeyboard,
  IStatusBar,
  ISplashScreen,
  IApp,
  DeviceInfo,
  SaveDialogOptions,
  NotificationOptions,
} from './types';

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
    throw new Error('QR Code scanning requires @capacitor-community/barcode-scanner');
  }
}

class CapacitorFileSystem implements IFileSystem {
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

  async showOpenDialog(): Promise<string[] | null> {
    throw new Error('File picker requires @capawesome/capacitor-file-picker');
  }

  async showSaveDialog(options: SaveDialogOptions): Promise<string | null> {
    return options.defaultPath ?? null;
  }
}

class CapacitorNotifications implements INotifications {
  async requestPermission(): Promise<boolean> {
    try {
      const result = await (LocalNotifications as any).requestPermissions();
      return result.granted === true;
    } catch {
      return true;
    }
  }

  async show(options: NotificationOptions): Promise<void> {
    try {
      await (LocalNotifications as any).showNotifications({
        notifications: [
          {
            title: options.title,
            body: options.body,
            id: Date.now(),
          },
        ],
      });
    } catch {}
  }

  async schedule(_options: NotificationOptions & { at: Date }): Promise<string> {
    const id = Date.now().toString();
    return id;
  }

  async cancel(id: string): Promise<void> {
    try {
      await (LocalNotifications as any).cancel({ notifications: [{ id: parseInt(id, 10) }] });
    } catch {}
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

  async addListener(_event: 'appStateChange', callback: (state: { isActive: boolean }) => void): Promise<() => void> {
    const listener = await App.addListener('appStateChange', ({ isActive }) => {
      callback({ isActive });
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
      await (LocalNotifications as any).requestPermissions();
    } catch {}
    console.log(`[Platform] Capacitor platform initialized (${this.type})`);
  }
}
