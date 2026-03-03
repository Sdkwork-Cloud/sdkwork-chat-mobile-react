import React from 'react';
import { Button, Icon, Toast } from '@sdkwork/react-mobile-commons';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { EmptyState, PageScaffold, PriceText, SectionCard } from '../components';
import './ProductDetailPage.css';

interface ProductDetailPageProps {
  t?: (key: string) => string;
  productId?: string;
  onBack?: () => void;
  onCartClick?: () => void;
  onBuyNow?: (productId: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  t,
  productId,
  onBack,
  onCartClick,
  onBuyNow,
}) => {
  const tr = (key: string, fallback: string) => {
    const value = t?.(key) ?? key;
    return value === key ? fallback : value;
  };

  const { currentProduct, products, loadProduct, loadProducts, isLoading } = useProducts();
  const { addToCart, selectAll, itemCount } = useCart();
  const [quantity, setQuantity] = React.useState(1);

  React.useEffect(() => {
    const bootstrap = async () => {
      if (productId) {
        await loadProduct(productId);
        return;
      }
      if (products.length > 0) {
        await loadProduct(products[0].id);
        return;
      }
      const result = await loadProducts({ page: 1, pageSize: 1 });
      const first = result.products[0];
      if (first) {
        await loadProduct(first.id);
      }
    };
    void bootstrap();
  }, [loadProduct, loadProducts, productId, products]);

  const product = currentProduct;

  const buildCartPayload = () => {
    if (!product) return null;
    return {
      productId: product.id,
      productName: product.name,
      productImage: product.thumbnail,
      price: product.price,
      quantity,
      shopId: product.shopId,
      shopName: product.shopName,
      isSelected: true,
    };
  };

  const handleAddToCart = async () => {
    const payload = buildCartPayload();
    if (!payload) return;
    await addToCart(payload);
    Toast.success(tr('commerce.product_detail.added_to_cart', '已加入购物车'));
  };

  const handleBuyNow = async () => {
    const payload = buildCartPayload();
    if (!payload || !product) return;

    // Direct buy should only settle the current selected SKU.
    await selectAll(false);
    await addToCart(payload);
    onBuyNow?.(product.id);
  };

  const footer = product ? (
    <div className="commerce-product-detail__footer">
      <button type="button" className="commerce-product-detail__cart-btn" onClick={onCartClick}>
        <Icon name="shop" size={20} />
        {itemCount > 0 ? <span className="commerce-product-detail__cart-badge">{itemCount > 99 ? '99+' : itemCount}</span> : null}
      </button>
      <Button variant="outline" fullWidth onClick={handleAddToCart}>
        {tr('commerce.add_cart', '加入购物车')}
      </Button>
      <Button fullWidth onClick={handleBuyNow}>
        {tr('commerce.buy_now', '立即购买')}
      </Button>
    </div>
  ) : null;

  return (
    <PageScaffold title={tr('commerce.product_detail.title', '商品详情')} onBack={onBack} footer={footer}>
      {isLoading && !product ? <SectionCard style={{ color: 'var(--text-secondary)' }}>{tr('commerce.product_detail.loading', '正在加载商品...')}</SectionCard> : null}

      {!isLoading && !product ? <EmptyState icon="📦" title={tr('commerce.product_detail.not_found', '商品不存在或已下架')} /> : null}

      {product ? (
        <div className="commerce-product-detail">
          <SectionCard style={{ padding: 0, overflow: 'hidden' }}>
            <div
              className="commerce-product-detail__hero-image"
              style={{ backgroundImage: `url(${product.images[0] || product.thumbnail})` }}
            />
          </SectionCard>

          {product.images.length > 1 ? (
            <SectionCard style={{ marginTop: '-4px' }}>
              <div className="commerce-product-detail__thumb-row">
                {product.images.slice(0, 5).map((image, index) => (
                  <div key={`${image}-${index}`} className="commerce-product-detail__thumb" style={{ backgroundImage: `url(${image})` }} />
                ))}
              </div>
            </SectionCard>
          ) : null}

          <SectionCard>
            <PriceText amount={product.price} originalAmount={product.originalPrice} large />
            <h1 className="commerce-product-detail__title">{product.name}</h1>
            <p className="commerce-product-detail__desc">{product.description}</p>
            <div className="commerce-product-detail__tag-row">
              {product.tags.slice(0, 4).map((tag) => (
                <span key={tag} className="commerce-product-detail__tag">
                  {tag}
                </span>
              ))}
            </div>
          </SectionCard>

          <SectionCard>
            <div className="commerce-product-detail__kv">
              <span>{tr('commerce.product_detail.shop', '店铺')}</span>
              <span>{product.shopName}</span>
            </div>
            <div className="commerce-product-detail__kv">
              <span>{tr('commerce.product_detail.stock', '库存')}</span>
              <span>{product.stock}</span>
            </div>
            <div className="commerce-product-detail__kv">
              <span>{tr('commerce.product_detail.rating', '评分')}</span>
              <span>
                {product.rating} ({product.reviewCount}{tr('commerce.product_detail.reviews', '条评价')})
              </span>
            </div>
            <div className="commerce-product-detail__kv">
              <span>{tr('commerce.mall.sales', '销量')}</span>
              <span>{product.salesCount}</span>
            </div>
          </SectionCard>

          <SectionCard>
            <div className="commerce-product-detail__qty-row">
              <span>{tr('commerce.product_detail.quantity', '购买数量')}</span>
              <div className="commerce-product-detail__qty-control">
                <Button size="sm" variant="outline" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>
                  -
                </Button>
                <span className="commerce-product-detail__qty-value">{quantity}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setQuantity((value) => Math.min(product.stock || 99, value + 1))}
                >
                  +
                </Button>
              </div>
            </div>
          </SectionCard>

          {Object.keys(product.specifications || {}).length > 0 ? (
            <SectionCard>
              <div className="commerce-product-detail__spec-title">{tr('commerce.product_detail.specs', '规格参数')}</div>
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="commerce-product-detail__kv">
                  <span>{key}</span>
                  <span>{value}</span>
                </div>
              ))}
            </SectionCard>
          ) : null}
        </div>
      ) : null}
    </PageScaffold>
  );
};

export default ProductDetailPage;
