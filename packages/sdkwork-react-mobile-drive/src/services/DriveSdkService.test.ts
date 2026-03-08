import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const {
  createAppSdkCoreConfigMock,
  getAppSdkCoreClientWithSessionMock,
  uploadFileMock,
  loggerWarnMock,
  defaultRuntimeDeps,
} = vi.hoisted(() => {
  const upload = vi.fn();
  const loggerWarn = vi.fn();
  const deps = {
    storage: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
    },
    logger: {
      warn: loggerWarn,
    },
    clock: {
      now: () => Date.parse('2026-03-07T00:00:00.000Z'),
    },
    idGenerator: {
      next: vi.fn((prefix: string) => `${prefix}_generated`),
    },
  };

  return {
    createAppSdkCoreConfigMock: vi.fn(() => ({ baseUrl: 'https://api.example.com' })),
    getAppSdkCoreClientWithSessionMock: vi.fn(async () => ({
      upload: {
        file: upload,
      },
    })),
    uploadFileMock: upload,
    loggerWarnMock: loggerWarn,
    defaultRuntimeDeps: deps,
  };
});

vi.mock('@sdkwork/react-mobile-core', () => ({
  APP_SDK_AUTH_TOKEN_STORAGE_KEY: 'sdkwork_token',
  createAppSdkCoreConfig: createAppSdkCoreConfigMock,
  getAppSdkCoreClientWithSession: getAppSdkCoreClientWithSessionMock,
  resolveServiceFactoryRuntimeDeps: (deps?: Record<string, unknown>) => ({
    ...defaultRuntimeDeps,
    ...(deps || {}),
  }),
}));

import { createDriveSdkService } from './DriveSdkService';

class MockFileReader {
  result: string | ArrayBuffer | null = null;
  onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
  onerror: (() => void) | null = null;

  readAsDataURL(file: File): void {
    this.result = `data:${file.type};base64,ZmFrZV9maWxl`;
    this.onload?.({} as ProgressEvent<FileReader>);
  }
}

describe('DriveSdkService uploadFile', () => {
  const originalFileReader = globalThis.FileReader;

  beforeEach(() => {
    uploadFileMock.mockReset();
    loggerWarnMock.mockReset();
    getAppSdkCoreClientWithSessionMock.mockClear();
    createAppSdkCoreConfigMock.mockClear();
    globalThis.FileReader = MockFileReader as unknown as typeof FileReader;
  });

  afterEach(() => {
    globalThis.FileReader = originalFileReader;
  });

  it('uploads base64 data through sdk upload api and maps file result', async () => {
    uploadFileMock.mockResolvedValue({
      code: '2000',
      msg: 'ok',
      data: {
        fileId: 'file-1',
        fileName: 'avatar.png',
        fileSize: 128,
        accessUrl: 'https://cdn.example.com/avatar.png',
        createdAt: '2026-03-06T10:00:00.000Z',
        updatedAt: '2026-03-07T10:00:00.000Z',
      },
    });

    const service = createDriveSdkService();
    const file = new File([new Uint8Array([1, 2, 3])], 'avatar.png', { type: 'image/png' });

    const result = await service.uploadFile(file, 'parent-1');

    expect(uploadFileMock).toHaveBeenCalledTimes(1);
    expect(uploadFileMock).toHaveBeenCalledWith({
      file: expect.stringMatching(/^data:image\/png;base64,/),
    });
    expect(result).toMatchObject({
      id: 'file-1',
      name: 'avatar.png',
      type: 'image',
      size: 128,
      url: 'https://cdn.example.com/avatar.png',
      parentId: 'parent-1',
    });
  });
});
