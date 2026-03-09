import type { DriveFile, FileType } from '../types';

export type DrivePrimaryTab = 'files' | 'recent' | 'transfer' | 'category' | 'space';

export interface DrivePrimaryTabConfig {
  id: DrivePrimaryTab;
  labelKey: string;
  fallbackLabel: string;
}

export interface DriveCategoryMetric {
  count: number;
  size: number;
}

export type DriveCategorySummary = Record<FileType, DriveCategoryMetric>;

export const DRIVE_PRIMARY_TABS: ReadonlyArray<DrivePrimaryTabConfig> = [
  { id: 'files', labelKey: 'drive.tabs.files', fallbackLabel: 'Files' },
  { id: 'recent', labelKey: 'drive.tabs.recent', fallbackLabel: 'Recent' },
  { id: 'transfer', labelKey: 'drive.tabs.transfer', fallbackLabel: 'Transfer' },
  { id: 'category', labelKey: 'drive.tabs.category', fallbackLabel: 'Category' },
  { id: 'space', labelKey: 'drive.tabs.space', fallbackLabel: 'Space' },
];

const createEmptyMetric = (): DriveCategoryMetric => ({ count: 0, size: 0 });

export const createEmptyDriveCategorySummary = (): DriveCategorySummary => ({
  image: createEmptyMetric(),
  video: createEmptyMetric(),
  document: createEmptyMetric(),
  audio: createEmptyMetric(),
  folder: createEmptyMetric(),
});

export const summarizeDriveCategories = (files: DriveFile[]): DriveCategorySummary => {
  const summary = createEmptyDriveCategorySummary();
  for (const file of files) {
    const bucket = summary[file.type];
    bucket.count += 1;
    bucket.size += file.size || 0;
  }
  return summary;
};
