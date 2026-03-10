import { platformService } from '@sdkwork/react-mobile-core';
import type {
  OAuthInteractionMode,
  OAuthInteractionRuntime,
  OAuthProviderDescriptor,
} from './oauthTypes';

export const resolveOAuthInteractionMode = (
  provider: OAuthProviderDescriptor,
  runtime: OAuthInteractionRuntime
): OAuthInteractionMode => {
  if (runtime.isNative) {
    if (runtime.isIOS && provider.modes.ios) return provider.modes.ios;
    if (runtime.isAndroid && provider.modes.android) return provider.modes.android;
    if (provider.modes.native) return provider.modes.native;
  }

  if (runtime.prefersRedirect && provider.modes.webMobile) {
    return provider.modes.webMobile;
  }

  return provider.modes.web;
};

export const resolveOAuthInteractionRuntime = (): OAuthInteractionRuntime => {
  const userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent || '';
  const isIOS = platformService.isIOS() || /iphone|ipad|ipod/i.test(userAgent);
  const isAndroid = platformService.isAndroid() || /android/i.test(userAgent);
  const isNative = platformService.isNative();

  return {
    platform: isNative ? 'native' : 'web',
    isNative,
    isIOS,
    isAndroid,
    prefersRedirect: !isNative && (isIOS || isAndroid),
  };
};
