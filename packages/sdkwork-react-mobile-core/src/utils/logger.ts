/**
 * Simple logger utility
 */
export const logger = {
  info: (tag: string, message: string, ...args: any[]) => {
    console.log(`[${tag}] ${message}`, ...args);
  },
  warn: (tag: string, message: string, ...args: any[]) => {
    console.warn(`[${tag}] ${message}`, ...args);
  },
  error: (tag: string, message: string, ...args: any[]) => {
    console.error(`[${tag}] ${message}`, ...args);
  },
  debug: (tag: string, message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${tag}] ${message}`, ...args);
    }
  },
};
