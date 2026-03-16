import { beforeEach, describe, expect, it, vi } from 'vitest';

const sdkServiceMocks = vi.hoisted(() => ({
  getHistory: vi.fn(),
  addHistory: vi.fn(),
  clearHistory: vi.fn(),
  searchContent: vi.fn(),
}));

vi.mock('./SearchSdkService', () => ({
  createSearchSdkService: vi.fn(() => sdkServiceMocks),
}));

vi.mock('@sdkwork/react-mobile-chat', () => ({
  AGENT_REGISTRY: {
    agent_alpha: {
      id: 'agent_alpha',
      name: 'Alpha Agent',
      description: 'Alpha description',
      avatar: 'ALPHA',
      tags: ['alpha'],
    },
  },
  chatService: {
    getSessionList: vi.fn(async () => ({ data: [] })),
  },
}));

vi.mock('@sdkwork/react-mobile-content', () => ({
  articleService: {
    getArticles: vi.fn(async () => []),
  },
}));

vi.mock('@sdkwork/react-mobile-creation', () => ({
  creationService: {
    getCreations: vi.fn(async () => []),
  },
}));

vi.mock('@sdkwork/react-mobile-drive', () => ({
  fileService: {
    getFiles: vi.fn(async () => []),
  },
}));

describe('SearchService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sdkServiceMocks.getHistory.mockResolvedValue(null);
    sdkServiceMocks.addHistory.mockResolvedValue(null);
    sdkServiceMocks.clearHistory.mockResolvedValue(null);
    sdkServiceMocks.searchContent.mockResolvedValue(null);
  });

  it('prefers sdk others results during global search', async () => {
    sdkServiceMocks.searchContent.mockResolvedValue([
      {
        id: 'file_1',
        title: 'Remote roadmap',
        subTitle: 'File',
        avatar: '[FILE]',
        type: 'file',
        score: 90,
        timestamp: Date.parse('2026-03-16T10:00:00.000Z'),
      },
    ]);

    const { createSearchService } = await import('./SearchService');
    const service = createSearchService();

    const result = await service.search('roadmap');

    expect(sdkServiceMocks.searchContent).toHaveBeenCalledWith('roadmap');
    expect(result.others[0]).toEqual(expect.objectContaining({
      id: 'file_1',
      title: 'Remote roadmap',
      type: 'file',
    }));
  });

  it('does not use sdk content search for context chat search', async () => {
    const { createSearchService } = await import('./SearchService');
    const service = createSearchService();

    await service.search('roadmap', 'session_1');

    expect(sdkServiceMocks.searchContent).not.toHaveBeenCalled();
  });
});
