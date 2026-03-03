import React from 'react';
import { Navbar, Toast } from '@sdkwork/react-mobile-commons';
import { useFavorites, useSocial } from '../hooks/useSocial';
import type { FavoriteItem } from '../types';
import './FavoritesPage.css';

interface FavoritesPageProps {
  onBack?: () => void;
  onItemClick?: (item: FavoriteItem) => void;
  onCreateNoteClick?: () => void;
}

const CATEGORIES = [
  { id: 'all', label: '全部' },
  { id: 'image', label: '图片与视频' },
  { id: 'link', label: '链接' },
  { id: 'file', label: '文件' },
  { id: 'chat', label: '聊天记录' },
  { id: 'note', label: '笔记' },
];

const useDebouncedValue = (value: string, delay: number) => {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

const FavoriteListItem: React.FC<{ item: FavoriteItem; onClick?: (item: FavoriteItem) => void }> = ({ item, onClick }) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const renderIcon = () => {
    switch (item.type) {
      case 'file':
        return <div className="favorites-page__item-icon favorites-page__item-icon--pdf">PDF</div>;
      case 'link':
        return <div className="favorites-page__item-icon favorites-page__item-icon--link">🔗</div>;
      case 'doc':
        return <div className="favorites-page__item-icon favorites-page__item-icon--doc">📑</div>;
      case 'chat':
        return <div className="favorites-page__item-icon favorites-page__item-icon--chat">💬</div>;
      case 'image':
      case 'video':
        return (
          <div
            className="favorites-page__item-icon favorites-page__item-icon--image"
            style={{ backgroundImage: `url(${item.url || item.content || ''})` }}
          />
        );
      default:
        return <div className="favorites-page__item-icon favorites-page__item-icon--note">📝</div>;
    }
  };

  return (
    <button type="button" className="favorites-page__item" onClick={() => onClick?.(item)}>
      {renderIcon()}
      <div className="favorites-page__item-body">
        <div className="favorites-page__item-title">{item.title || '未命名收藏'}</div>
        <div className="favorites-page__item-meta">
          <span>{item.content || item.size || item.source || '--'}</span>
          <span>{formatDate(item.createTime)}</span>
        </div>
      </div>
    </button>
  );
};

export const FavoritesPage: React.FC<FavoritesPageProps> = ({ onBack, onItemClick, onCreateNoteClick }) => {
  const [activeCategory, setActiveCategory] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const debouncedQuery = useDebouncedValue(searchQuery, 280);
  const { favorites, isLoading, refresh } = useFavorites(activeCategory, debouncedQuery);
  const { addFavorite } = useSocial();

  const handleCreate = async () => {
    if (onCreateNoteClick) {
      onCreateNoteClick();
      return;
    }

    await addFavorite({
      type: 'text',
      title: '新的笔记',
      source: '我的笔记',
      content: '点击收藏项可查看详情',
    });
    Toast.success('已新增笔记到收藏');
    await refresh();
  };

  return (
    <div className="favorites-page">
      <Navbar
        title="我的收藏"
        onBack={onBack}
        rightElement={
          <button type="button" className="favorites-page__create-btn" onClick={() => void handleCreate()}>
            +
          </button>
        }
      />

      <div className="favorites-page__search-wrap">
        <div className="favorites-page__search-box">
          <span className="favorites-page__search-icon">🔍</span>
          <input
            placeholder="搜索收藏内容"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="favorites-page__search-input"
          />
        </div>
      </div>

      <div className="favorites-page__category-list">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            className={`favorites-page__category-item ${
              activeCategory === category.id ? 'favorites-page__category-item--active' : ''
            }`}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="favorites-page__content">
        {isLoading ? (
          <div className="favorites-page__status">正在加载收藏...</div>
        ) : favorites.length === 0 ? (
          <div className="favorites-page__status">无相关收藏</div>
        ) : (
          <>
            <div className="favorites-page__list">
              {favorites.map((item) => (
                <FavoriteListItem key={item.id} item={item} onClick={onItemClick} />
              ))}
            </div>
            <div className="favorites-page__count">{favorites.length} 条内容</div>
          </>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
