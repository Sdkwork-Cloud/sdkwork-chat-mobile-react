import { eventBus } from '../events';
import { platformService } from '../platform/platformService';
import { getPlatform } from '../platform';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '../types';
import { generateId } from '../utils';
import { logger } from '../utils/logger';

const defaultRuntimeDeps: ServiceFactoryRuntimeDeps = {
  storage: {
    get: <T>(key: string) => getPlatform().storage.get<T>(key),
    set: <T>(key: string, value: T) => getPlatform().storage.set(key, value),
    remove: (key: string) => getPlatform().storage.remove(key),
  },
  eventBus: {
    emit: <T>(event: string, payload?: T) => {
      eventBus.emit(event, payload);
    },
    on: <T>(event: string, handler: (payload: T) => void) => eventBus.on(event, handler),
  },
  logger,
  clock: {
    now: () => Date.now(),
  },
  idGenerator: {
    next: (prefix?: string) => (prefix ? `${prefix}_${generateId()}` : generateId()),
  },
  command: {
    execute: async <T>(command: { type: string; payload?: unknown }) => {
      const maybeExecutor = (platformService as unknown as {
        execute?: <R>(input: { type: string; payload?: unknown }) => Promise<{ success: boolean; data?: R; error?: string }>;
      }).execute;
      if (typeof maybeExecutor !== 'function') {
        return { success: false, error: `Command executor not configured: ${command.type}` };
      }
      return maybeExecutor<T>(command);
    },
  },
};

/**
 * Build runtime dependencies for service factories with optional overrides.
 * Use this helper when a module starts consuming injected dependencies.
 */
export function createDefaultServiceFactoryRuntimeDeps(
  overrides: Partial<ServiceFactoryRuntimeDeps> = {},
): ServiceFactoryRuntimeDeps {
  return {
    storage: { ...defaultRuntimeDeps.storage, ...overrides.storage },
    eventBus: { ...defaultRuntimeDeps.eventBus, ...overrides.eventBus },
    logger: { ...defaultRuntimeDeps.logger, ...overrides.logger },
    clock: { ...defaultRuntimeDeps.clock, ...overrides.clock },
    idGenerator: { ...defaultRuntimeDeps.idGenerator, ...overrides.idGenerator },
    command: { ...defaultRuntimeDeps.command, ...overrides.command },
  };
}

export function resolveServiceFactoryRuntimeDeps(deps?: ServiceFactoryDeps): ServiceFactoryRuntimeDeps {
  return createDefaultServiceFactoryRuntimeDeps(deps);
}
