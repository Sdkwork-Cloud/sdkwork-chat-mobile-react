import React from 'react';
import { Navbar, Toast } from '@sdkwork/react-mobile-commons';
import { useSocial } from '../hooks/useSocial';
import type { Moment } from '../types';
import './MomentsPage.css';

interface MomentsPageProps {
  onBack?: () => void;
  onProfileClick?: (author: string) => void;
}

interface ViewerState {
  open: boolean;
  urls: string[];
  index: number;
}

const MomentItem: React.FC<{
  item: Moment;
  onImageClick: (urls: string[], index: number) => void;
  onLike: (id: string) => void;
  onProfileClick?: (author: string) => void;
}> = ({ item, onImageClick, onLike, onProfileClick }) => {
  const renderImages = () => {
    if (!item.images || item.images.length === 0) return null;

    if (item.images.length === 1) {
      return (
        <div className="moments-page__single-image-wrap">
          <button type="button" className="moments-page__single-image-btn" onClick={() => onImageClick(item.images, 0)}>
            <img src={item.images[0]} alt="" className="moments-page__single-image" />
          </button>
        </div>
      );
    }

    return (
      <div className="moments-page__grid">
        {item.images.map((image, index) => (
          <button
            key={`${item.id}-image-${index}`}
            type="button"
            className="moments-page__grid-item"
            onClick={() => onImageClick(item.images, index)}
          >
            <img src={image} alt="" />
          </button>
        ))}
      </div>
    );
  };

  return (
    <article className="moments-page__item">
      <button
        type="button"
        className="moments-page__avatar-btn"
        onClick={() => {
          if (onProfileClick) {
            onProfileClick(item.author);
          }
        }}
      >
        <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${item.avatar}`} alt={item.author} className="moments-page__avatar" />
      </button>

      <div className="moments-page__item-main">
        <div className="moments-page__author">{item.author}</div>
        <div className="moments-page__content">{item.content}</div>

        {renderImages()}

        <div className="moments-page__meta">
          <div className="moments-page__meta-left">
            <span>{item.displayTime || '--'}</span>
            {item.hasLiked ? <span className="moments-page__liked">❤️ {item.likes}</span> : null}
          </div>
          <button type="button" className="moments-page__like-btn" onClick={() => onLike(item.id)}>
            ••
          </button>
        </div>

        {item.comments && item.comments.length > 0 ? (
          <div className="moments-page__comment-box">
            {item.comments.map((comment, index) => (
              <div key={`${item.id}-comment-${index}`} className="moments-page__comment-item">
                <span>{comment.user}</span>: <span>{comment.text}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
};

export const MomentsPage: React.FC<MomentsPageProps> = ({ onBack, onProfileClick }) => {
  const { moments, isLoading, loadMoments, publishMoment, likeMoment } = useSocial();
  const [hasMore, setHasMore] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [viewer, setViewer] = React.useState<ViewerState>({ open: false, urls: [], index: 0 });
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const headerBgRef = React.useRef<HTMLDivElement>(null);
  const headerContentRef = React.useRef<HTMLDivElement>(null);

  const loadData = React.useCallback(async (nextPage: number) => {
    const more = await loadMoments(nextPage);
    setHasMore(more);
    setPage(nextPage);
  }, [loadMoments]);

  React.useEffect(() => {
    void loadData(1);
  }, [loadData]);

  const handlePublish = async () => {
    const content = window.prompt('分享此刻想法', '今天天气真好 🌞');
    if (!content?.trim()) return;

    Toast.loading('发送中...');
    await publishMoment(content.trim());
    Toast.hide();
    Toast.success('发布成功');
    await loadData(1);
  };

  const handleLike = async (id: string) => {
    await likeMoment(id);
  };

  const handleImageClick = (urls: string[], index: number) => {
    setViewer({ open: true, urls, index });
  };

  const closeViewer = () => {
    setViewer((prev) => ({ ...prev, open: false }));
  };

  const moveViewer = (direction: -1 | 1) => {
    setViewer((prev) => {
      if (prev.urls.length === 0) return prev;
      const nextIndex = (prev.index + direction + prev.urls.length) % prev.urls.length;
      return { ...prev, index: nextIndex };
    });
  };

  const handleScroll = React.useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const scrollTop = container.scrollTop;

    if (headerBgRef.current) {
      if (scrollTop < 0) {
        const scale = 1 + Math.abs(scrollTop) / 320;
        headerBgRef.current.style.transform = `translateY(${scrollTop}px) scale(${scale})`;
      } else {
        headerBgRef.current.style.transform = `translateY(${scrollTop * 0.5}px)`;
      }
    }

    if (headerContentRef.current) {
      const opacity = Math.max(0, 1 - scrollTop / 200);
      headerContentRef.current.style.opacity = String(opacity);
    }

    const { scrollHeight, clientHeight } = container;
    if (scrollTop + clientHeight >= scrollHeight - 120 && hasMore && !isLoading) {
      void loadData(page + 1);
    }
  }, [hasMore, isLoading, loadData, page]);

  return (
    <div className="moments-page">
      <div className="moments-page__nav-fixed">
        <Navbar
          title=""
          onBack={onBack}
          variant="transparent"
          rightElement={
            <button type="button" className="moments-page__publish-btn" onClick={() => void handlePublish()} aria-label="publish">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </button>
          }
        />
      </div>

      <div ref={scrollRef} className="moments-page__scroll" onScroll={handleScroll}>
        <div className="moments-page__header">
          <div className="moments-page__header-bg-wrap">
            <div ref={headerBgRef} className="moments-page__header-bg">
              <img src="https://picsum.photos/900/900?grayscale" alt="" />
            </div>
          </div>

          <div ref={headerContentRef} className="moments-page__header-content">
            <div className="moments-page__header-name">AI User</div>
            <div className="moments-page__header-avatar">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="AI User" />
            </div>
          </div>
        </div>

        <div className="moments-page__list">
          {moments.map((moment) => (
            <MomentItem
              key={moment.id}
              item={moment}
              onImageClick={handleImageClick}
              onLike={(id) => {
                void handleLike(id);
              }}
              onProfileClick={onProfileClick}
            />
          ))}

          {isLoading ? <div className="moments-page__status">正在加载...</div> : null}
          {!isLoading && moments.length === 0 ? <div className="moments-page__status">暂无动态</div> : null}
          {!isLoading && !hasMore && moments.length > 0 ? <div className="moments-page__status">没有更多动态了</div> : null}
        </div>
      </div>

      {viewer.open ? (
        <div className="moments-page__viewer" onClick={closeViewer}>
          <button
            type="button"
            className="moments-page__viewer-nav moments-page__viewer-nav--left"
            onClick={(event) => {
              event.stopPropagation();
              moveViewer(-1);
            }}
          >
            ‹
          </button>
          <img src={viewer.urls[viewer.index]} alt="" className="moments-page__viewer-image" />
          <button
            type="button"
            className="moments-page__viewer-nav moments-page__viewer-nav--right"
            onClick={(event) => {
              event.stopPropagation();
              moveViewer(1);
            }}
          >
            ›
          </button>
          <div className="moments-page__viewer-index">
            {viewer.index + 1}/{viewer.urls.length}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MomentsPage;
