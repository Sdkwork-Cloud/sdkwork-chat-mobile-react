import { describe, expect, it } from 'vitest';
import { DRIVE_PRIMARY_TABS, summarizeDriveCategories } from './drivePrimaryTabs';
import type { DriveFile } from '../types';

describe('drivePrimaryTabs', () => {
  it('defines professional drive tabs in expected order', () => {
    expect(DRIVE_PRIMARY_TABS.map((tab) => tab.id)).toEqual([
      'files',
      'recent',
      'transfer',
      'category',
      'space',
    ]);
  });

  it('summarizes category count and size from file list', () => {
    const files: DriveFile[] = [
      { id: '1', name: 'IMG_1.jpg', type: 'image', size: 100, parentId: null, createTime: 1, updateTime: 1 },
      { id: '2', name: 'clip.mp4', type: 'video', size: 260, parentId: null, createTime: 1, updateTime: 1 },
      { id: '3', name: 'doc.pdf', type: 'document', size: 80, parentId: null, createTime: 1, updateTime: 1 },
      { id: '4', name: 'music.mp3', type: 'audio', size: 120, parentId: null, createTime: 1, updateTime: 1 },
      { id: '5', name: 'Archive', type: 'folder', size: 0, parentId: null, createTime: 1, updateTime: 1 },
      { id: '6', name: 'IMG_2.jpg', type: 'image', size: 300, parentId: null, createTime: 1, updateTime: 1 },
    ];

    const summary = summarizeDriveCategories(files);
    expect(summary.image.count).toBe(2);
    expect(summary.image.size).toBe(400);
    expect(summary.video.count).toBe(1);
    expect(summary.video.size).toBe(260);
    expect(summary.document.count).toBe(1);
    expect(summary.audio.count).toBe(1);
    expect(summary.folder.count).toBe(1);
  });
});
