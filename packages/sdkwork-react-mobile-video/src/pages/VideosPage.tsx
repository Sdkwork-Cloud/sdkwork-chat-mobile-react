import React from 'react';
import { Heart, Eye, Play } from 'lucide-react';
import { Navbar } from '@sdkwork/react-mobile-commons';
import { useVideo } from '../hooks/useVideo';

interface VideosPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
  onVideoClick?: (video: any) => void;
}

const formatViews = (num: number): string => {
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
};

export const VideosPage: React.FC<VideosPageProps> = ({ t, onBack, onVideoClick }) => {
  const tr = (key: string, fallback: string) => {
    const value = t?.(key) ?? key;
    return value === key ? fallback : value;
  };

  const { videos, isLoading, likeVideo } = useVideo();

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar title={tr('discover.channels', '视频号')} onBack={onBack} />

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 p-2">
            {videos.map((video) => (
              <div
                key={video.id}
                onClick={() => onVideoClick?.(video)}
                className="relative aspect-[3/4] rounded-lg overflow-hidden cursor-pointer"
              >
                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <div className="text-white text-sm font-medium truncate">{video.title}</div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-white/80">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {formatViews(video.views)}
                    </span>
                    <span
                      className="flex items-center gap-1 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        likeVideo(video.id);
                      }}
                    >
                      <Heart className="w-3 h-3" />
                      {video.likes}
                    </span>
                  </div>
                </div>
                <div className="absolute top-2 right-2 w-8 h-8 bg-black/40 rounded-full flex items-center justify-center">
                  <Play className="w-4 h-4 text-white" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideosPage;
