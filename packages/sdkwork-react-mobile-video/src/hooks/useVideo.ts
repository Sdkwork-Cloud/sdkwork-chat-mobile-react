import { useEffect } from 'react';
import { useVideoStore } from '../stores/videoStore';
import type { VideoType } from '../types';

export function useVideo(type?: VideoType) {
  const videos = useVideoStore((state) => state.videos);
  const isLoading = useVideoStore((state) => state.isLoading);
  const error = useVideoStore((state) => state.error);
  const loadVideos = useVideoStore((state) => state.loadVideos);
  const likeVideo = useVideoStore((state) => state.likeVideo);

  useEffect(() => {
    void loadVideos(type);
  }, [loadVideos, type]);

  return {
    videos,
    isLoading,
    error,
    likeVideo,
  };
}
