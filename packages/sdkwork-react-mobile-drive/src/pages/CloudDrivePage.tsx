import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navbar } from '@sdkwork/react-mobile-commons';
import {
  ChevronRight,
  Clock3,
  FileText,
  Folder,
  Grid3X3,
  Home,
  Image as ImageIcon,
  List,
  MoreVertical,
  Music,
  Upload,
  Video,
} from 'lucide-react';
import { useDrive } from '../hooks/useDrive';
import { fileService } from '../services/FileService';
import type { DriveFile, FileType } from '../types';

interface CloudDrivePageProps {
  t?: (key: string) => string;
  onBack?: () => void;
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
  if (type === 'folder') return '📁';
  if (type === 'image') return '🖼️';
  if (type === 'video') return '🎬';
  if (type === 'audio') return '🎵';
  return '📄';
};

const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

export const CloudDrivePage: React.FC<CloudDrivePageProps> = ({ t, onBack }) => {
  const tr = (key: string, fallback: string) => {
    const value = t?.(key) ?? key;
    return value === key ? fallback : value;
  };

  const { files, stats, isLoading, error, currentFolder, setCurrentFolder, uploadFile, deleteFile } = useDrive();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeFilter, setActiveFilter] = useState<FileFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ id: string; name: string }>>([]);
  const [recentFiles, setRecentFiles] = useState<DriveFile[]>([]);
  const [isRecentLoading, setIsRecentLoading] = useState(false);

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile(file);
    }
    e.currentTarget.value = '';
  };

  const usedPercent = stats ? (stats.used / stats.total) * 100 : 0;
  const rootFolderLabel = tr('drive.root', '我的网盘');

  const filterOptions = useMemo<Array<{ id: FileFilter; label: string }>>(
    () => [
      { id: 'all', label: tr('drive.filters.all', '全部') },
      { id: 'folder', label: tr('drive.filters.folder', '文件夹') },
      { id: 'image', label: tr('drive.filters.image', '图片') },
      { id: 'video', label: tr('drive.filters.video', '视频') },
      { id: 'document', label: tr('drive.filters.document', '文档') },
      { id: 'audio', label: tr('drive.filters.audio', '音频') },
    ],
    [tr]
  );

  const storageTags = useMemo(
    () => [
      { key: 'image', label: tr('drive.filters.image', '图片'), value: stats?.image ?? 0 },
      { key: 'video', label: tr('drive.filters.video', '视频'), value: stats?.video ?? 0 },
      { key: 'document', label: tr('drive.filters.document', '文档'), value: stats?.document ?? 0 },
      { key: 'audio', label: tr('drive.filters.audio', '音频'), value: stats?.audio ?? 0 },
    ],
    [stats, tr]
  );

  const filteredFiles = useMemo(
    () => files.filter((file) => activeFilter === 'all' || file.type === activeFilter),
    [activeFilter, files]
  );

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

  const loadRecentFiles = useCallback(async () => {
    setIsRecentLoading(true);
    try {
      const rootFiles = await fileService.getFiles(null);
      const folderFiles = rootFiles.filter((item) => item.type === 'folder');
      const nestedResults = await Promise.all(folderFiles.map((folder) => fileService.getFiles(folder.id)));
      const candidateFiles = [...rootFiles, ...nestedResults.flat()].filter((item) => item.type !== 'folder');
      const topRecent = candidateFiles
        .sort((a, b) => (b.updateTime ?? b.createTime) - (a.updateTime ?? a.createTime))
        .slice(0, 5);
      setRecentFiles(topRecent);
    } catch (recentError) {
      console.error('[CloudDrivePage] failed to load recent files:', recentError);
      setRecentFiles([]);
    } finally {
      setIsRecentLoading(false);
    }
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
      <span>{file.type === 'folder' ? tr('drive.folder', '文件夹') : formatSize(file.size)}</span>
      <span>·</span>
      <span>{formatRelativeTime(file.updateTime || file.createTime)}</span>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar
        title={tr('drive.title', '云盘')}
        onBack={onBack}
        rightElement={(
          <button onClick={handleUpload} className="p-1 text-[var(--primary-color)]" aria-label={tr('drive.upload', '上传')}>
            <Upload className="w-5 h-5" />
          </button>
        )}
      />

      {stats && (
        <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">{tr('drive.used_space', '已用空间')}</span>
            <span className="text-sm font-medium">
              {formatSize(stats.used)} / {formatSize(stats.total)}
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${usedPercent}%` }}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto mt-3 pb-1">
            {storageTags.map((item) => (
              <div
                key={item.key}
                className="shrink-0 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-700/30 px-2 py-1"
              >
                <div className="text-[11px] text-gray-500">{item.label}</div>
                <div className="text-xs font-medium text-gray-700 dark:text-gray-200">{formatSize(item.value)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-3 pb-2 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center text-xs text-gray-500 mb-2 overflow-x-auto">
            <button type="button" onClick={() => handleNavigateBreadcrumb(-1)} className="inline-flex items-center">
              <Home className="w-3.5 h-3.5 mr-1" />
              {rootFolderLabel}
            </button>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.id}>
                <ChevronRight className="w-3.5 h-3.5 mx-1 opacity-70" />
                <button
                  type="button"
                  onClick={() => handleNavigateBreadcrumb(index)}
                  className="inline-flex items-center whitespace-nowrap"
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="text-xs text-gray-500">
              {tr('drive.current_file_count', '当前目录文件数')} {filteredFiles.length}
            </div>
            <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 ${viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-700 text-blue-500' : 'text-gray-400'}`}
                aria-label={tr('drive.view_list', '列表视图')}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-700 text-blue-500' : 'text-gray-400'}`}
                aria-label={tr('drive.view_grid', '网格视图')}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {filterOptions.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs border transition-colors ${
                  activeFilter === filter.id
                    ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300'
                    : 'border-gray-200 text-gray-500 dark:border-gray-700 dark:text-gray-300'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1">
              <Clock3 className="w-4 h-4" />
              {tr('drive.recent', '最近文件')}
            </div>
          </div>
          {isRecentLoading ? (
            <div className="text-xs text-gray-400">{tr('drive.loading_recent', '正在加载最近文件...')}</div>
          ) : recentFiles.length === 0 ? (
            <div className="text-xs text-gray-400">{tr('drive.empty_recent', '暂无最近文件')}</div>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {recentFiles.map((file) => (
                <div
                  key={file.id}
                  className="shrink-0 w-32 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2"
                >
                  <div className="h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-2xl">
                    {getPlaceholder(file.type)}
                  </div>
                  <div className="mt-2 text-xs text-gray-800 dark:text-gray-100 truncate">{file.name}</div>
                  <div className="text-[10px] text-gray-500 truncate">
                    {file.type === 'folder' ? tr('drive.folder', '文件夹') : formatSize(file.size)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-gray-400">
            {error ? tr('drive.load_failed', '加载文件失败，请稍后重试') : tr('drive.empty', '暂无文件')}
          </div>
        ) : (
          viewMode === 'list' ? (
            <div className="bg-white dark:bg-gray-800">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  onClick={() => file.type === 'folder' && handleOpenFolder(file)}
                  className={`flex items-center px-4 py-3 border-b border-gray-100 dark:border-gray-700 ${
                    file.type === 'folder' ? 'cursor-pointer' : ''
                  }`}
                >
                  {getIcon(file.type)}
                  <div className="flex-1 ml-3 min-w-0">
                    <div className="text-gray-900 dark:text-white font-medium truncate">{file.name}</div>
                    {renderFileMeta(file)}
                  </div>
                  {file.type === 'folder' ? (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const confirmed = window.confirm(tr('drive.confirm_delete', '确定删除该文件吗？'));
                        if (confirmed) {
                          void deleteFile(file.id);
                        }
                      }}
                      className="p-2 text-gray-400"
                      aria-label={tr('drive.delete', '删除')}
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 pb-4">
              <div className="grid grid-cols-2 gap-3">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => file.type === 'folder' && handleOpenFolder(file)}
                    className={`rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 ${
                      file.type === 'folder' ? 'cursor-pointer' : ''
                    }`}
                  >
                    <div className="h-20 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-3xl mb-2">
                      {getPlaceholder(file.type)}
                    </div>
                    <div className="text-sm text-gray-900 dark:text-white truncate">{file.name}</div>
                    {renderFileMeta(file)}
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>

      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
    </div>
  );
};

export default CloudDrivePage;
