import type { IPlatform, PaymentChannel } from './types';

const PAYMENT_CHANNELS: PaymentChannel[] = ['wechat_pay', 'alipay', 'apple_pay', 'google_pay', 'web', 'custom'];
const WRAPPER_METHODS = {
  device: ['getInfo', 'vibrate', 'getUUID'],
  storage: ['get', 'set', 'remove', 'clear', 'keys'],
  clipboard: ['read', 'write'],
  camera: ['takePhoto', 'pickPhoto', 'scanQRCode'],
  fileSystem: ['readFile', 'writeFile', 'deleteFile', 'fileExists', 'getDocumentsDir', 'showOpenDialog', 'showSaveDialog'],
  notifications: ['requestPermission', 'show', 'schedule', 'cancel'],
  push: ['isSupported', 'requestPermission', 'register', 'unregister', 'addListener'],
  payment: ['isSupported', 'launch'],
  share: ['share'],
  network: ['getStatus', 'addListener'],
  keyboard: ['show', 'hide', 'addListener'],
  statusBar: ['setStyle', 'setBackgroundColor', 'hide', 'show'],
  splashScreen: ['show', 'hide'],
  app: ['exit', 'minimize', 'addListener'],
} as const;

export type PlatformWrapperName = keyof typeof WRAPPER_METHODS;

export interface CapabilityCheckItem {
  integrated: boolean;
  detail: string;
}

export interface PaymentCapabilityCheck extends CapabilityCheckItem {
  supportedChannels: PaymentChannel[];
}

export interface WrapperCapabilityCheck extends CapabilityCheckItem {
  methods: string[];
}

export type PlatformWrapperCapabilityMap = Record<PlatformWrapperName, WrapperCapabilityCheck>;

export interface WrapperCapabilitySummary {
  ready: number;
  total: number;
}

export interface PlatformCapabilityReport {
  nativeRuntime: CapabilityCheckItem;
  network: CapabilityCheckItem;
  appLifecycle: CapabilityCheckItem;
  localNotifications: CapabilityCheckItem;
  pushNotifications: CapabilityCheckItem;
  payments: PaymentCapabilityCheck;
  wrappers: PlatformWrapperCapabilityMap;
  wrappersSummary: WrapperCapabilitySummary;
}

function runCheck(fn: () => boolean): boolean {
  try {
    return fn();
  } catch {
    return false;
  }
}

function inspectWrapper(
  name: PlatformWrapperName,
  candidate: unknown,
  methods: readonly string[],
): WrapperCapabilityCheck {
  const wrapped = candidate as Record<string, unknown> | undefined;
  const missingMethods = methods.filter((method) => typeof wrapped?.[method] !== 'function');
  if (!missingMethods.length) {
    return {
      integrated: true,
      detail: `${name} wrapper ready`,
      methods: [...methods],
    };
  }

  return {
    integrated: false,
    detail: `${name} wrapper missing methods: ${missingMethods.join(', ')}`,
    methods: [...methods],
  };
}

export function inspectPlatformCapabilities(platform: IPlatform): PlatformCapabilityReport {
  const wrappers = (Object.keys(WRAPPER_METHODS) as PlatformWrapperName[]).reduce<PlatformWrapperCapabilityMap>(
    (accumulator, name) => {
      const methods = WRAPPER_METHODS[name];
      const candidate = (platform as unknown as Record<string, unknown>)[name];
      accumulator[name] = inspectWrapper(name, candidate, methods);
      return accumulator;
    },
    {} as PlatformWrapperCapabilityMap,
  );
  const wrappersTotal = (Object.keys(WRAPPER_METHODS) as PlatformWrapperName[]).length;
  const wrappersReady = (Object.keys(wrappers) as PlatformWrapperName[]).reduce(
    (count, name) => count + (wrappers[name].integrated ? 1 : 0),
    0,
  );

  const networkReady = wrappers.network.integrated;
  const appLifecycleReady = wrappers.app.integrated;
  const localNotificationReady = wrappers.notifications.integrated;
  const pushBridgeReady = wrappers.push.integrated;
  const pushReady = pushBridgeReady && runCheck(() => Boolean(platform.push?.isSupported()));

  const supportedChannels = PAYMENT_CHANNELS.filter((channel) =>
    runCheck(() => Boolean(platform.payment?.isSupported(channel))),
  );

  return {
    nativeRuntime: {
      integrated: platform.isNative,
      detail: platform.isNative ? 'Native runtime detected' : 'Running in web runtime',
    },
    network: {
      integrated: networkReady,
      detail: networkReady ? 'Network status/listener bridge ready' : 'Network bridge not ready',
    },
    appLifecycle: {
      integrated: appLifecycleReady,
      detail: appLifecycleReady ? 'App lifecycle bridge ready' : 'App lifecycle bridge not ready',
    },
    localNotifications: {
      integrated: localNotificationReady,
      detail: localNotificationReady
        ? 'Local notifications bridge ready'
        : 'Local notifications bridge not ready',
    },
    pushNotifications: {
      integrated: pushReady,
      detail: pushReady
        ? 'Push notifications bridge is integrated'
        : 'Push notifications bridge is missing or disabled',
    },
    payments: {
      integrated: supportedChannels.length > 0,
      supportedChannels,
      detail:
        supportedChannels.length > 0
          ? `Payment bridge supports ${supportedChannels.length} channel(s)`
          : 'Payment bridge is missing or has no supported channels',
    },
    wrappers,
    wrappersSummary: {
      ready: wrappersReady,
      total: wrappersTotal,
    },
  };
}
