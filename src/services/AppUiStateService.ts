import type { ServiceFactoryDeps } from '@sdkwork/react-mobile-core';

export interface IAppUiStateService {
  getSessionValue(key: string): string | null;
  setSessionValue(key: string, value: string): void;
  clearAllBrowserStorage(): void;
  estimateLocalStorageUsage(): number;
}

class AppUiStateServiceImpl implements IAppUiStateService {
  constructor(_deps?: ServiceFactoryDeps) {
    void _deps;
  }

  getSessionValue(key: string): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return window.sessionStorage.getItem(key);
    } catch {
      return null;
    }
  }

  setSessionValue(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(key, value);
    } catch {
      // ignore write failure
    }
  }

  clearAllBrowserStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.clear();
      window.sessionStorage.clear();
    } catch {
      // ignore clear failure
    }
  }

  estimateLocalStorageUsage(): number {
    if (typeof window === 'undefined') return 0;

    try {
      let total = 0;
      for (let i = 0; i < window.localStorage.length; i += 1) {
        const key = window.localStorage.key(i);
        if (!key) continue;
        const value = window.localStorage.getItem(key) || '';
        total += (key.length + value.length) * 2;
      }
      return total;
    } catch {
      return 0;
    }
  }
}

export function createAppUiStateService(_deps?: ServiceFactoryDeps): IAppUiStateService {
  return new AppUiStateServiceImpl(_deps);
}

export const appUiStateService: IAppUiStateService = createAppUiStateService();
