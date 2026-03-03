import React, { useRef } from 'react';
import { Navbar } from '@sdkwork/react-mobile-commons';
import { Folder, FileText, Image, Music, MoreVertical, Upload } from 'lucide-react';
import { useDrive } from '../hooks/useDrive';

interface CloudDrivePageProps {
  t?: (key: string) => string;
  onBack?: () => void;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'folder':
      return <Folder className="w-10 h-10 text-yellow-500" />;
    case 'image':
      return <Image className="w-10 h-10 text-blue-500" />;
    case 'audio':
      return <Music className="w-10 h-10 text-green-500" />;
    default:
      return <FileText className="w-10 h-10 text-gray-500" />;
  }
};

const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const CloudDrivePage: React.FC<CloudDrivePageProps> = ({ t, onBack }) => {
  const tr = (key: string, fallback: string) => {
    const value = t?.(key) ?? key;
    return value === key ? fallback : value;
  };

  const { files, stats, isLoading, setCurrentFolder, uploadFile, deleteFile } = useDrive();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const usedPercent = stats ? (stats.used / stats.total) * 100 : 0;

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

      {/* Storage Stats */}
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
        </div>
      )}

      {/* File List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : files.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-gray-400">
            {tr('drive.empty', '暂无文件')}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800">
            {files.map((file) => (
              <div
                key={file.id}
                onClick={() => file.type === 'folder' && setCurrentFolder(file.id)}
                className="flex items-center px-4 py-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer"
              >
                {getIcon(file.type)}
                <div className="flex-1 ml-3">
                  <div className="text-gray-900 dark:text-white font-medium">{file.name}</div>
                  {file.type !== 'folder' && (
                    <div className="text-xs text-gray-500">{formatSize(file.size)}</div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFile(file.id);
                  }}
                  className="p-2 text-gray-400"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
    </div>
  );
};

export default CloudDrivePage;
