import { create } from 'zustand';
import { Article, ContentFilter, ContentStats } from '../types';
import { articleService } from '../services/ArticleService';

interface ContentStore {
  articles: Article[];
  currentArticle: Article | null;
  stats: ContentStats | null;
  isLoading: boolean;
  error: string | null;
  filter: ContentFilter;
  
  loadArticles: (filter?: ContentFilter) => Promise<void>;
  loadArticleById: (id: string) => Promise<void>;
  createArticle: (articleData: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateArticle: (id: string, updates: Partial<Article>) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
  likeArticle: (id: string) => Promise<void>;
  viewArticle: (id: string) => Promise<void>;
  loadStats: () => Promise<void>;
  searchArticles: (query: string) => Promise<void>;
  setFilter: (filter: ContentFilter) => void;
  clearError: () => void;
}

export const useContentStore = create<ContentStore>((set, get) => ({
  articles: [],
  currentArticle: null,
  stats: null,
  isLoading: false,
  error: null,
  filter: {},

  loadArticles: async (filter?: ContentFilter) => {
    set({ isLoading: true, error: null });
    try {
      const articles = await articleService.getArticles(filter);
      set({ articles, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  loadArticleById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const article = await articleService.getArticleById(id);
      set({ currentArticle: article, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createArticle: async (articleData) => {
    set({ isLoading: true, error: null });
    try {
      const article = await articleService.createArticle(articleData);
      set(state => ({ 
        articles: [article, ...state.articles],
        isLoading: false 
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateArticle: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const article = await articleService.updateArticle(id, updates);
      set(state => ({
        articles: state.articles.map(a => a.id === id ? article : a),
        currentArticle: state.currentArticle?.id === id ? article : state.currentArticle,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deleteArticle: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await articleService.deleteArticle(id);
      set(state => ({
        articles: state.articles.filter(a => a.id !== id),
        currentArticle: state.currentArticle?.id === id ? null : state.currentArticle,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  likeArticle: async (id) => {
    try {
      await articleService.likeArticle(id);
      set(state => ({
        articles: state.articles.map(a => 
          a.id === id ? { ...a, likes: a.likes + 1 } : a
        ),
        currentArticle: state.currentArticle?.id === id 
          ? { ...state.currentArticle, likes: state.currentArticle.likes + 1 }
          : state.currentArticle,
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  viewArticle: async (id) => {
    try {
      await articleService.viewArticle(id);
      set(state => ({
        articles: state.articles.map(a => 
          a.id === id ? { ...a, views: a.views + 1 } : a
        ),
        currentArticle: state.currentArticle?.id === id 
          ? { ...state.currentArticle, views: state.currentArticle.views + 1 }
          : state.currentArticle,
      }));
    } catch (error) {
      console.error('Failed to record view:', error);
    }
  },

  loadStats: async () => {
    try {
      const stats = await articleService.getContentStats();
      set({ stats });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  },

  searchArticles: async (query) => {
    set({ isLoading: true, error: null });
    try {
      const articles = await articleService.searchArticles(query);
      set({ articles, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  setFilter: (filter) => {
    set({ filter });
    get().loadArticles(filter);
  },

  clearError: () => set({ error: null }),
}));
