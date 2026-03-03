import React from 'react';
import { Button, Popup, Toast } from '@sdkwork/react-mobile-commons';
import { EmptyState, PageScaffold, PriceText, SectionCard, SegmentTabs } from '../components';
import { productService } from '../services/ProductService';
import { distributionService } from '../services/DistributionService';
import type { Product } from '../types';

interface DistributionGoodsPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
}

type Tr = (key: string, fallback: string) => string;

const fillTemplate = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (full, key) => {
    const value = values[key];
    return value === undefined || value === null ? full : String(value);
  });

const buildPromotionCopy = (product: Product, mode: string, tr: Tr) => {
  const commission = distributionService.calculateCommission(product.price);
  const descSnippet =
    product.description.length > 38 ? `${product.description.slice(0, 38)}...` : product.description;
  const variables = {
    name: product.name,
    originalPrice: product.originalPrice || product.price,
    price: product.price,
    commission,
    feature: product.tags[0] || tr('commerce.distribution_goods.copy.default_feature', '质感'),
    desc: descSnippet,
  };

  if (mode === 'group') {
    return [
      fillTemplate(
        tr('commerce.distribution_goods.copy.group_line_1', '【限时福利】{name}'),
        variables
      ),
      fillTemplate(
        tr('commerce.distribution_goods.copy.group_line_2', '原价 ¥{originalPrice}，到手 ¥{price}'),
        variables
      ),
      fillTemplate(
        tr('commerce.distribution_goods.copy.group_line_3', '今日开团返佣 ¥{commission}，库存有限'),
        variables
      ),
      fillTemplate(
        tr('commerce.distribution_goods.copy.group_line_4', '回复「+1」立即锁定名额'),
        variables
      ),
    ].join('\n');
  }
  if (mode === 'note') {
    return [
      fillTemplate(
        tr('commerce.distribution_goods.copy.note_line_1', '最近挖到一个宝藏好物：{name}'),
        variables
      ),
      fillTemplate(
        tr(
          'commerce.distribution_goods.copy.note_line_2',
          '体验感真的超出预期，尤其是 {feature} 这块做得很好'
        ),
        variables
      ),
      fillTemplate(
        tr('commerce.distribution_goods.copy.note_line_3', '现在下单是 ¥{price}，我这边还能返佣 ¥{commission}'),
        variables
      ),
      fillTemplate(
        tr('commerce.distribution_goods.copy.note_line_4', '#好物推荐 #实用分享 #开箱'),
        variables
      ),
    ].join('\n');
  }
  return [
    fillTemplate(
      tr('commerce.distribution_goods.copy.moments_line_1', '安利一个最近超值的好物：{name}'),
      variables
    ),
    fillTemplate(tr('commerce.distribution_goods.copy.moments_line_2', '{desc}'), variables),
    fillTemplate(
      tr('commerce.distribution_goods.copy.moments_line_3', '现在到手价 ¥{price}，推广佣金 ¥{commission}'),
      variables
    ),
    fillTemplate(
      tr('commerce.distribution_goods.copy.moments_line_4', '想要链接的朋友评论区告诉我'),
      variables
    ),
  ].join('\n');
};

export const DistributionGoodsPage: React.FC<DistributionGoodsPageProps> = ({ t, onBack }) => {
  const tr = (key: string, fallback: string) => {
    const value = t?.(key) ?? key;
    return value === key ? fallback : value;
  };

  const filterTabs = React.useMemo(
    () => [
      { id: 'all', label: tr('commerce.distribution_goods.tabs.all', '全部') },
      { id: 'high', label: tr('commerce.distribution_goods.tabs.high', '高佣') },
      { id: 'hot', label: tr('commerce.distribution_goods.tabs.hot', '热销') },
      { id: 'new', label: tr('commerce.distribution_goods.tabs.new', '新品') },
    ],
    [t]
  );
  const copyModes = React.useMemo(
    () => [
      { id: 'moments', label: tr('commerce.distribution_goods.copy_modes.moments', '朋友圈') },
      { id: 'group', label: tr('commerce.distribution_goods.copy_modes.group', '社群接龙') },
      { id: 'note', label: tr('commerce.distribution_goods.copy_modes.note', '种草文案') },
    ],
    [t]
  );

  const [activeFilter, setActiveFilter] = React.useState('all');
  const [products, setProducts] = React.useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [copyMode, setCopyMode] = React.useState('moments');
  const [generatedCopy, setGeneratedCopy] = React.useState('');

  React.useEffect(() => {
    const load = async () => {
      await productService.initialize();
      const result = await productService.getProducts({ sortBy: 'sales', sortOrder: 'desc', pageSize: 16 });
      setProducts(result.products);
    };
    void load();
  }, []);

  const filteredProducts = React.useMemo(() => {
    const sorted = [...products];
    if (activeFilter === 'high') {
      return sorted.sort((a, b) => distributionService.calculateCommission(b.price) - distributionService.calculateCommission(a.price));
    }
    if (activeFilter === 'hot') {
      return sorted.sort((a, b) => b.salesCount - a.salesCount);
    }
    if (activeFilter === 'new') {
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return sorted;
  }, [activeFilter, products]);

  React.useEffect(() => {
    if (!selectedProduct) {
      setGeneratedCopy('');
      return;
    }
    setGeneratedCopy(buildPromotionCopy(selectedProduct, copyMode, tr));
  }, [selectedProduct, copyMode, t]);

  const copyText = async () => {
    if (!generatedCopy) return;
    await navigator.clipboard.writeText(generatedCopy);
    Toast.success(tr('commerce.distribution_goods.copy_success', '文案已复制'));
    setSelectedProduct(null);
  };

  return (
    <PageScaffold title={tr('commerce.distribution_goods.title', '分销商品')} onBack={onBack}>
      <SectionCard>
        <SegmentTabs value={activeFilter} options={filterTabs} onChange={setActiveFilter} />
      </SectionCard>

      {filteredProducts.length === 0 ? (
        <EmptyState
          icon="shop"
          title={tr('commerce.distribution_goods.empty_title', '暂无可推广商品')}
        />
      ) : null}

      {filteredProducts.map((item) => {
        const commission = distributionService.calculateCommission(item.price);
        return (
          <SectionCard key={item.id}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div
                style={{
                  width: '92px',
                  height: '92px',
                  borderRadius: '12px',
                  backgroundImage: `url(${item.thumbnail})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: 'var(--bg-cell-active)',
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    color: 'var(--text-primary)',
                    fontWeight: 700,
                    fontSize: '15px',
                    lineHeight: 1.35,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {item.name}
                </div>
                <div style={{ marginTop: '4px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                  {tr('commerce.distribution_goods.monthly_sales', '月销')} {item.salesCount} · {tr('commerce.distribution_goods.rating', '评分')}{' '}
                  {item.rating.toFixed(1)}
                </div>
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <PriceText amount={item.price} />
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#fa5151',
                      borderRadius: '10px',
                      padding: '3px 8px',
                      background: 'rgba(250,81,81,0.1)',
                    }}
                  >
                    {tr('commerce.distribution_goods.estimated_commission', '预估佣金')} ¥{commission}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <Button size="sm" onClick={() => setSelectedProduct(item)}>
                {tr('commerce.distribution_goods.promote_now', '立即推广')}
              </Button>
            </div>
          </SectionCard>
        );
      })}

      <Popup
        visible={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        position="bottom"
        round
        style={{ minHeight: '420px', maxHeight: '84vh' }}
      >
        <div style={{ padding: '18px 16px 20px 16px' }}>
          <div style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: 700 }}>
            {tr('commerce.distribution_goods.popup_title', '推广素材生成')}
          </div>
          {selectedProduct ? (
            <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '10px',
                  backgroundImage: `url(${selectedProduct.thumbnail})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600 }}>{selectedProduct.name}</div>
                <div style={{ marginTop: '4px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                  {tr('commerce.distribution_goods.sell_price', '售价')} ¥{selectedProduct.price} · {tr('commerce.distribution_goods.commission', '佣金')} ¥
                  {distributionService.calculateCommission(selectedProduct.price)}
                </div>
              </div>
            </div>
          ) : null}

          <div style={{ marginTop: '14px' }}>
            <SegmentTabs value={copyMode} options={copyModes} onChange={setCopyMode} />
          </div>

          <div
            style={{
              marginTop: '12px',
              borderRadius: '12px',
              border: '0.5px solid var(--border-color)',
              background: 'var(--bg-body)',
              padding: '12px',
              minHeight: '158px',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6,
              color: 'var(--text-primary)',
              fontSize: '13px',
            }}
          >
            {generatedCopy}
          </div>

          <div style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
            <Button
              fullWidth
              variant="outline"
              onClick={() => {
                if (!selectedProduct) return;
                setGeneratedCopy(buildPromotionCopy(selectedProduct, copyMode, tr));
                Toast.success(tr('commerce.distribution_goods.rewrite_success', '已重写文案'));
              }}
            >
              {tr('commerce.distribution_goods.rewrite', '重写')}
            </Button>
            <Button fullWidth onClick={copyText}>
              {tr('commerce.distribution_goods.copy_button', '复制文案')}
            </Button>
          </div>
        </div>
      </Popup>
    </PageScaffold>
  );
};

export default DistributionGoodsPage;
