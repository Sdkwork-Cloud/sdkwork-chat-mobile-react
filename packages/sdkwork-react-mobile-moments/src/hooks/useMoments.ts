import { useCallback, useEffect } from 'react';
import { useMomentsStore } from '../stores/momentsStore';

export function useMoments() {
  const moments = useMomentsStore((state) => state.moments);
  const isLoading = useMomentsStore((state) => state.isLoading);
  const error = useMomentsStore((state) => state.error);

  const loadMoments = useMomentsStore((state) => state.loadMoments);
  const publishMoment = useMomentsStore((state) => state.publishMoment);
  const likeMoment = useMomentsStore((state) => state.likeMoment);
  const commentMoment = useMomentsStore((state) => state.commentMoment);

  const handlePublish = useCallback(
    async (content: string, images?: string[]) => {
      await publishMoment(content, images);
    },
    [publishMoment],
  );

  const handleLike = useCallback(
    async (id: string) => {
      await likeMoment(id);
    },
    [likeMoment],
  );

  const handleComment = useCallback(
    async (id: string, text: string) => {
      await commentMoment(id, text);
    },
    [commentMoment],
  );

  return {
    moments,
    isLoading,
    error,
    loadMoments,
    publishMoment: handlePublish,
    likeMoment: handleLike,
    commentMoment: handleComment,
  };
}

export function useMomentsFeed() {
  const moments = useMomentsStore((state) => state.moments);
  const isLoading = useMomentsStore((state) => state.isLoading);
  const loadMoments = useMomentsStore((state) => state.loadMoments);

  useEffect(() => {
    void loadMoments(1);
  }, [loadMoments]);

  return {
    moments,
    isLoading,
    loadMore: () => loadMoments(Math.ceil(moments.length / 10) + 1),
  };
}
