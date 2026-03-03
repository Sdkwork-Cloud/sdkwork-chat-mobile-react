import React from 'react';
import { Icon, Skeleton } from '@sdkwork/react-mobile-commons';
import { useProducts } from '../hooks/useProducts';
import { EmptyState, PageScaffold, SectionCard } from '../components';
import type { ProductCategory } from '../types';
import './CategoryPage.css';

interface CategoryPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
  onProductClick?: (productId: string) => void;
  onSearchClick?: () => void;
}

const CATEGORY_ALL = 'all';

const fillTemplate = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (full, key) => {
    const value = values[key];
    return value === undefined || value === null ? full : String(value);
  });

export const CategoryPage: React.FC<CategoryPageProps> = ({ t, onBack, onProductClick, onSearchClick }) => {
  const tr = (key: string, fallback: string) => {
    const value = t?.(key) ?? key;
    return value === key ? fallback : value;
  };

  const { categories, products, loadProducts, isLoading } = useProducts();
  const [activeCategory, setActiveCategory] = React.useState<string>(CATEGORY_ALL);
  const [keyword, setKeyword] = React.useState('');
  const deferredKeyword = React.useDeferredValue(keyword);

  const mergedCategories = React.useMemo(() => {
    const fallbackCategory: ProductCategory = {
      id: CATEGORY_ALL,
      name: tr('commerce.category.fallback_name', '推荐'),
      icon: 'sparkles',
    };
    return [fallbackCategory, ...categories];
  }, [categories, t]);

  React.useEffect(() => {
    void loadProducts({
      categoryId: activeCategory === CATEGORY_ALL ? undefined : activeCategory,
      pageSize: 30,
      sortBy: 'sales',
      sortOrder: 'desc',
    });
  }, [activeCategory, loadProducts]);

  const filteredProducts = React.useMemo(() => {
    const key = deferredKeyword.trim().toLowerCase();
    if (!key) return products;
    return products.filter((item) => {
      return (
        item.name.toLowerCase().includes(key) ||
        item.description.toLowerCase().includes(key) ||
        item.tags.some((tag) => tag.toLowerCase().includes(key))
      );
    });
  }, [deferredKeyword, products]);

  const activeName = React.useMemo(() => {
    const active = mergedCategories.find((item) => item.id === activeCategory);
    return active?.name || tr('commerce.category.fallback_name', '推荐');
  }, [activeCategory, mergedCategories, t]);

  return (
    <PageScaffold title={tr('commerce.category.title', '全部分类')} onBack={onBack} noPadding>
      <div className="commerce-category-page">
        <div className="commerce-category-page__search-wrap">
          <div className="commerce-category-page__search">
            <Icon name="search" size={16} color="var(--text-secondary)" />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder={tr('commerce.search_placeholder', '搜索商品')}
              className="commerce-category-page__search-input"
            />
            {onSearchClick ? (
              <button type="button" className="commerce-category-page__search-btn" onClick={onSearchClick}>
                {tr('commerce.category.go_mall', '去商城')}
              </button>
            ) : null}
          </div>
        </div>

        <div className="commerce-category-page__layout">
          <aside className="commerce-category-page__sidebar">
            {mergedCategories.map((category) => {
              const active = category.id === activeCategory;
              return (
                <button
                  key={category.id}
                  type="button"
                  className={`commerce-category-page__side-item ${active ? 'commerce-category-page__side-item--active' : ''}`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.name}
                </button>
              );
            })}
          </aside>

          <main className="commerce-category-page__content">
            <SectionCard style={{ marginBottom: '10px', padding: '14px' }}>
              <div className="commerce-category-page__banner">
                <div className="commerce-category-page__banner-title">
                  {fillTemplate(tr('commerce.category.banner_title', '{name} 专场'), { name: activeName })}
                </div>
                <div className="commerce-category-page__banner-subtitle">
                  {tr('commerce.category.banner_subtitle', '爆款好物 · 每日上新 · 限时优惠')}
                </div>
              </div>
            </SectionCard>

            {isLoading ? (
              <div className="commerce-category-page__grid">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={`category-product-skeleton-${index}`} width="100%" height={126} style={{ borderRadius: '10px' }} />
                ))}
              </div>
            ) : null}

            {!isLoading && filteredProducts.length === 0 ? (
              <EmptyState
                icon="🧭"
                title={tr('commerce.category.empty', '该分类暂无商品')}
              />
            ) : null}

            {!isLoading && filteredProducts.length > 0 ? (
              <div className="commerce-category-page__grid">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    className="commerce-category-page__product"
                    onClick={() => onProductClick?.(product.id)}
                  >
                    <span
                      className="commerce-category-page__product-image"
                      style={{ backgroundImage: `url(${product.thumbnail})` }}
                    />
                    <span className="commerce-category-page__product-name">{product.name}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </main>
        </div>
      </div>
    </PageScaffold>
  );
};

export default CategoryPage;
