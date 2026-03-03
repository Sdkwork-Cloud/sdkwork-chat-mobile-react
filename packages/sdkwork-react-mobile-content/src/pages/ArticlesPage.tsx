import React from 'react';
import { Button, Icon, Navbar, Skeleton, Toast } from '@sdkwork/react-mobile-commons';
import { useContent } from '../hooks/useContent';
import type { Article } from '../types';
import './ArticlesPage.css';

interface ArticlesPageProps {
  articleId?: string;
  onBack?: () => void;
  onArticleClick?: (id: string) => void;
}

const formatCount = (value: number) => (value > 10000 ? `${(value / 10000).toFixed(1)}w+` : `${value}`);

const formatPublishTime = (value?: Date | string, fallback?: number) => {
  const date = value ? new Date(value) : fallback ? new Date(fallback) : null;
  if (!date || Number.isNaN(date.getTime())) return '--';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const DetailView: React.FC<{
  article: Article | null;
  loading: boolean;
  onBack?: () => void;
  onLike: (id: string) => Promise<void>;
}> = ({ article, loading, onBack, onLike }) => {
  if (loading) {
    return (
      <div className="content-page">
        <Navbar title="文章详情" onBack={onBack} />
        <div className="content-page__skeleton">
          <Skeleton width="70%" height={26} style={{ borderRadius: '8px', marginBottom: '14px' }} />
          <Skeleton width="100%" height={180} style={{ borderRadius: '12px', marginBottom: '16px' }} />
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={`detail-skeleton-${index}`} width={index === 5 ? '82%' : '100%'} height={14} style={{ borderRadius: '8px', marginBottom: '10px' }} />
          ))}
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="content-page">
        <Navbar title="文章详情" onBack={onBack} />
        <div className="content-page__empty">
          <div className="content-page__empty-icon">📄</div>
          <div className="content-page__empty-text">文章不存在或已删除</div>
        </div>
      </div>
    );
  }

  const paragraphs = (article.content || '').split('\n').filter((line) => line.trim());

  return (
    <div className="content-page">
      <Navbar
        title="文章详情"
        onBack={onBack}
        rightElement={(
          <button
            type="button"
            className="content-page__nav-action"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(window.location.href);
                Toast.success('链接已复制');
              } catch (error) {
                Toast.error('复制失败');
              }
            }}
            aria-label="share"
          >
            <Icon name="share" size={18} />
          </button>
        )}
      />

      <div className="content-detail">
        <h1 className="content-detail__title">{article.title}</h1>
        <div className="content-detail__meta">
          <div className="content-detail__author">
            <img src={article.authorAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${article.author}`} alt={article.author} />
            <div>
              <div>{article.author}</div>
              <div>{formatPublishTime(article.publishTime, article.createTime)} · {article.readTime} 分钟阅读</div>
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
            : <p>暂无正文内容。</p>}
        </div>

        <div className="content-detail__bottom">
          <span>阅读 {formatCount(article.views || 0)}</span>
          <span>评论 {formatCount(article.comments || 0)}</span>
          <span>点赞 {formatCount(article.likes || 0)}</span>
        </div>
      </div>
    </div>
  );
};

export const ArticlesPage: React.FC<ArticlesPageProps> = ({ articleId, onBack, onArticleClick }) => {
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
        onLike={async (id) => {
          await likeArticle(id);
          Toast.success('已点赞');
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
      <Navbar title="文章" onBack={onBack} />

      <div className="content-list">
        <div className="content-list__search">
          <Icon name="search" size={16} color="var(--text-secondary)" />
          <input
            value={keyword}
            onChange={(event) => {
              void handleSearch(event.target.value);
            }}
            placeholder="搜索文章"
          />
        </div>

        {error ? (
          <div className="content-list__error">
            <span>{error}</span>
            <Button size="sm" variant="ghost" onClick={clearError}>
              关闭
            </Button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="content-list__skeletons">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={`articles-list-skeleton-${index}`} width="100%" height={112} style={{ borderRadius: '12px', marginBottom: '10px' }} />
            ))}
          </div>
        ) : null}

        {!isLoading && articles.length === 0 ? (
          <div className="content-page__empty">
            <div className="content-page__empty-icon">📰</div>
            <div className="content-page__empty-text">暂无文章</div>
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
                  <span>{formatCount(article.views || 0)} 阅读</span>
                  <span>{article.readTime} 分钟</span>
                </div>
              </div>
            </button>
          ))}
      </div>
    </div>
  );
};

export default ArticlesPage;
