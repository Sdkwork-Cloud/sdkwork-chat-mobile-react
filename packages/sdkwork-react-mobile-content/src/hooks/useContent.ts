import { useCallback } from 'react';
import { useContentStore } from '../stores/contentStore';

export const useContent = () => {
  const articles = useContentStore((state) => state.articles);
  const currentArticle = useContentStore((state) => state.currentArticle);
  const stats = useContentStore((state) => state.stats);
  const isLoading = useContentStore((state) => state.isLoading);
  const error = useContentStore((state) => state.error);
  const filter = useContentStore((state) => state.filter);

  const loadArticles = useContentStore((state) => state.loadArticles);
  const loadArticleById = useContentStore((state) => state.loadArticleById);
  const createArticle = useContentStore((state) => state.createArticle);
  const updateArticle = useContentStore((state) => state.updateArticle);
  const deleteArticle = useContentStore((state) => state.deleteArticle);
  const likeArticle = useContentStore((state) => state.likeArticle);
  const viewArticle = useContentStore((state) => state.viewArticle);
  const loadStats = useContentStore((state) => state.loadStats);
  const searchArticles = useContentStore((state) => state.searchArticles);
  const setFilter = useContentStore((state) => state.setFilter);
  const clearError = useContentStore((state) => state.clearError);

  const refreshArticles = useCallback(() => {
    return loadArticles(filter);
  }, [filter, loadArticles]);

  const getArticleById = useCallback(
    (id: string) => {
      return articles.find((article) => article.id === id) || null;
    },
    [articles]
  );

  const filterByCategory = useCallback(
    (category: string) => {
      setFilter({ ...filter, category });
    },
    [filter, setFilter]
  );

  const filterByTags = useCallback(
    (tags: string[]) => {
      setFilter({ ...filter, tags });
    },
    [filter, setFilter]
  );

  const clearFilters = useCallback(() => {
    setFilter({});
  }, [setFilter]);

  return {
    articles,
    currentArticle,
    stats,
    isLoading,
    error,
    filter,
    loadArticles,
    loadArticleById,
    createArticle,
    updateArticle,
    deleteArticle,
    likeArticle,
    viewArticle,
    loadStats,
    searchArticles,
    setFilter,
    clearError,
    refreshArticles,
    getArticleById,
    filterByCategory,
    filterByTags,
    clearFilters,
  };
};

export default useContent;
