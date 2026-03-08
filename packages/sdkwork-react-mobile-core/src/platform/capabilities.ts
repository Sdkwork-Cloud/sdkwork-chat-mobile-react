import type { IPlatform, PaymentChannel } from './types';

const PAYMENT_CHANNELS: PaymentChannel[] = ['wechat_pay', 'alipay', 'apple_pay', 'google_pay', 'web', 'custom'];

export interface CapabilityCheckItem {
  integrated: boolean;
  detail: string;
}

export interface PaymentCapabilityCheck extends CapabilityCheckItem {
  supportedChannels: PaymentChannel[];
}

export interface PlatformCapabilityReport {
  nativeRuntime: CapabilityCheckItem;
  network: CapabilityCheckItem;
  appLifecycle: CapabilityCheckItem;
  localNotifications: CapabilityCheckItem;
  pushNotifications: CapabilityCheckItem;
  payments: PaymentCapabilityCheck;
}

function runCheck(fn: () => boolean): boolean {
  try {
    return fn();
  } catch {
    return false;
  }
}

export function inspectPlatformCapabilities(platform: IPlatform): PlatformCapabilityReport {
  const networkReady = runCheck(
    () => typeof platform.network.getStatus === 'function' && typeof platform.network.addListener === 'function',
  );
  const appLifecycleReady = runCheck(
    () => typeof platform.app.addListener === 'function' && typeof platform.app.exit === 'function',
  );
  const localNotificationReady = runCheck(
    () =>
      typeof platform.notifications.requestPermission === 'function' &&
      typeof platform.notifications.show === 'function' &&
      typeof platform.notifications.schedule === 'function' &&
      typeof platform.notifications.cancel === 'function',
  );
  const pushReady = runCheck(() => Boolean(platform.push?.isSupported()));

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
  };
}
