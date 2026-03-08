import type { Creation, CreationType } from '@sdkwork/react-mobile-creation';

type CreationTypeIcon = 'picture' | 'video-channel' | 'favorites' | 'voice' | 'book';

export interface CreationTypeMeta {
  label: string;
  iconName: CreationTypeIcon;
}

export function formatCreationDate(value: string): string {
  const text = value?.trim();
  if (!text) return '--';
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return '--';
  return parsed.toLocaleDateString();
}

export function getCreationCover(item: Creation): string {
  if (item.type === 'image') {
    return item.result?.thumbnailUrl || item.result?.url || '';
  }
  if (item.type === 'video' || item.type === 'short_drama' || item.type === 'collection') {
    return item.result?.thumbnailUrl || '';
  }
  return '';
}

export function getCreationTypeMeta(
  type: CreationType,
  tr: (key: string, fallback: string) => string
): CreationTypeMeta {
  const meta: Record<CreationType, CreationTypeMeta> = {
    image: {
      label: tr('creations.tabs.image', 'Image'),
      iconName: 'picture',
    },
    video: {
      label: tr('creations.tabs.video', 'Video'),
      iconName: 'video-channel',
    },
    short_drama: {
      label: tr('creations.tabs.short_drama', 'Short Drama'),
      iconName: 'video-channel',
    },
    collection: {
      label: tr('creations.tabs.collection', 'Collection'),
      iconName: 'favorites',
    },
    music: {
      label: tr('creations.tabs.music', 'Music'),
      iconName: 'voice',
    },
    text: {
      label: tr('creations.tabs.text', 'Text'),
      iconName: 'book',
    },
  };
  return meta[type];
}
