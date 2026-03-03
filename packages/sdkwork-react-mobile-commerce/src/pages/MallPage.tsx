import React from 'react';
import { Icon, Toast } from '@sdkwork/react-mobile-commons';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import type { Product, ProductCategory } from '../types';
import { EmptyState, PageScaffold, PriceText, SectionCard } from '../components';
import './MallPage.css';

interface MallPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
  onProductClick?: (productId: string) => void;
  onCartClick?: () => void;
  onCategoryClick?: () => void;
}

const CATEGORY_ALL = 'all';
const CATEGORY_MORE = '__more__';

interface FlyingBall {
  id: number;
  image: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

type MallCategoryEntry = ProductCategory & {
  action: 'filter' | 'navigate';
};

const ProductCard: React.FC<{
  product: Product;
  onAdd: (product: Product, rect: DOMRect) => void;
  onOpen: (productId: string) => void;
  salesLabel: string;
  addLabel: string;
}> = React.memo(({ product, onAdd, onOpen, salesLabel, addLabel }) => {
  const formatSales = (count: number) => (count > 10000 ? `${(count / 10000).toFixed(1)}\u4e07+` : `${count}`);

  return (
    <article className="mall-page__product-card" onClick={() => onOpen(product.id)}>
      <div className="mall-page__product-media" style={{ backgroundImage: `url(${product.thumbnail})` }}>
        <span className="mall-page__product-sales">{`${salesLabel} ${formatSales(product.salesCount)}`}</span>
      </div>
      <div className="mall-page__product-body">
        <h3 className="mall-page__product-title">{product.name}</h3>
        <div className="mall-page__product-tags">
          {product.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="mall-page__product-tag">
              {tag}
            </span>
          ))}
        </div>
        <div className="mall-page__product-bottom">
          <PriceText amount={product.price} originalAmount={product.originalPrice} />
          <button
            type="button"
            className="mall-page__add-btn"
            onClick={(event) => {
              event.stopPropagation();
              onAdd(product, event.currentTarget.getBoundingClientRect());
            }}
            aria-label={`${addLabel} ${product.name}`}
          >
            <Icon name="plus" size={16} />
          </button>
        </div>
      </div>
    </article>
  );
});
ProductCard.displayName = 'MallProductCard';

export const MallPage: React.FC<MallPageProps> = ({
  t,
  onBack,
  onProductClick,
  onCartClick,
  onCategoryClick,
}) => {
  const tr = (key: string, fallback: string) => {
    const value = t?.(key) ?? key;
    return value === key ? fallback : value;
  };

  const { products, categories, isLoading, loadProducts } = useProducts();
  const { itemCount, addToCart } = useCart();
  const [keyword, setKeyword] = React.useState('');
  const deferredKeyword = React.useDeferredValue(keyword);
  const [activeCategory, setActiveCategory] = React.useState<string>(CATEGORY_ALL);
  const [balls, setBalls] = React.useState<FlyingBall[]>([]);
  const [cartBump, setCartBump] = React.useState(false);
  const cartButtonRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    void loadProducts({
      categoryId: activeCategory === CATEGORY_ALL ? undefined : activeCategory,
      sortBy: 'sales',
      sortOrder: 'desc',
    });
  }, [activeCategory, loadProducts]);

  const quickCategories = React.useMemo(() => categories.slice(0, 6), [categories]);

  const categoryEntries = React.useMemo<MallCategoryEntry[]>(
    () => [
      { id: CATEGORY_ALL, name: tr('commerce.mall.all', '全部'), icon: 'sparkles', action: 'filter' },
      ...quickCategories.map((item) => ({ ...item, action: 'filter' as const })),
      { id: CATEGORY_MORE, name: tr('commerce.mall.more', '更多'), icon: 'more', action: 'navigate' },
    ],
    [quickCategories, t]
  );

  const filteredProducts = React.useMemo(() => {
    const key = deferredKeyword.trim().toLowerCase();
    if (!key) {
      return products;
    }
    return products.filter((item) => {
      return (
        item.name.toLowerCase().includes(key) ||
        item.description.toLowerCase().includes(key) ||
        item.tags.some((tag) => tag.toLowerCase().includes(key))
      );
    });
  }, [deferredKeyword, products]);

  const handleAddToCart = React.useCallback(
    async (product: Product, rect: DOMRect) => {
      await addToCart({
        productId: product.id,
        productName: product.name,
        productImage: product.thumbnail,
        price: product.price,
        quantity: 1,
        shopId: product.shopId,
        shopName: product.shopName,
        isSelected: true,
      });
      Toast.success(tr('commerce.product_detail.added_to_cart', '已加入购物车'));

      if (cartButtonRef.current) {
        const cartRect = cartButtonRef.current.getBoundingClientRect();
        const ballId = Date.now() + Math.floor(Math.random() * 1000);
        const ball: FlyingBall = {
          id: ballId,
          image: product.thumbnail,
          startX: rect.left + rect.width / 2 - 12,
          startY: rect.top + rect.height / 2 - 12,
          endX: cartRect.left + cartRect.width / 2 - 12,
          endY: cartRect.top + cartRect.height / 2 - 12,
        };
        setBalls((prev) => [...prev, ball]);
        window.setTimeout(() => {
          setBalls((prev) => prev.filter((item) => item.id !== ballId));
          setCartBump(true);
          window.setTimeout(() => setCartBump(false), 260);
        }, 620);
      }
    },
    [addToCart]
  );

  const handleOpenProduct = React.useCallback(
    (id: string) => {
      onProductClick?.(id);
    },
    [onProductClick]
  );

  const handleCategoryEntryClick = React.useCallback(
    (entry: MallCategoryEntry) => {
      if (entry.action === 'navigate') {
        onCategoryClick?.();
        return;
      }
      setActiveCategory(entry.id);
    },
    [onCategoryClick]
  );

  const rightElement = (
    <button
      type="button"
      ref={cartButtonRef}
      className={`mall-page__cart-btn ${cartBump ? 'mall-page__cart-btn--bump' : ''}`}
      onClick={onCartClick}
      aria-label={tr('commerce.cart.go_cart', '前往购物车')}
    >
      <Icon name="shop" size={20} />
      {itemCount > 0 ? <span className="mall-page__cart-badge">{itemCount > 99 ? '99+' : itemCount}</span> : null}
    </button>
  );

  return (
    <PageScaffold title={tr('commerce.mall.title', '商城')} onBack={onBack} rightElement={rightElement}>
      <div className="mall-page">
        {balls.map((ball) => (
          <div
            key={ball.id}
            className="mall-page__fly-ball"
            style={
              {
                '--start-x': `${ball.startX}px`,
                '--start-y': `${ball.startY}px`,
                '--end-x': `${ball.endX}px`,
                '--end-y': `${ball.endY}px`,
              } as React.CSSProperties
            }
          >
            <span className="mall-page__fly-ball-inner" style={{ backgroundImage: `url(${ball.image})` }} />
          </div>
        ))}

        <div className="mall-page__top-deck">
          <div className="mall-page__hero">
            <div>
              <div className="mall-page__hero-title">{tr('commerce.mall.hero_title', 'OpenChat 严选商城')}</div>
              <div className="mall-page__hero-subtitle">
                {tr('commerce.mall.hero_subtitle', '官方好物 · 品质保障 · 极速发货')}
              </div>
            </div>
            <button type="button" className="mall-page__hero-action" onClick={onCategoryClick}>
              {tr('commerce.mall.all_categories', '全部分类')}
            </button>
          </div>
        </div>

        <div className="mall-page__search-shell mall-page__search-shell--sticky">
          <div className="mall-page__search-row">
            <Icon name="search" size={16} color="var(--text-secondary)" />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder={tr('commerce.search_placeholder', '搜索商品')}
              className="mall-page__search-input"
            />
            <button type="button" className="mall-page__category-entry" onClick={onCategoryClick}>
              {tr('commerce.mall.category', '分类')}
            </button>
          </div>
        </div>

        {categoryEntries.length > 0 ? (
          <SectionCard style={{ padding: '10px 8px' }}>
            <div className="mall-page__quick-grid">
              {categoryEntries.map((category) => {
                const active = category.action === 'filter' && activeCategory === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    className={`mall-page__quick-item${active ? ' mall-page__quick-item--active' : ''}`}
                    onClick={() => handleCategoryEntryClick(category)}
                  >
                    <span className={`mall-page__quick-icon${active ? ' mall-page__quick-icon--active' : ''}`}>
                      <Icon name={category.icon || 'sparkles'} size={20} />
                    </span>
                    <span className="mall-page__quick-label">{category.name}</span>
                  </button>
                );
              })}
            </div>
          </SectionCard>
        ) : null}

        <div className="mall-page__section-title">{tr('commerce.mall.featured_products', '精选商品')}</div>

        {isLoading ? (
          <SectionCard style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            {tr('commerce.mall.loading_products', '正在加载商品...')}
          </SectionCard>
        ) : null}

        {!isLoading && filteredProducts.length === 0 ? (
          <EmptyState icon={'\ud83d\uded2'} title={tr('commerce.mall.no_matched_products', '暂无匹配商品')} />
        ) : null}

        {!isLoading && filteredProducts.length > 0 ? (
          <div className="mall-page__grid">
            {filteredProducts.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                onAdd={handleAddToCart}
                onOpen={handleOpenProduct}
                salesLabel={tr('commerce.mall.sales', '销量')}
                addLabel={tr('commerce.add_cart', '加入购物车')}
              />
            ))}
          </div>
        ) : null}
      </div>
    </PageScaffold>
  );
};

export default MallPage;
