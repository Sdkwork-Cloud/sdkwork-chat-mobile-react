import { describe, expect, it } from 'vitest';
import { applyAgentPreferences, buildAgentList } from './myAgentsListModel';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

describe('myAgentsListModel', () => {
  it('prefers custom and mine agents from registry', () => {
    const now = 1_750_000_000_000;
    const registry = {
      baseAssistant: {
        id: 'assistant_base',
        name: 'Base Assistant',
        avatar: 'B',
        description: 'base',
        tags: ['assistant'],
      },
      customWriter: {
        id: 'custom_writer',
        name: 'Writer',
        avatar: 'W',
        description: 'writer',
        tags: ['assistant'],
      },
      mineArtist: {
        id: 'assistant_artist',
        name: 'Artist',
        avatar: 'A',
        description: 'artist',
        tags: ['mine'],
      },
    };

    const result = buildAgentList(registry, now);
    expect(result.map((item) => item.id)).toEqual(['custom_writer', 'assistant_artist']);
    expect(result[0].createTime).toBe(now - DAY_IN_MS * 3);
    expect(result[1].createTime).toBe(now - DAY_IN_MS * 6);
  });

  it('falls back to first three entries when no custom or mine agents exist', () => {
    const registry = {
      one: { id: 'one', name: 'One', avatar: '1', description: 'one', tags: [] },
      two: { id: 'two', name: 'Two', avatar: '2', description: 'two', tags: [] },
      three: { id: 'three', name: 'Three', avatar: '3', description: 'three', tags: [] },
      four: { id: 'four', name: 'Four', avatar: '4', description: 'four', tags: [] },
    };

    const result = buildAgentList(registry, Date.now());
    expect(result.map((item) => item.id)).toEqual(['one', 'two', 'three']);
  });

  it('applies hidden and override preferences', () => {
    const list = [
      { id: 'one', name: 'One', avatar: '1', description: 'desc-1', tags: [], createTime: 1 },
      { id: 'two', name: 'Two', avatar: '2', description: 'desc-2', tags: [], createTime: 2 },
    ];
    const hiddenIds = new Set<string>(['two']);
    const overrides = {
      one: {
        name: 'Custom One',
        description: 'custom desc',
      },
    };

    const result = applyAgentPreferences(list, hiddenIds, overrides);
    expect(result).toEqual([
      {
        id: 'one',
        name: 'Custom One',
        avatar: '1',
        description: 'custom desc',
        tags: [],
        createTime: 1,
      },
    ]);
  });
});
