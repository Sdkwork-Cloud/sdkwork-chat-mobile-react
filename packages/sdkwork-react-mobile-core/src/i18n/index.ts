/**
 * Internationalization module
 * Maintained for package-level compatibility.
 */

import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';

export type Locale = 'zh-CN' | 'en-US';

export interface TranslationResources {
  common: Record<string, string>;
  chat: Record<string, string>;
  user: Record<string, string>;
  settings: Record<string, string>;
  commerce: Record<string, string>;
  social: Record<string, string>;
  agent: Record<string, string>;
  tools: Record<string, string>;
  layout: Record<string, string>;
  components: Record<string, string>;
}

const zhCN: TranslationResources = {
  common: {
    confirm: '确定',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    loading: '加载中...',
    retry: '重试',
    close: '关闭',
    back: '返回',
    next: '下一步',
    search: '搜索',
    noData: '暂无数据',
    error: '出错了',
    success: '成功',
    warning: '警告',
    info: '提示',
  },
  chat: {
    sendMessage: '发送消息',
    inputPlaceholder: '输入消息...',
    voiceInput: '语音输入',
    imageUpload: '发送图片',
    fileUpload: '发送文件',
    emoji: '表情',
    more: '更多',
    messageDeleted: '消息已删除',
    messageRecalled: '消息已撤回',
    typing: '对方正在输入...',
    newMessage: '新消息',
  },
  user: {
    profile: '个人资料',
    settings: '设置',
    logout: '退出登录',
    login: '登录',
    register: '注册',
    username: '用户名',
    nickname: '昵称',
    avatar: '头像',
    email: '邮箱',
    phone: '手机号',
    password: '密码',
    confirmPassword: '确认密码',
  },
  settings: {
    general: '通用设置',
    theme: '主题',
    language: '语言',
    notifications: '通知',
    privacy: '隐私',
    about: '关于',
    version: '版本',
    lightTheme: '浅色主题',
    darkTheme: '深色主题',
    autoTheme: '跟随系统',
  },
  commerce: {
    cart: '购物车',
    order: '订单',
    payment: '支付',
    product: '商品',
    price: '价格',
    quantity: '数量',
    total: '总计',
    checkout: '结算',
    addToCart: '加入购物车',
    buyNow: '立即购买',
  },
  social: {
    moments: '朋友圈',
    favorites: '收藏',
    like: '点赞',
    comment: '评论',
    share: '分享',
    follow: '关注',
    followers: '粉丝',
  },
  agent: {
    agents: '智能体',
    createAgent: '创建智能体',
    myAgents: '我的智能体',
    agentStore: '智能体商店',
  },
  tools: {
    scan: '扫一扫',
    scanQRCode: '扫描二维码',
    shake: '摇一摇',
    nearby: '附近的人',
  },
  layout: {
    home: '首页',
    chat: '聊天',
    discover: '发现',
    me: '我的',
  },
  components: {
    pullToRefresh: '下拉刷新',
    releaseToRefresh: '松开刷新',
    refreshing: '刷新中...',
    loadMore: '加载更多',
    noMore: '没有更多了',
  },
};

const enUS: TranslationResources = {
  common: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    loading: 'Loading...',
    retry: 'Retry',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    search: 'Search',
    noData: 'No data',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Info',
  },
  chat: {
    sendMessage: 'Send Message',
    inputPlaceholder: 'Type a message...',
    voiceInput: 'Voice Input',
    imageUpload: 'Send Image',
    fileUpload: 'Send File',
    emoji: 'Emoji',
    more: 'More',
    messageDeleted: 'Message deleted',
    messageRecalled: 'Message recalled',
    typing: 'Typing...',
    newMessage: 'New message',
  },
  user: {
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Logout',
    login: 'Login',
    register: 'Register',
    username: 'Username',
    nickname: 'Nickname',
    avatar: 'Avatar',
    email: 'Email',
    phone: 'Phone',
    password: 'Password',
    confirmPassword: 'Confirm Password',
  },
  settings: {
    general: 'General',
    theme: 'Theme',
    language: 'Language',
    notifications: 'Notifications',
    privacy: 'Privacy',
    about: 'About',
    version: 'Version',
    lightTheme: 'Light',
    darkTheme: 'Dark',
    autoTheme: 'Auto',
  },
  commerce: {
    cart: 'Cart',
    order: 'Order',
    payment: 'Payment',
    product: 'Product',
    price: 'Price',
    quantity: 'Quantity',
    total: 'Total',
    checkout: 'Checkout',
    addToCart: 'Add to Cart',
    buyNow: 'Buy Now',
  },
  social: {
    moments: 'Moments',
    favorites: 'Favorites',
    like: 'Like',
    comment: 'Comment',
    share: 'Share',
    follow: 'Follow',
    followers: 'Followers',
  },
  agent: {
    agents: 'Agents',
    createAgent: 'Create Agent',
    myAgents: 'My Agents',
    agentStore: 'Agent Store',
  },
  tools: {
    scan: 'Scan',
    scanQRCode: 'Scan QR Code',
    shake: 'Shake',
    nearby: 'Nearby',
  },
  layout: {
    home: 'Home',
    chat: 'Chat',
    discover: 'Discover',
    me: 'Me',
  },
  components: {
    pullToRefresh: 'Pull to refresh',
    releaseToRefresh: 'Release to refresh',
    refreshing: 'Refreshing...',
    loadMore: 'Load more',
    noMore: 'No more data',
  },
};

const resources: Record<Locale, TranslationResources> = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextType | null>(null);

export interface I18nProviderProps {
  children: ReactNode;
  defaultLocale?: Locale;
}

export function I18nProvider({ children, defaultLocale = 'zh-CN' }: I18nProviderProps): JSX.Element {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    document.documentElement.lang = newLocale;
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const [namespace, translationKey] = key.split('.');
    const translations = resources[locale];
    if (!translations || !(namespace in translations)) return key;
    const value = (translations as Record<string, Record<string, string>>)[namespace]?.[translationKey];
    if (!value) return key;

    if (!params) {
      return value;
    }

    return Object.entries(params).reduce(
      (output, [paramKey, paramValue]) =>
        output.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue)),
      value
    );
  }, [locale]);

  const value: I18nContextType = { locale, setLocale, t, isRTL: false };
  return React.createElement(I18nContext.Provider, { value }, children);
}

export function useTranslation(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useTranslation must be used within I18nProvider');
  return context;
}

export function getSupportedLocales(): Locale[] {
  return Object.keys(resources) as Locale[];
}

export function isValidLocale(locale: string): locale is Locale {
  return locale in resources;
}

export function detectLocale(): Locale {
  const browserLang = navigator.language;
  if (isValidLocale(browserLang)) return browserLang;
  const langPrefix = browserLang.split('-')[0];
  if (langPrefix === 'zh') return 'zh-CN';
  if (langPrefix === 'en') return 'en-US';
  return 'zh-CN';
}
