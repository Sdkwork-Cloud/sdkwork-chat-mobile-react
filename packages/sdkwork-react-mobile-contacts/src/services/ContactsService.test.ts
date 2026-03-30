import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const sdk = {
    contacts: {
      list: vi.fn(),
      get: vi.fn(),
      search: vi.fn(),
      setRemark: vi.fn(),
      delete: vi.fn(),
    },
    friends: {
      requests: vi.fn(),
      request: vi.fn(),
      accept: vi.fn(),
      reject: vi.fn(),
    },
  };

  return {
    getAppImSdk: vi.fn(() => sdk),
    getAppImSessionIdentity: vi.fn(() => ({ userId: 'current-user' })),
    sdk,
  };
});

vi.mock('@sdkwork/react-mobile-core', () => ({
  resolveServiceFactoryRuntimeDeps: <T>(deps: T) => deps,
}));

vi.mock('@sdkwork/react-mobile-core/im', () => ({
  getAppImSdk: mocks.getAppImSdk,
  getAppImSessionIdentity: mocks.getAppImSessionIdentity,
}));

function createDeps() {
  const store = new Map<string, unknown>();

  return {
    storage: {
      get: vi.fn((key: string) => store.get(key)),
      set: vi.fn((key: string, value: unknown) => {
        store.set(key, value);
      }),
      remove: vi.fn((key: string) => {
        store.delete(key);
      }),
    },
    eventBus: {
      emit: vi.fn(),
      on: vi.fn(() => () => undefined),
    },
    logger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    },
    clock: {
      now: vi.fn(() => 1_710_000_000_000),
    },
    idGenerator: {
      next: vi.fn((prefix?: string) => `${prefix || 'id'}-1`),
    },
    command: {
      execute: vi.fn(),
    },
  };
}

describe('ContactsService IM integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads contacts through IM contacts.list and normalizes them', async () => {
    mocks.sdk.contacts.list.mockResolvedValue({
      data: [
        {
          id: 'contact-1',
          nickname: 'Alice',
          userId: 'alice',
          avatar: 'https://example.com/alice.png',
          region: 'CN',
        },
      ],
    });

    const { createContactsService } = await import('./ContactsService');
    const service = createContactsService(createDeps() as any);

    await expect(service.getContacts()).resolves.toEqual([
      expect.objectContaining({
        id: 'contact-1',
        name: 'Alice',
        wxid: 'alice',
        region: 'CN',
      }),
    ]);

    expect(mocks.sdk.contacts.list).toHaveBeenCalledTimes(1);
  });

  it('searches contacts through IM contacts.search with current user identity', async () => {
    mocks.sdk.contacts.search.mockResolvedValue([
      {
        id: 'contact-2',
        name: 'Neo',
        userId: 'neo',
      },
    ]);

    const { createContactsService } = await import('./ContactsService');
    const service = createContactsService(createDeps() as any);

    await expect(service.findByName('Neo')).resolves.toEqual(
      expect.objectContaining({
        id: 'contact-2',
        name: 'Neo',
      }),
    );

    expect(mocks.sdk.contacts.search).toHaveBeenCalledWith('current-user', 'Neo');
  });

  it('routes friend request actions through IM friends module', async () => {
    mocks.sdk.friends.request.mockResolvedValue({
      success: true,
      requestId: 'fr-100',
    });
    mocks.sdk.friends.accept.mockResolvedValue(true);
    mocks.sdk.friends.reject.mockResolvedValue(true);

    const { createContactsService } = await import('./ContactsService');
    const service = createContactsService(createDeps() as any);

    await expect(service.sendFriendRequest('user-2', 'hello')).resolves.toEqual(
      expect.objectContaining({
        id: 'fr-100',
        fromUserId: 'user-2',
        message: 'hello',
        status: 'pending',
      }),
    );

    await expect(service.acceptFriendRequest('fr-100')).resolves.toBeUndefined();
    await expect(service.rejectFriendRequest('fr-100')).resolves.toBeUndefined();

    expect(mocks.sdk.friends.request).toHaveBeenCalledWith({
      toUserId: 'user-2',
      message: 'hello',
    });
    expect(mocks.sdk.friends.accept).toHaveBeenCalledWith('fr-100');
    expect(mocks.sdk.friends.reject).toHaveBeenCalledWith('fr-100');
  });
});
