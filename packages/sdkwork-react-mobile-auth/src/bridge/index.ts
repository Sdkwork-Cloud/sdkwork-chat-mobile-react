import { platformService, logger } from '@sdkwork/react-mobile-core';
import type { SocialProvider } from '../types';

const TAG = 'AuthBridge';

/**
 * 认证桥接模块
 * 提供原生 Capacitor 认证功能支持
 */

/**
 * 初始化认证桥接
 */
export function initAuthBridge(): void {
  logger.info(TAG, 'Initializing auth bridge');
  
  // 注册社交登录处理器
  platformService.registerHandler('auth:social_login', async (payload: { provider: SocialProvider }) => {
    return handleSocialLogin(payload.provider);
  });

  // 注册生物识别登录处理器
  platformService.registerHandler('auth:biometric', async () => {
    return handleBiometricAuth();
  });

  logger.info(TAG, 'Auth bridge initialized');
}

/**
 * 处理社交登录
 */
async function handleSocialLogin(provider: SocialProvider): Promise<{ success: boolean; data?: { code: string; state?: string }; error?: string }> {
  logger.info(TAG, 'Handling social login', { provider });

  try {
    // 检查是否在 Capacitor 环境中
    if (!platformService.isNative()) {
      // Web 环境：打开 OAuth 弹窗
      const result = await openOAuthPopup(provider);
      return { success: true, data: result };
    }

    // Native 环境：使用 Capacitor 插件
    const result = await openNativeOAuth(provider);
    return { success: true, data: result };
  } catch (error) {
    logger.error(TAG, 'Social login failed', error);
    return { success: false, error: 'Social login failed' };
  }
}

/**
 * 打开 OAuth 弹窗（Web 环境）
 */
function openOAuthPopup(provider: SocialProvider): Promise<{ code: string; state?: string }> {
  return new Promise((resolve, reject) => {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const state = generateState();
    const authUrl = getOAuthUrl(provider, state);

    const popup = window.open(
      authUrl,
      `${provider}OAuth`,
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (!popup) {
      reject(new Error('Popup blocked'));
      return;
    }

    // 监听消息
    const messageHandler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'oauth:callback') {
        window.removeEventListener('message', messageHandler);
        popup.close();
        
        if (event.data.code) {
          resolve({ code: event.data.code, state: event.data.state });
        } else {
          reject(new Error(event.data.error || 'OAuth failed'));
        }
      }
    };

    window.addEventListener('message', messageHandler);

    // 超时处理
    setTimeout(() => {
      window.removeEventListener('message', messageHandler);
      popup.close();
      reject(new Error('OAuth timeout'));
    }, 120000);
  });
}

/**
 * 打开原生 OAuth（Capacitor 环境）
 */
async function openNativeOAuth(provider: SocialProvider): Promise<{ code: string; state?: string }> {
  // 这里应该调用 Capacitor 的 OAuth 插件
  // 例如：@capacitor-community/apple-sign-in 或自定义插件
  logger.info(TAG, 'Native OAuth', { provider });
  
  // 模拟实现
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ code: `mock_code_${provider}_${Date.now()}`, state: generateState() });
    }, 1000);
  });
}

/**
 * 处理生物识别认证
 */
async function handleBiometricAuth(): Promise<{ success: boolean; error?: string }> {
  logger.info(TAG, 'Handling biometric authentication');

  try {
    if (!platformService.isNative()) {
      return { success: false, error: 'Biometric auth not available in web' };
    }

    // 调用 Capacitor 生物识别插件
    // 例如：@capacitor-community/fingerprint-auth
    // 模拟实现
    return { success: true };
  } catch (error) {
    logger.error(TAG, 'Biometric auth failed', error);
    return { success: false, error: 'Biometric authentication failed' };
  }
}

/**
 * 生成 OAuth state
 */
function generateState(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * 获取 OAuth URL
 */
function getOAuthUrl(provider: SocialProvider, state: string): string {
  const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback`);
  
  switch (provider) {
    case 'github':
      return `https://github.com/login/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=${redirectUri}&state=${state}&scope=user:email`;
    case 'google':
      return `https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=${redirectUri}&state=${state}&scope=email profile&response_type=code`;
    case 'wechat':
      return `https://open.weixin.qq.com/connect/qrconnect?appid=YOUR_APP_ID&redirect_uri=${redirectUri}&state=${state}&scope=snsapi_login`;
    case 'apple':
      return `https://appleid.apple.com/auth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=${redirectUri}&state=${state}&scope=name email&response_type=code`;
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

/**
 * 检查生物识别是否可用
 */
export async function isBiometricAvailable(): Promise<boolean> {
  if (!platformService.isNative()) {
    return false;
  }
  
  // 调用 Capacitor 插件检查
  return false; // 模拟实现
}

/**
 * 请求生物识别认证
 */
export async function requestBiometricAuth(): Promise<boolean> {
  const result = await platformService.execute<{ success: boolean }>({
    type: 'auth:biometric',
  });
  
  return result.success ?? false;
}
