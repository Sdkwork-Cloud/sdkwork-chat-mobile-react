import React from 'react';
import { Button, Icon, Navbar, Skeleton, Toast } from '@sdkwork/react-mobile-commons';
import { useOptionalTranslation } from '@/src/core/i18n/I18nContext';
import { useContent } from '../hooks/useContent';
import type { Article } from '../types';
import './ArticlesPage.css';

interface ArticlesPageProps {
  articleId?: string;
  onBack?: () => void;
  onArticleClick?: (id: string) => void;
}

const formatCount = (value: number) => (value > 10000 ? `${(value / 10000).toFixed(1)}w+` : `${value}`);

const interpolate = (message: string, params?: Record<string, string | number>) => {
  if (!params) {
    return message;
  }

  return Object.entries(params).reduce((output, [key, value]) => {
    return output
      .replace(new RegExp(`\\{${key}\\}`, 'g'), String(value))
      .replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
  }, message);
};

const DetailView: React.FC<{
  article: Article | null;
  loading: boolean;
  onBack?: () => void;
  onLike: (id: string) => Promise<void>;
  tr: (key: string, fallback: string, params?: Record<string, string | number>) => string;
  formatDate: (value?: Date | string, fallback?: number) => string;
}> = ({ article, loading, onBack, onLike, tr, formatDate }) => {
  if (loading) {
    return (
      <div className="content-page">
        <Navbar title={tr('content.articles.detail_title', 'Article Details')} onBack={onBack} />
        <div className="content-page__skeleton">
          <Skeleton width="70%" height={26} style={{ borderRadius: '8px', marginBottom: '14px' }} />
          <Skeleton width="100%" height={180} style={{ borderRadius: '12px', marginBottom: '16px' }} />
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton
              key={`detail-skeleton-${index}`}
              width={index === 5 ? '82%' : '100%'}
              height={14}
              style={{ borderRadius: '8px', marginBottom: '10px' }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="content-page">
        <Navbar title={tr('content.articles.detail_title', 'Article Details')} onBack={onBack} />
        <div className="content-page__empty">
          <div className="content-page__empty-icon">📄</div>
          <div className="content-page__empty-text">
            {tr('content.articles.missing', 'The article is unavailable or has been removed')}
          </div>
        </div>
      </div>
    );
  }

  const paragraphs = (article.content || '').split('\n').filter((line) => line.trim());

  return (
    <div className="content-page">
      <Navbar
        title={tr('content.articles.detail_title', 'Article Details')}
        onBack={onBack}
        rightElement={(
          <button
            type="button"
            className="content-page__nav-action"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(window.location.href);
                Toast.success(tr('content.articles.copySuccess', 'Link copied'));
              } catch (_error) {
                Toast.error(tr('content.articles.copyFailed', 'Failed to copy link'));
              }
            }}
            aria-label={tr('content.articles.share', 'Share')}
          >
            <Icon name="share" size={18} />
          </button>
        )}
      />

      <div className="content-detail">
        <h1 className="content-detail__title">{article.title}</h1>
        <div className="content-detail__meta">
          <div className="content-detail__author">
            <img
              src={article.authorAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${article.author}`}
              alt={article.author}
            />
            <div>
              <div>{article.author}</div>
              <div>
                {formatDate(article.publishTime, article.createTime)} ·{' '}
                {tr('content.articles.minutesRead', '{count} min read', { count: article.readTime })}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="content-detail__like"
            onClick={() => void onLike(article.id)}
          >
            <Icon name="heart" size={16} />
            <span>{formatCount(article.likes || 0)}</span>
          </button>
        </div>

        {article.coverImage ? (
          <div className="content-detail__cover">
            <img src={article.coverImage} alt={article.title} />
          </div>
        ) : null}

        <p className="content-detail__summary">{article.summary}</p>

        <div className="content-detail__body">
          {paragraphs.length > 0
            ? paragraphs.map((line, index) => <p key={`${article.id}-line-${index}`}>{line}</p>)
            : <p>{tr('content.articles.emptyBody', 'No article body available yet.')}</p>}
        </div>

        <div className="content-detail__bottom">
          <span>{tr('content.articles.read', 'Read')} {formatCount(article.views || 0)}</span>
          <span>{tr('content.articles.comments', 'Comments')} {formatCount(article.comments || 0)}</span>
          <span>{tr('content.articles.likes', 'Likes')} {formatCount(article.likes || 0)}</span>
        </div>
      </div>
    </div>
  );
};

export const ArticlesPage: React.FC<ArticlesPageProps> = ({ articleId, onBack, onArticleClick }) => {
  const appI18n = useOptionalTranslation();
  const {
    articles,
    currentArticle,
    isLoading,
    error,
    loadArticles,
    loadArticleById,
    likeArticle,
    viewArticle,
    searchArticles,
    clearError,
  } = useContent();
  const [keyword, setKeyword] = React.useState('');

  const tr = React.useCallback(
    (key: string, fallback: string, params?: Record<string, string | number>) => {
      const translated = appI18n?.t(key, params);
      if (translated && translated !== key) {
        return translated;
      }
      return interpolate(fallback, params);
    },
    [appI18n]
  );

  const formatDate = React.useCallback(
    (value?: Date | string, fallback?: number) => {
      const date = value ? new Date(value) : fallback ? new Date(fallback) : null;
      if (!date || Number.isNaN(date.getTime())) {
        return '--';
      }

      if (appI18n) {
        return appI18n.formatDate(date, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
      }

      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
        date.getDate()
      ).padStart(2, '0')}`;
    },
    [appI18n]
  );

  React.useEffect(() => {
    if (articleId) {
      void loadArticleById(articleId);
      void viewArticle(articleId);
      return;
    }
    void loadArticles();
  }, [articleId, loadArticleById, loadArticles, viewArticle]);

  const isDetailMode = !!articleId;

  if (isDetailMode) {
    return (
      <DetailView
        article={currentArticle}
        loading={isLoading}
        onBack={onBack}
        tr={tr}
        formatDate={formatDate}
        onLike={async (id) => {
          await likeArticle(id);
          Toast.success(tr('content.articles.liked', 'Added to likes'));
        }}
      />
    );
  }

  const handleSearch = async (value: string) => {
    const next = value.trim();
    setKeyword(value);
    if (!next) {
      await loadArticles();
      return;
    }
    await searchArticles(next);
  };

  return (
    <div className="content-page">
      <Navbar title={tr('content.articles.title', 'Articles')} onBack={onBack} />

      <div className="content-list">
        <div className="content-list__search">
          <Icon name="search" size={16} color="var(--text-secondary)" />
          <input
            value={keyword}
            onChange={(event) => {
              void handleSearch(event.target.value);
            }}
            placeholder={tr('content.articles.searchPlaceholder', 'Search articles')}
          />
        </div>

        {error ? (
          <div className="content-list__error">
            <span>{error}</span>
            <Button size="sm" variant="ghost" onClick={clearError}>
              {tr('content.articles.close', 'Close')}
            </Button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="content-list__skeletons">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton
                key={`articles-list-skeleton-${index}`}
                width="100%"
                height={112}
                style={{ borderRadius: '12px', marginBottom: '10px' }}
              />
            ))}
          </div>
        ) : null}

        {!isLoading && articles.length === 0 ? (
          <div className="content-page__empty">
            <div className="content-page__empty-icon">📰</div>
            <div className="content-page__empty-text">
              {tr('content.articles.noArticles', 'No articles')}
            </div>
          </div>
        ) : null}

        {!isLoading &&
          articles.map((article) => (
            <button
              key={article.id}
              type="button"
              className="content-list__card"
              onClick={() => {
                onArticleClick?.(article.id);
              }}
            >
              {article.coverImage ? (
                <div className="content-list__card-cover">
                  <img src={article.coverImage} alt={article.title} />
                </div>
              ) : null}
              <div className="content-list__card-main">
                <h3>{article.title}</h3>
                <p>{article.summary}</p>
                <div className="content-list__card-meta">
                  <span>{article.author}</span>
                  <span>{formatCount(article.views || 0)} {tr('content.articles.read', 'Read')}</span>
                  <span>{tr('content.articles.minutesRead', '{count} min read', { count: article.readTime })}</span>
                </div>
              </div>
            </button>
          ))}
      </div>
    </div>
  );
};

export default ArticlesPage;
