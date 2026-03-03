import { describe, expect, it } from 'vitest';
import type { ServiceFactoryDeps } from '@sdkwork/react-mobile-core';
import type { FeedbackRecord } from '../types';
import { createFeedbackServiceWithSdk } from './FeedbackService';
import type { FeedbackSdkError, IFeedbackSdkService } from './FeedbackSdkService';

interface TestRuntime {
  deps: ServiceFactoryDeps;
}

function createTestRuntime(): TestRuntime {
  const runtimeStorage = new Map<string, unknown>();
  let sequence = 0;
  let now = 1710000000000;

  const deps: ServiceFactoryDeps = {
    storage: {
      get: <T>(key: string) => runtimeStorage.get(key) as T | null | undefined,
      set: <T>(key: string, value: T) => {
        runtimeStorage.set(key, value);
      },
      remove: (key: string) => {
        runtimeStorage.delete(key);
      },
    },
    eventBus: {
      emit: () => {
        // no-op for unit tests
      },
      on: () => () => {
        // no-op unsubscribe
      },
    },
    logger: {
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {},
    },
    clock: {
      now: () => now,
    },
    idGenerator: {
      next: (prefix?: string) => {
        sequence += 1;
        return `${prefix || 'id'}_${sequence}`;
      },
    },
    command: {
      execute: async () => ({ success: false, error: 'Command executor not configured' }),
    },
  };

  return { deps };
}

function createSdkStub(overrides?: Partial<IFeedbackSdkService>): IFeedbackSdkService {
  return {
    hasSdkBaseUrl: () => false,
    getLastError: () => null,
    submitFeedback: async () => null,
    listFeedback: async () => null,
    ...overrides,
  };
}

describe('FeedbackService', () => {
  it('falls back to local submit when sdk base url is not configured', async () => {
    const runtime = createTestRuntime();
    const service = createFeedbackServiceWithSdk(runtime.deps, createSdkStub());

    const created = await service.submitFeedback({
      type: 'bug',
      content: 'App freezes after opening settings.',
      contact: 'qa@example.com',
    });

    expect(created.id).toBe('feedback_1');
    expect(created.type).toBe('bug');
    expect(created.content).toBe('App freezes after opening settings.');
    expect(created.contact).toBe('qa@example.com');
    expect(created.status).toBe('submitted');

    const list = await service.getFeedbackList();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe('feedback_1');
  });

  it('uses sdk submit result when sdk base url is configured', async () => {
    const runtime = createTestRuntime();
    const remoteRecord: FeedbackRecord = {
      id: 'remote_1001',
      createTime: 1710000000123,
      updateTime: 1710000000123,
      type: 'suggestion',
      content: 'Please add markdown table support.',
      contact: 'pm@example.com',
      status: 'processing',
      submitTime: 1710000000123,
      processTime: 1710000000456,
    };

    const service = createFeedbackServiceWithSdk(
      runtime.deps,
      createSdkStub({
        hasSdkBaseUrl: () => true,
        submitFeedback: async () => remoteRecord,
      })
    );

    const created = await service.submitFeedback({
      type: 'suggestion',
      content: 'Please add markdown table support.',
      contact: 'pm@example.com',
    });

    expect(created.id).toBe('remote_1001');
    expect(created.status).toBe('processing');

    const list = await service.getFeedbackList();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe('remote_1001');
  });

  it('throws sdk error when sdk submit fails in sdk mode', async () => {
    const runtime = createTestRuntime();
    const sdkError: FeedbackSdkError = {
      code: '5001',
      message: 'Remote feedback submit failed',
    };

    const service = createFeedbackServiceWithSdk(
      runtime.deps,
      createSdkStub({
        hasSdkBaseUrl: () => true,
        getLastError: () => sdkError,
        submitFeedback: async () => null,
      })
    );

    await expect(
      service.submitFeedback({
        type: 'bug',
        content: 'Cannot submit payment order',
      })
    ).rejects.toThrow('Remote feedback submit failed');
  });

  it('rejects empty feedback content', async () => {
    const runtime = createTestRuntime();
    const service = createFeedbackServiceWithSdk(runtime.deps, createSdkStub());

    await expect(
      service.submitFeedback({
        type: 'bug',
        content: '   ',
      })
    ).rejects.toThrow('Feedback content is required');
  });
});
