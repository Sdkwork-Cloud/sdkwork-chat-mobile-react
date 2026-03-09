/**
 * Platform Abstraction Layer - Type Definitions
 * Defines interfaces for platform-specific capabilities
 */

export type PlatformType = 'web' | 'ios' | 'android' | 'pwa';

export interface DeviceInfo {
  model: string;
  manufacturer: string;
  platform: string;
  platformVersion: string;
  osVersion: string;
  uuid: string;
}

export interface FileFilter {
  name: string;
  extensions: string[];
}

export interface OpenDialogOptions {
  title?: string;
  defaultPath?: string;
  filters?: FileFilter[];
  multiple?: boolean;
}

export interface SaveDialogOptions {
  title?: string;
  defaultPath?: string;
  filters?: FileFilter[];
}

export interface MessageBoxOptions {
  type: 'info' | 'warning' | 'error' | 'question';
  title: string;
  message: string;
  buttons?: string[];
}

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, unknown>;
}

export interface IDevice {
  getInfo(): Promise<DeviceInfo>;
  vibrate(pattern: number | number[]): Promise<void>;
  getUUID(): Promise<string>;
}

export interface IStorage {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
}

export interface IClipboard {
  read(): Promise<string>;
  write(text: string): Promise<void>;
}

export interface ICamera {
  takePhoto(): Promise<string>;
  pickPhoto(): Promise<string>;
  scanQRCode(): Promise<string>;
}

export interface IFileSystem {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  deleteFile(path: string): Promise<void>;
  fileExists(path: string): Promise<boolean>;
  getDocumentsDir(): Promise<string>;
  showOpenDialog(options: OpenDialogOptions): Promise<string[] | null>;
  showSaveDialog(options: SaveDialogOptions): Promise<string | null>;
}

export interface INotifications {
  requestPermission(): Promise<boolean>;
  show(options: NotificationOptions): Promise<void>;
  schedule(options: NotificationOptions & { at: Date }): Promise<string>;
  cancel(id: string): Promise<void>;
}

export type PushPermissionState = 'granted' | 'denied' | 'prompt';
export type PushListenerEvent =
  | 'registration'
  | 'registrationError'
  | 'pushNotificationReceived'
  | 'pushNotificationActionPerformed';

export interface PushRegistrationResult {
  success: boolean;
  token?: string;
  error?: string;
}

export interface IPush {
  isSupported(): boolean;
  requestPermission(): Promise<PushPermissionState>;
  register(): Promise<PushRegistrationResult>;
  unregister(): Promise<void>;
  addListener(event: PushListenerEvent, callback: (payload: unknown) => void): Promise<() => void>;
}

export type PaymentChannel = 'wechat_pay' | 'alipay' | 'apple_pay' | 'google_pay' | 'web' | 'custom';
export type PaymentLaunchStatus = 'launched' | 'failed' | 'unsupported';

export interface PaymentLaunchRequest {
  channel: PaymentChannel;
  orderId: string;
  amount: number;
  paymentUrl: string;
  currency?: string;
  returnUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentLaunchResult {
  success: boolean;
  status: PaymentLaunchStatus;
  channel: PaymentChannel;
  orderId: string;
  error?: string;
}

export interface IPayment {
  isSupported(channel?: PaymentChannel): boolean;
  launch(request: PaymentLaunchRequest): Promise<PaymentLaunchResult>;
}

export interface IShare {
  share(content: { title?: string; text?: string; url?: string; files?: string[] }): Promise<void>;
}

export interface INetwork {
  getStatus(): Promise<{ connected: boolean; connectionType: string }>;
  addListener(callback: (status: { connected: boolean; connectionType: string }) => void): Promise<() => void>;
}

export type KeyboardListenerEvent =
  | 'keyboardWillShow'
  | 'keyboardWillHide'
  | 'keyboardDidShow'
  | 'keyboardDidHide';

export interface IKeyboard {
  show(): Promise<void>;
  hide(): Promise<void>;
  addListener(event: KeyboardListenerEvent, callback: (info: { keyboardHeight: number }) => void): Promise<() => void>;
}

export interface IStatusBar {
  setStyle(style: 'light' | 'dark'): Promise<void>;
  setBackgroundColor(color: string): Promise<void>;
  hide(): Promise<void>;
  show(): Promise<void>;
}

export interface ISplashScreen {
  show(): Promise<void>;
  hide(): Promise<void>;
}

export interface AppStateChangePayload {
  isActive: boolean;
}

export interface AppUrlOpenPayload {
  url: string;
}

export interface AppLaunchUrlResult {
  url?: string | null;
}

export type AppListenerEvent = 'appStateChange' | 'appUrlOpen';

export interface AppListenerPayloadMap {
  appStateChange: AppStateChangePayload;
  appUrlOpen: AppUrlOpenPayload;
}

export interface IApp {
  exit(): Promise<void>;
  minimize(): Promise<void>;
  getLaunchUrl?(): Promise<AppLaunchUrlResult>;
  addListener<E extends AppListenerEvent>(
    event: E,
    callback: (payload: AppListenerPayloadMap[E]) => void,
  ): Promise<() => void>;
}

export interface IPlatform {
  type: PlatformType;
  isNative: boolean;
  isWeb: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isPWA: boolean;
  
  initialize(): Promise<void>;
  
  device: IDevice;
  storage: IStorage;
  clipboard: IClipboard;
  camera: ICamera;
  fileSystem: IFileSystem;
  notifications: INotifications;
  push: IPush;
  payment: IPayment;
  share: IShare;
  network: INetwork;
  keyboard: IKeyboard;
  statusBar: IStatusBar;
  splashScreen: ISplashScreen;
  app: IApp;
}
