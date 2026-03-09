import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navbar } from '@sdkwork/react-mobile-commons';
import {
  ArrowUpDown,
  ChevronRight,
  Clock3,
  FileText,
  Folder,
  Grid3X3,
  Home,
  Image as ImageIcon,
  Layers3,
  List,
  MoreVertical,
  Music,
  PieChart,
  Upload,
  Video,
} from 'lucide-react';
import { useDrive } from '../hooks/useDrive';
import { fileService } from '../services/FileService';
import type { DriveFile, FileType } from '../types';
import { DRIVE_PRIMARY_TABS, type DrivePrimaryTab, summarizeDriveCategories } from './drivePrimaryTabs';
import {
  createDriveTransferTask,
  markDriveTransferTaskFailed,
  markDriveTransferTaskSuccess,
  type DriveTransferTask,
} from './driveTransferQueue';
import './CloudDrivePage.css';

interface CloudDrivePageProps {
  t?: (key: string) => string;
  onBack?: () => void;
}

interface DriveEmptyStateConfig {
  icon: React.ReactNode;
  title: string;
  description: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

type FileFilter = 'all' | FileType;
type ViewMode = 'list' | 'grid';

const getIcon = (type: FileType) => {
  switch (type) {
    case 'folder':
      return <Folder className="w-10 h-10 text-yellow-500" />;
    case 'image':
      return <ImageIcon className="w-10 h-10 text-blue-500" />;
    case 'video':
      return <Video className="w-10 h-10 text-violet-500" />;
    case 'document':
      return <FileText className="w-10 h-10 text-cyan-600" />;
    case 'audio':
      return <Music className="w-10 h-10 text-green-500" />;
    default:
      return <FileText className="w-10 h-10 text-gray-500" />;
  }
};

const getPlaceholder = (type: FileType) => {
  if (type === 'folder') return 'FOLDER';
  if (type === 'image') return 'IMG';
  if (type === 'video') return 'VID';
  if (type === 'audio') return 'AUDIO';
  return 'DOC';
};

const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const formatRelativeTime = (timestamp?: number): string => {
  if (!timestamp) return '--';
  const diff = Date.now() - timestamp;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < hour) {
    return `${Math.max(1, Math.floor(diff / minute))}m`;
  }
  if (diff < day) {
    return `${Math.floor(diff / hour)}h`;
  }
  return `${Math.floor(diff / day)}d`;
};

const formatCountLabel = (count: number, singular: string, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`;

const renderTabIcon = (tab: DrivePrimaryTab, active: boolean) => {
  const common = `w-[18px] h-[18px] ${active ? 'opacity-100' : 'opacity-80'}`;
  if (tab === 'files') return <Folder className={common} />;
  if (tab === 'recent') return <Clock3 className={common} />;
  if (tab === 'transfer') return <ArrowUpDown className={common} />;
  if (tab === 'category') return <Layers3 className={common} />;
  return <PieChart className={common} />;
};

export const CloudDrivePage: React.FC<CloudDrivePageProps> = ({ t, onBack }) => {
  const tr = useCallback(
    (key: string, fallback: string) => {
      const value = t?.(key) ?? key;
      return value === key ? fallback : value;
    },
    [t]
  );

  const { files, stats, isLoading, error, currentFolder, setCurrentFolder, uploadFile, deleteFile } = useDrive();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activePrimaryTab, setActivePrimaryTab] = useState<DrivePrimaryTab>('files');
  const [activeFilter, setActiveFilter] = useState<FileFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ id: string; name: string }>>([]);
  const [recentFiles, setRecentFiles] = useState<DriveFile[]>([]);
  const [isRecentLoading, setIsRecentLoading] = useState(false);
  const [transferTasks, setTransferTasks] = useState<DriveTransferTask[]>([]);
  const transferSequenceRef = useRef(0);

  const createTransferId = useCallback(() => {
    transferSequenceRef.current += 1;
    return `transfer_${Date.now()}_${transferSequenceRef.current}`;
  }, []);

  const usedPercent = stats ? Math.min(100, (stats.used / Math.max(stats.total, 1)) * 100) : 0;
  const freeSpace = stats ? Math.max(0, stats.total - stats.used) : 0;
  const rootFolderLabel = tr('drive.root', 'My Drive');

  const filterOptions = useMemo<Array<{ id: FileFilter; label: string }>>(
    () => [
      { id: 'all', label: tr('drive.filters.all', 'All') },
      { id: 'folder', label: tr('drive.filters.folder', 'Folders') },
      { id: 'image', label: tr('drive.filters.image', 'Images') },
      { id: 'video', label: tr('drive.filters.video', 'Videos') },
      { id: 'document', label: tr('drive.filters.document', 'Documents') },
      { id: 'audio', label: tr('drive.filters.audio', 'Audio') },
    ],
    [tr]
  );

  const filteredFiles = useMemo(
    () => files.filter((file) => activeFilter === 'all' || file.type === activeFilter),
    [activeFilter, files]
  );

  const loadRecentFiles = useCallback(async () => {
    setIsRecentLoading(true);
    try {
      const rootFiles = await fileService.getFiles(null);
      const folderFiles = rootFiles.filter((item) => item.type === 'folder');
      const nestedResults = await Promise.all(folderFiles.map((folder) => fileService.getFiles(folder.id)));
      const candidateFiles = [...rootFiles, ...nestedResults.flat()].filter((item) => item.type !== 'folder');
      const topRecent = candidateFiles
        .sort((a, b) => (b.updateTime ?? b.createTime) - (a.updateTime ?? a.createTime))
        .slice(0, 30);
      setRecentFiles(topRecent);
    } catch (recentError) {
      console.error('[CloudDrivePage] failed to load recent files:', recentError);
      setRecentFiles([]);
    } finally {
      setIsRecentLoading(false);
    }
  }, []);

  const dedupedFilePool = useMemo(() => {
    const map = new Map<string, DriveFile>();
    for (const item of [...files, ...recentFiles]) {
      map.set(item.id, item);
    }
    return Array.from(map.values());
  }, [files, recentFiles]);

  const categorySummary = useMemo(() => summarizeDriveCategories(dedupedFilePool), [dedupedFilePool]);

  const categoryCards = useMemo(
    () => [
      {
        type: 'image' as const,
        label: tr('drive.filters.image', 'Images'),
        count: categorySummary.image.count,
        size: categorySummary.image.size,
      },
      {
        type: 'video' as const,
        label: tr('drive.filters.video', 'Videos'),
        count: categorySummary.video.count,
        size: categorySummary.video.size,
      },
      {
        type: 'document' as const,
        label: tr('drive.filters.document', 'Documents'),
        count: categorySummary.document.count,
        size: categorySummary.document.size,
      },
      {
        type: 'audio' as const,
        label: tr('drive.filters.audio', 'Audio'),
        count: categorySummary.audio.count,
        size: categorySummary.audio.size,
      },
      {
        type: 'folder' as const,
        label: tr('drive.filters.folder', 'Folders'),
        count: categorySummary.folder.count,
        size: categorySummary.folder.size,
      },
    ],
    [categorySummary, tr]
  );

  const latestRecentFile = recentFiles[0] ?? null;
  const recentFreshCount = useMemo(() => {
    const day = 24 * 60 * 60 * 1000;
    return recentFiles.filter((item) => {
      const timestamp = item.updateTime || item.createTime;
      return typeof timestamp === 'number' && Date.now() - timestamp < day;
    }).length;
  }, [recentFiles]);

  const recentWorkspaceCount = useMemo(
    () => new Set(recentFiles.map((item) => item.parentId || 'root')).size,
    [recentFiles]
  );

  const leadingCategoryCard = useMemo(() => {
    const populated = [...categoryCards]
      .filter((card) => card.count > 0)
      .sort((a, b) => b.size - a.size || b.count - a.count);
    return populated[0] ?? null;
  }, [categoryCards]);

  const reclaimPriorityCards = useMemo(
    () =>
      [...categoryCards]
        .filter((card) => card.type !== 'folder' && card.size > 0)
        .sort((a, b) => b.size - a.size || b.count - a.count)
        .slice(0, 3),
    [categoryCards]
  );

  const tabs = useMemo(
    () =>
      DRIVE_PRIMARY_TABS.map((tab) => ({
        ...tab,
        label: tr(tab.labelKey, tab.fallbackLabel),
      })),
    [tr]
  );

  const transferSummary = useMemo(() => {
    const running = transferTasks.filter((task) => task.status === 'running').length;
    const success = transferTasks.filter((task) => task.status === 'success').length;
    const failed = transferTasks.filter((task) => task.status === 'failed').length;
    return { running, success, failed, total: transferTasks.length };
  }, [transferTasks]);

  const activeFilterLabel = filterOptions.find((filter) => filter.id === activeFilter)?.label ?? tr('drive.filters.all', 'All');
  const activeCategoryCount = categoryCards.filter((card) => card.count > 0).length;
  const currentFolderLabel = breadcrumbs[breadcrumbs.length - 1]?.name ?? rootFolderLabel;
  const totalTrackedItems = dedupedFilePool.length;

  const activeContext = useMemo(() => {
    if (activePrimaryTab === 'files') {
      return {
        title: currentFolderLabel,
        subtitle:
          activeFilter === 'all'
            ? tr('drive.hero_files_subtitle', 'Organize folders, docs and media in the current workspace.')
            : tr('drive.hero_files_filtered_subtitle', `Focused on ${activeFilterLabel} for a faster scan.`),
        badge: formatCountLabel(filteredFiles.length, 'item'),
      };
    }

    if (activePrimaryTab === 'recent') {
      return {
        title: tr('drive.recent', 'Recent files'),
        subtitle: tr('drive.hero_recent_subtitle', 'Resume work that changed across folders, media and projects.'),
        badge: formatCountLabel(recentFiles.length, 'recent item'),
      };
    }

    if (activePrimaryTab === 'transfer') {
      return {
        title: tr('drive.transfer_title', 'Transfer center'),
        subtitle: tr('drive.hero_transfer_subtitle', 'Track uploads in one queue and clear finished work deliberately.'),
        badge: formatCountLabel(transferSummary.total, 'task'),
      };
    }

    if (activePrimaryTab === 'category') {
      return {
        title: tr('drive.category_title', 'Category browse'),
        subtitle: tr('drive.hero_category_subtitle', 'Slice the library by media type when you need speed, not browsing.'),
        badge: formatCountLabel(activeCategoryCount, 'active category'),
      };
    }

    return {
      title: tr('drive.space_title', 'Storage center'),
      subtitle: tr('drive.hero_space_subtitle', 'See how storage is spent and decide where to reclaim space first.'),
      badge: `${usedPercent.toFixed(0)}% ${tr('drive.hero_used_short', 'used')}`,
    };
  }, [
    activeCategoryCount,
    activeFilter,
    activeFilterLabel,
    activePrimaryTab,
    currentFolderLabel,
    filteredFiles.length,
    recentFiles.length,
    transferSummary.total,
    tr,
    usedPercent,
  ]);

  const heroMetrics = useMemo(
    () => [
      {
        label: tr('drive.hero_metric_library', 'Library'),
        value: formatCountLabel(totalTrackedItems, 'item'),
      },
      {
        label: tr('drive.hero_metric_free', 'Free'),
        value: formatSize(freeSpace),
      },
      {
        label: tr('drive.hero_metric_queue', 'Queue'),
        value: formatCountLabel(transferSummary.running, 'upload'),
      },
      {
        label: tr('drive.hero_metric_recent', 'Recent'),
        value: formatCountLabel(recentFiles.length, 'file'),
      },
    ],
    [freeSpace, recentFiles.length, totalTrackedItems, transferSummary.running, tr]
  );

  const appendTransferTask = useCallback((task: DriveTransferTask) => {
    setTransferTasks((prev) => [task, ...prev]);
  }, []);

  const patchTransferTask = useCallback((id: string, nextTask: DriveTransferTask) => {
    setTransferTasks((prev) => prev.map((item) => (item.id === id ? nextTask : item)));
  }, []);

  const clearFinishedTransferTasks = useCallback(() => {
    setTransferTasks((prev) => prev.filter((task) => task.status === 'running'));
  }, []);

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) {
      e.currentTarget.value = '';
      return;
    }

    setActivePrimaryTab('transfer');

    for (const file of selectedFiles) {
      const task = createDriveTransferTask({
        id: createTransferId(),
        name: file.name,
        size: file.size,
      });
      appendTransferTask(task);

      try {
        await uploadFile(file);
        patchTransferTask(task.id, markDriveTransferTaskSuccess(task));
      } catch (uploadError) {
        const message =
          uploadError instanceof Error ? uploadError.message : tr('drive.transfer_unknown_error', 'Upload failed');
        patchTransferTask(task.id, markDriveTransferTaskFailed(task, message));
      }
    }

    e.currentTarget.value = '';
  };

  const handleOpenFolder = useCallback(
    (folder: DriveFile) => {
      if (folder.type !== 'folder') return;
      setBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
      setCurrentFolder(folder.id);
    },
    [setCurrentFolder]
  );

  const handleNavigateRoot = useCallback(() => {
    setBreadcrumbs([]);
    setCurrentFolder(null);
  }, [setCurrentFolder]);

  const handleNavigateBreadcrumb = useCallback(
    (index: number) => {
      if (index < 0) {
        handleNavigateRoot();
        return;
      }
      const next = breadcrumbs.slice(0, index + 1);
      setBreadcrumbs(next);
      const targetFolderId = next[next.length - 1]?.id ?? null;
      setCurrentFolder(targetFolderId);
    },
    [breadcrumbs, handleNavigateRoot, setCurrentFolder]
  );

  const handleCategoryOpen = useCallback((nextFilter: FileFilter) => {
    setActiveFilter(nextFilter);
    setActivePrimaryTab('files');
  }, []);

  const handleTabShortcut = useCallback((nextTab: DrivePrimaryTab) => {
    setActivePrimaryTab(nextTab);
  }, []);

  useEffect(() => {
    if (!currentFolder) {
      setBreadcrumbs([]);
    }
  }, [currentFolder]);

  useEffect(() => {
    void loadRecentFiles();
  }, [loadRecentFiles, files.length]);

  const renderFileMeta = (file: DriveFile) => (
    <div className="text-xs text-gray-500 flex items-center gap-2">
      <span>{file.type === 'folder' ? tr('drive.folder', 'Folder') : formatSize(file.size)}</span>
      <span>|</span>
      <span>{formatRelativeTime(file.updateTime || file.createTime)}</span>
    </div>
  );

  const getTransferStatusLabel = useCallback(
    (status: DriveTransferTask['status']) => {
      if (status === 'running') return tr('drive.transfer_running', 'Transferring');
      if (status === 'success') return tr('drive.transfer_success', 'Completed');
      return tr('drive.transfer_failed', 'Failed');
    },
    [tr]
  );

  const getTabBadge = useCallback(
    (tab: DrivePrimaryTab) => {
      if (tab === 'files') return files.length > 0 ? String(files.length) : null;
      if (tab === 'recent') return recentFiles.length > 0 ? String(Math.min(recentFiles.length, 9)) : null;
      if (tab === 'transfer') return transferSummary.running > 0 ? String(transferSummary.running) : null;
      if (tab === 'category') return activeCategoryCount > 0 ? String(activeCategoryCount) : null;
      if (tab === 'space' && usedPercent >= 85) return '!';
      return null;
    },
    [activeCategoryCount, files.length, recentFiles.length, transferSummary.running, usedPercent]
  );

  const renderSectionHeading = (title: string, subtitle: string, badge: string) => (
    <div className="drive-page__section-heading">
      <div className="drive-page__section-heading-main">
        <div className="drive-page__section-kicker">{tr('drive.section_kicker', 'Workspace view')}</div>
        <div className="drive-page__section-title-row">
          <h2 className="drive-page__section-title">{title}</h2>
          <span className="drive-page__section-badge">{badge}</span>
        </div>
        <p className="drive-page__section-subtitle">{subtitle}</p>
      </div>
    </div>
  );

  const renderEmptyState = ({
    icon,
    title,
    description,
    primaryLabel,
    onPrimary,
    secondaryLabel,
    onSecondary,
  }: DriveEmptyStateConfig) => (
    <div className="drive-page__empty-state">
      <div className="drive-page__empty-icon">{icon}</div>
      <div className="drive-page__empty-title">{title}</div>
      <div className="drive-page__empty-copy">{description}</div>
      <div className="drive-page__empty-actions">
        <button type="button" className="drive-page__empty-button is-primary" onClick={onPrimary}>
          {primaryLabel}
        </button>
        {secondaryLabel && onSecondary ? (
          <button type="button" className="drive-page__empty-button" onClick={onSecondary}>
            {secondaryLabel}
          </button>
        ) : null}
      </div>
    </div>
  );

  const renderFilesPanel = () => (
    <section className="drive-page__panel-shell">
      {renderSectionHeading(
        currentFolderLabel,
        activeFilter === 'all'
          ? tr('drive.files_panel_subtitle', 'Everything in this space is ready to move, scan or share.')
          : tr('drive.files_panel_filtered_subtitle', `Showing ${activeFilterLabel} only in the current folder.`),
        formatCountLabel(filteredFiles.length, 'item')
      )}

      <div className="drive-page__files-spotlight">
        <div className="drive-page__spotlight-head">
          <div className="drive-page__spotlight-title">{tr('drive.files_spotlight_title', 'Folder focus')}</div>
          <div className="drive-page__spotlight-copy">
            {tr(
              'drive.files_spotlight_copy',
              'Keep folder context, filter mode, and item count visible while you browse.'
            )}
          </div>
        </div>
        <div className="drive-page__spotlight-grid">
          <div className="drive-page__spotlight-chip">
            <span>{tr('drive.files_spotlight_folder', 'Folder')}</span>
            <strong>{currentFolderLabel}</strong>
          </div>
          <div className="drive-page__spotlight-chip">
            <span>{tr('drive.files_spotlight_filter', 'Filter')}</span>
            <strong>{activeFilterLabel}</strong>
          </div>
          <div className="drive-page__spotlight-chip">
            <span>{tr('drive.files_spotlight_visible', 'Visible')}</span>
            <strong>{filteredFiles.length}</strong>
          </div>
        </div>
      </div>

      <div className="drive-page__toolbar">
        <div className="drive-page__toolbar-row drive-page__toolbar-row--breadcrumbs">
          <button type="button" onClick={() => handleNavigateBreadcrumb(-1)} className="drive-page__crumb">
            <Home className="w-3.5 h-3.5" />
            <span>{rootFolderLabel}</span>
          </button>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.id}>
              <ChevronRight className="w-3.5 h-3.5 drive-page__crumb-separator" />
              <button
                type="button"
                onClick={() => handleNavigateBreadcrumb(index)}
                className="drive-page__crumb"
              >
                <span>{crumb.name}</span>
              </button>
            </React.Fragment>
          ))}
        </div>

        <div className="drive-page__toolbar-row">
          <div className="drive-page__toolbar-summary">
            <span>{tr('drive.current_file_count', 'Items in current folder')}</span>
            <strong>{filteredFiles.length}</strong>
          </div>
          <div className="drive-page__view-switch">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`drive-page__view-button${viewMode === 'list' ? ' drive-page__view-button--active' : ''}`}
              aria-label={tr('drive.view_list', 'List view')}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`drive-page__view-button${viewMode === 'grid' ? ' drive-page__view-button--active' : ''}`}
              aria-label={tr('drive.view_grid', 'Grid view')}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="drive-page__filters">
          {filterOptions.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              className={`drive-page__filter-chip${activeFilter === filter.id ? ' drive-page__filter-chip--active' : ''}`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="drive-page__loading">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : filteredFiles.length === 0 ? (
        renderEmptyState({
          icon: <Folder className="w-6 h-6" />,
          title: error ? tr('drive.files_error_title', 'Drive is not responding') : tr('drive.files_empty_title', 'This folder is still clean'),
          description: error
            ? tr('drive.files_error_copy', 'Switch views or retry from another section while the file list recovers.')
            : activeFilter === 'all'
              ? tr('drive.files_empty_copy', 'Upload documents, photos or videos and this workspace will become your launch point.')
              : tr('drive.files_empty_filtered_copy', 'Nothing matches this filter yet. Clear the filter or upload matching files.'),
          primaryLabel: error
            ? tr('drive.empty_primary_recent', 'Open recent')
            : activeFilter === 'all'
              ? tr('drive.upload', 'Upload')
              : tr('drive.empty_primary_clear', 'Clear filter'),
          onPrimary: error
            ? () => setActivePrimaryTab('recent')
            : activeFilter === 'all'
              ? handleUpload
              : () => setActiveFilter('all'),
          secondaryLabel: error
            ? tr('drive.empty_secondary_root', 'Go to root')
            : tr('drive.empty_secondary_category', 'Browse categories'),
          onSecondary: error ? handleNavigateRoot : () => setActivePrimaryTab('category'),
        })
      ) : viewMode === 'list' ? (
        <div className="drive-page__list-shell bg-white dark:bg-gray-800">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              onClick={() => file.type === 'folder' && handleOpenFolder(file)}
              className={`drive-page__file-row ${file.type === 'folder' ? 'cursor-pointer' : ''}`}
            >
              {getIcon(file.type)}
              <div className="drive-page__file-main">
                <div className="text-gray-900 dark:text-white font-medium truncate">{file.name}</div>
                {renderFileMeta(file)}
              </div>
              {file.type === 'folder' ? (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              ) : (
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    const confirmed = window.confirm(tr('drive.confirm_delete', 'Delete this file?'));
                    if (confirmed) {
                      void deleteFile(file.id);
                    }
                  }}
                  className="p-2 text-gray-400"
                  aria-label={tr('drive.delete', 'Delete')}
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="drive-page__grid-shell">
          <div className="grid grid-cols-2 gap-3">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => file.type === 'folder' && handleOpenFolder(file)}
                className={`drive-page__grid-card ${file.type === 'folder' ? 'cursor-pointer' : ''}`}
              >
                <div className="drive-page__grid-preview">{getPlaceholder(file.type)}</div>
                <div className="text-sm text-gray-900 dark:text-white truncate">{file.name}</div>
                {renderFileMeta(file)}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );

  const renderRecentPanel = () => (
    <section className="drive-page__panel-shell">
      {renderSectionHeading(
        tr('drive.recent', 'Recent files'),
        tr('drive.recent_panel_subtitle', 'Jump back into files that changed most recently across your drive.'),
        formatCountLabel(recentFiles.length, 'file')
      )}

      {recentFiles.length > 0 ? (
        <div className="drive-page__recent-focus">
          <div className="drive-page__spotlight-head">
            <div className="drive-page__spotlight-title">{tr('drive.recent_focus_title', 'Resume faster')}</div>
            <div className="drive-page__spotlight-copy">
              {tr(
                'drive.recent_focus_copy',
                'Recent keeps the last moving assets within reach so you can jump back without browsing folders.'
              )}
            </div>
          </div>
          <div className="drive-page__spotlight-grid">
            <div className="drive-page__spotlight-chip">
              <span>{tr('drive.recent_focus_latest', 'Latest file')}</span>
              <strong>{latestRecentFile?.name || '--'}</strong>
            </div>
            <div className="drive-page__spotlight-chip">
              <span>{tr('drive.recent_focus_today', 'Updated today')}</span>
              <strong>{recentFreshCount}</strong>
            </div>
            <div className="drive-page__spotlight-chip">
              <span>{tr('drive.recent_focus_places', 'Workspaces')}</span>
              <strong>{recentWorkspaceCount}</strong>
            </div>
          </div>
        </div>
      ) : null}

      {isRecentLoading ? (
        <div className="drive-page__inline-message">{tr('drive.loading_recent', 'Loading recent files...')}</div>
      ) : recentFiles.length === 0 ? (
        renderEmptyState({
          icon: <Clock3 className="w-6 h-6" />,
          title: tr('drive.recent_empty_title', 'No recent activity yet'),
          description: tr('drive.recent_empty_copy', 'Open, upload or edit files and the recent timeline will start working for you.'),
          primaryLabel: tr('drive.empty_primary_files', 'Open files'),
          onPrimary: () => setActivePrimaryTab('files'),
          secondaryLabel: tr('drive.upload', 'Upload'),
          onSecondary: handleUpload,
        })
      ) : (
        <div className="drive-page__recent-list">
          {recentFiles.map((file) => (
            <button
              key={file.id}
              type="button"
              className="drive-page__recent-item"
              onClick={() => {
                setCurrentFolder(file.parentId ?? null);
                setActivePrimaryTab('files');
                if (!file.parentId) {
                  setBreadcrumbs([]);
                }
              }}
            >
              <span className="drive-page__recent-icon">{getPlaceholder(file.type)}</span>
              <span className="drive-page__recent-main">
                <span className="drive-page__recent-name">{file.name}</span>
                <span className="drive-page__recent-meta">
                  {formatSize(file.size)} | {formatRelativeTime(file.updateTime || file.createTime)}
                </span>
              </span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          ))}
        </div>
      )}
    </section>
  );

  const renderTransferPanel = () => (
    <section className="drive-page__panel-shell">
      {renderSectionHeading(
        tr('drive.transfer_title', 'Transfer center'),
        tr('drive.transfer_panel_subtitle', 'Uploads stay visible until they complete, fail or get cleared from the queue.'),
        formatCountLabel(transferSummary.total, 'task')
      )}

      <div className="drive-page__transfer-board">
        <div className="drive-page__spotlight-head">
          <div className="drive-page__spotlight-title">{tr('drive.transfer_board_title', 'Transfer board')}</div>
          <div className="drive-page__spotlight-copy">
            {tr(
              'drive.transfer_board_copy',
              'Uploads stay visible until the queue is resolved or intentionally cleared.'
            )}
          </div>
        </div>
        <div className="drive-page__transfer-board-grid">
          <div className="drive-page__transfer-board-card is-running">
            <span>{tr('drive.transfer_running', 'Transferring')}</span>
            <strong>{transferSummary.running}</strong>
          </div>
          <div className="drive-page__transfer-board-card is-success">
            <span>{tr('drive.transfer_success', 'Completed')}</span>
            <strong>{transferSummary.success}</strong>
          </div>
          <div className="drive-page__transfer-board-card is-failed">
            <span>{tr('drive.transfer_failed', 'Failed')}</span>
            <strong>{transferSummary.failed}</strong>
          </div>
        </div>
      </div>

      {transferSummary.total === 0 ? (
        renderEmptyState({
          icon: <ArrowUpDown className="w-6 h-6" />,
          title: tr('drive.transfer_empty_title', 'Transfer queue is clear'),
          description: tr('drive.transfer_empty_copy', 'New uploads will appear here so you can track progress without leaving the drive.'),
          primaryLabel: tr('drive.upload', 'Upload'),
          onPrimary: handleUpload,
          secondaryLabel: tr('drive.empty_primary_files', 'Open files'),
          onSecondary: () => setActivePrimaryTab('files'),
        })
      ) : (
        <>
          <div className="drive-page__transfer-actions">
            <button
              type="button"
              className="drive-page__transfer-clear"
              onClick={clearFinishedTransferTasks}
              disabled={transferSummary.success + transferSummary.failed === 0}
            >
              {tr('drive.transfer_clear_finished', 'Clear finished')}
            </button>
          </div>
          <div className="drive-page__transfer-list">
            {transferTasks.map((task) => (
              <div key={task.id} className="drive-page__transfer-item">
                <div className="drive-page__transfer-top">
                  <span className="drive-page__transfer-name">{task.name}</span>
                  <span className={`drive-page__transfer-status is-${task.status}`}>
                    {getTransferStatusLabel(task.status)}
                  </span>
                </div>
                <div className="drive-page__transfer-meta">
                  <span>{tr('drive.transfer_upload', 'Upload')}</span>
                  <span>|</span>
                  <span>{formatSize(task.size)}</span>
                  <span>|</span>
                  <span>{formatRelativeTime(task.completedAt || task.startedAt)}</span>
                </div>
                {task.error ? <div className="drive-page__transfer-error">{task.error}</div> : null}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );

  const renderCategoryPanel = () => (
    <section className="drive-page__panel-shell">
      {renderSectionHeading(
        tr('drive.category_title', 'Category browse'),
        tr('drive.category_subtitle', 'Jump directly by file type'),
        formatCountLabel(activeCategoryCount, 'active category')
      )}

      <div className="drive-page__category-spotlight">
        <div className="drive-page__spotlight-head">
          <div className="drive-page__spotlight-title">
            {tr('drive.category_spotlight_title', 'Top category')}
          </div>
          <div className="drive-page__spotlight-copy">
            {leadingCategoryCard
              ? `${leadingCategoryCard.label} • ${formatCountLabel(leadingCategoryCard.count, 'item')} • ${formatSize(leadingCategoryCard.size)}`
              : tr('drive.category_spotlight_empty', 'No file type has taken the lead yet.')}
          </div>
        </div>
        {leadingCategoryCard ? (
          <button
            type="button"
            className="drive-page__category-spotlight-action"
            onClick={() => handleCategoryOpen(leadingCategoryCard.type)}
          >
            {tr('drive.category_spotlight_action', 'Open top category')}
          </button>
        ) : null}
      </div>

      {activeCategoryCount === 0 ? (
        renderEmptyState({
          icon: <Layers3 className="w-6 h-6" />,
          title: tr('drive.category_empty_title', 'No categories to browse yet'),
          description: tr('drive.category_empty_copy', 'Once files arrive, category browse becomes the fastest way to jump by media type.'),
          primaryLabel: tr('drive.upload', 'Upload'),
          onPrimary: handleUpload,
          secondaryLabel: tr('drive.empty_primary_files', 'Open files'),
          onSecondary: () => setActivePrimaryTab('files'),
        })
      ) : (
        <div className="drive-page__category-grid">
          {categoryCards.map((card) => (
            <button
              key={card.type}
              type="button"
              className="drive-page__category-card"
              onClick={() => handleCategoryOpen(card.type)}
            >
              <div className="drive-page__category-label">{card.label}</div>
              <div className="drive-page__category-metric">{formatCountLabel(card.count, 'item')}</div>
              <div className="drive-page__category-size">{formatSize(card.size)}</div>
            </button>
          ))}
        </div>
      )}
    </section>
  );

  const renderSpacePanel = () => (
    <section className="drive-page__panel-shell">
      {renderSectionHeading(
        tr('drive.space_title', 'Storage center'),
        tr('drive.space_panel_subtitle', 'Watch usage, compare file types and clear space before it becomes urgent.'),
        `${usedPercent.toFixed(0)}% ${tr('drive.hero_used_short', 'used')}`
      )}

      {stats ? (
        <>
          <div className="drive-page__space-advisor">
            <div className="drive-page__spotlight-head">
              <div className="drive-page__spotlight-title">{tr('drive.space_reclaim_title', 'Reclaim priority')}</div>
              <div className="drive-page__spotlight-copy">
                {tr(
                  'drive.space_reclaim_copy',
                  'Start with the heaviest media groups before touching lightweight docs.'
                )}
              </div>
            </div>
            <div className="drive-page__space-priority-list">
              {reclaimPriorityCards.map((item) => (
                <div key={item.type} className="drive-page__space-priority-row">
                  <span>{item.label}</span>
                  <strong>
                    {formatSize(item.size)} • {item.count}
                  </strong>
                </div>
              ))}
            </div>
          </div>

          <div className="drive-page__space-cards">
            <div className="drive-page__space-card">
              <div className="drive-page__space-label">{tr('drive.space_total', 'Total')}</div>
              <div className="drive-page__space-value">{formatSize(stats.total)}</div>
            </div>
            <div className="drive-page__space-card">
              <div className="drive-page__space-label">{tr('drive.used_space', 'Used')}</div>
              <div className="drive-page__space-value">{formatSize(stats.used)}</div>
            </div>
            <div className="drive-page__space-card">
              <div className="drive-page__space-label">{tr('drive.space_free', 'Free')}</div>
              <div className="drive-page__space-value">{formatSize(freeSpace)}</div>
            </div>
          </div>

          <div className="drive-page__hero-progress drive-page__hero-progress--compact">
            <div className="drive-page__hero-progress-bar">
              <div className="drive-page__hero-progress-value" style={{ width: `${usedPercent}%` }} />
            </div>
            <div className="drive-page__hero-progress-meta">
              <span>{tr('drive.space_used_ratio', 'Used ratio')}</span>
              <strong>{usedPercent.toFixed(1)}%</strong>
            </div>
          </div>

          <div className="drive-page__space-breakdown">
            {categoryCards
              .filter((item) => item.type !== 'folder')
              .map((item) => (
                <div key={item.type} className="drive-page__space-breakdown-row">
                  <span>{item.label}</span>
                  <span>{formatSize(item.size)}</span>
                </div>
              ))}
          </div>

          <div className="drive-page__space-tips">
            <div>{tr('drive.space_tip_one', 'Review large videos first to free up space quickly.')}</div>
            <div>{tr('drive.space_tip_two', 'Keep source files in cloud and export lightweight copies.')}</div>
            <div>{tr('drive.space_tip_three', 'Use folders plus naming rules for faster retrieval.')}</div>
          </div>
        </>
      ) : (
        renderEmptyState({
          icon: <PieChart className="w-6 h-6" />,
          title: tr('drive.space_error_title', 'Storage data is unavailable'),
          description: tr('drive.space_error_copy', 'File usage will appear here once the drive summary is reachable again.'),
          primaryLabel: tr('drive.empty_primary_files', 'Open files'),
          onPrimary: () => setActivePrimaryTab('files'),
        })
      )}
    </section>
  );

  return (
    <div className="drive-page h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar
        title={tr('drive.title', 'Drive')}
        onBack={onBack}
        rightElement={
          <button onClick={handleUpload} className="p-1 text-[var(--primary-color)]" aria-label={tr('drive.upload', 'Upload')}>
            <Upload className="w-5 h-5" />
          </button>
        }
      />

      <div className="drive-page__body flex-1 overflow-y-auto">
        <section className="drive-page__hero">
          <div className="drive-page__hero-head">
            <div className="drive-page__hero-copy">
              <div className="drive-page__hero-eyebrow">{tr('drive.hero_eyebrow', 'Drive workbench')}</div>
              <div className="drive-page__hero-title-row">
                <h1 className="drive-page__hero-title">{activeContext.title}</h1>
                <span className="drive-page__hero-badge">{activeContext.badge}</span>
              </div>
              <p className="drive-page__hero-subtitle">{activeContext.subtitle}</p>
            </div>

            <div className="drive-page__hero-meter">
              <span className="drive-page__hero-meter-label">{tr('drive.used_space', 'Used space')}</span>
              <strong className="drive-page__hero-meter-value">{usedPercent.toFixed(0)}%</strong>
              <span className="drive-page__hero-meter-meta">{formatSize(freeSpace)} {tr('drive.space_free', 'Free').toLowerCase()}</span>
            </div>
          </div>

          <div className="drive-page__hero-progress">
            <div className="drive-page__hero-progress-bar">
              <div className="drive-page__hero-progress-value" style={{ width: `${usedPercent}%` }} />
            </div>
            <div className="drive-page__hero-progress-meta">
              <span>
                {formatSize(stats?.used ?? 0)} / {formatSize(stats?.total ?? 0)}
              </span>
              <strong>{tr('drive.hero_progress_label', 'Storage health')}</strong>
            </div>
          </div>

          <div className="drive-page__hero-chips">
            {heroMetrics.map((metric) => (
              <div key={metric.label} className="drive-page__hero-chip">
                <span className="drive-page__hero-chip-label">{metric.label}</span>
                <strong className="drive-page__hero-chip-value">{metric.value}</strong>
              </div>
            ))}
          </div>

          <div className="drive-page__quick-actions">
            <button type="button" className="drive-page__quick-action" onClick={handleUpload}>
              <span className="drive-page__quick-action-icon">
                <Upload className="w-4 h-4" />
              </span>
              <span className="drive-page__quick-action-main">
                <span className="drive-page__quick-action-label">{tr('drive.upload', 'Upload')}</span>
                <span className="drive-page__quick-action-meta">{tr('drive.quick_action_upload', 'Bring in files')}</span>
              </span>
            </button>

            <button type="button" className="drive-page__quick-action" onClick={() => handleTabShortcut('recent')}>
              <span className="drive-page__quick-action-icon">
                <Clock3 className="w-4 h-4" />
              </span>
              <span className="drive-page__quick-action-main">
                <span className="drive-page__quick-action-label">{tr('drive.tabs.recent', 'Recent')}</span>
                <span className="drive-page__quick-action-meta">{tr('drive.quick_action_recent', 'Resume work')}</span>
              </span>
            </button>

            <button type="button" className="drive-page__quick-action" onClick={() => handleTabShortcut('category')}>
              <span className="drive-page__quick-action-icon">
                <Layers3 className="w-4 h-4" />
              </span>
              <span className="drive-page__quick-action-main">
                <span className="drive-page__quick-action-label">{tr('drive.tabs.category', 'Category')}</span>
                <span className="drive-page__quick-action-meta">{tr('drive.quick_action_category', 'Browse by type')}</span>
              </span>
            </button>

            <button type="button" className="drive-page__quick-action" onClick={() => handleTabShortcut('space')}>
              <span className="drive-page__quick-action-icon">
                <PieChart className="w-4 h-4" />
              </span>
              <span className="drive-page__quick-action-main">
                <span className="drive-page__quick-action-label">{tr('drive.tabs.space', 'Space')}</span>
                <span className="drive-page__quick-action-meta">{tr('drive.quick_action_space', 'Manage storage')}</span>
              </span>
            </button>
          </div>
        </section>

        {activePrimaryTab === 'files' && renderFilesPanel()}
        {activePrimaryTab === 'recent' && renderRecentPanel()}
        {activePrimaryTab === 'transfer' && renderTransferPanel()}
        {activePrimaryTab === 'category' && renderCategoryPanel()}
        {activePrimaryTab === 'space' && renderSpacePanel()}
      </div>

      <nav className="drive-page__tabbar" role="tablist" aria-label={tr('drive.tabs_label', 'Drive tabs')}>
        {tabs.map((tab) => {
          const active = tab.id === activePrimaryTab;
          const badge = getTabBadge(tab.id);

          return (
            <button
              key={tab.id}
              type="button"
              className={`drive-page__tabbar-item${active ? ' drive-page__tabbar-item--active' : ''}`}
              onClick={() => setActivePrimaryTab(tab.id)}
              role="tab"
              aria-selected={active}
              aria-current={active ? 'page' : undefined}
            >
              {badge ? <span className="drive-page__tabbar-badge">{badge}</span> : null}
              {renderTabIcon(tab.id, active)}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} multiple />
    </div>
  );
};

export default CloudDrivePage;
