const memoryStore = new Map<string, string>();

const memoryStorage: Storage = {
  get length() {
    return memoryStore.size;
  },
  clear() {
    memoryStore.clear();
  },
  getItem(key: string): string | null {
    return memoryStore.has(key) ? memoryStore.get(key) || null : null;
  },
  key(index: number): string | null {
    return Array.from(memoryStore.keys())[index] || null;
  },
  removeItem(key: string): void {
    memoryStore.delete(key);
  },
  setItem(key: string, value: string): void {
    memoryStore.set(key, value);
  },
};

export const getPersistStorage = (): Storage => {
  if (typeof window === 'undefined') return memoryStorage;
  try {
    return window.localStorage;
  } catch {
    return memoryStorage;
  }
};
