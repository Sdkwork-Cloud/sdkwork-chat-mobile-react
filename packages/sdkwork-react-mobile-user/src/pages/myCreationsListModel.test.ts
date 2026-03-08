import { describe, expect, it } from 'vitest';
import type { Creation } from '@sdkwork/react-mobile-creation';
import { formatCreationDate, getCreationCover, getCreationTypeMeta } from './myCreationsListModel';

const tr = (_key: string, fallback: string) => fallback;

const makeCreation = (type: Creation['type'], result?: Creation['result']): Creation => ({
  id: `creation-${type}`,
  type,
  title: `${type} title`,
  prompt: 'demo prompt',
  status: 'completed',
  progress: 100,
  result,
  params: {},
  tags: [],
  isPublic: false,
  isFavorite: false,
  viewCount: 0,
  likeCount: 0,
  userId: 'u1',
  userName: 'user',
  createdAt: '2026-01-02T03:04:05.000Z',
  updatedAt: '2026-01-02T03:04:05.000Z',
});

describe('myCreationsListModel', () => {
  it('returns dedicated label and icon for short drama and collection', () => {
    const shortDramaMeta = getCreationTypeMeta('short_drama', tr);
    const collectionMeta = getCreationTypeMeta('collection', tr);

    expect(shortDramaMeta.label).toBe('Short Drama');
    expect(shortDramaMeta.iconName).toBe('video-channel');
    expect(collectionMeta.label).toBe('Collection');
    expect(collectionMeta.iconName).toBe('favorites');
  });

  it('picks the best available cover per creation type', () => {
    const image = makeCreation('image', { url: 'image-url', thumbnailUrl: 'image-thumb' });
    const video = makeCreation('video', { url: 'video-url', thumbnailUrl: 'video-thumb' });
    const text = makeCreation('text', { url: 'text-url' });

    expect(getCreationCover(image)).toBe('image-thumb');
    expect(getCreationCover(video)).toBe('video-thumb');
    expect(getCreationCover(text)).toBe('');
  });

  it('returns fallback text when date is invalid', () => {
    expect(formatCreationDate('invalid-date')).toBe('--');
    expect(formatCreationDate('')).toBe('--');
  });
});
