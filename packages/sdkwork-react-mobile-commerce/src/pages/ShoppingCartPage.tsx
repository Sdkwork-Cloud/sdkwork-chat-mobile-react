import React from 'react';
import { Button, Icon, Toast } from '@sdkwork/react-mobile-commons';
import { useCart } from '../hooks/useCart';
import { EmptyState, PageScaffold, PriceText, SectionCard } from '../components';
import type { CartItem } from '../types';
import './ShoppingCartPage.css';

interface ShoppingCartPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
  onCheckout?: () => void;
  onProductClick?: (productId: string) => void;
  onContinueShopping?: () => void;
}

const QuantityControl: React.FC<{
  value: number;
  onMinus: () => void;
  onPlus: () => void;
}> = ({ value, onMinus, onPlus }) => {
  return (
    <div className="commerce-cart__qty">
      <button type="button" className="commerce-cart__qty-btn" onClick={onMinus}>
        -
      </button>
      <span className="commerce-cart__qty-value">{value}</span>
      <button type="button" className="commerce-cart__qty-btn" onClick={onPlus}>
        +
      </button>
    </div>
  );
};

export const ShoppingCartPage: React.FC<ShoppingCartPageProps> = ({
  t,
  onBack,
  onCheckout,
  onProductClick,
  onContinueShopping,
}) => {
  const tr = (key: string, fallback: string) => {
    const value = t?.(key) ?? key;
    return value === key ? fallback : value;
  };

  const {
    cart,
    isLoading,
    selectAll,
    selectItem,
    updateQuantity,
    removeItem,
    selectedAmount,
    selectedCount,
  } = useCart();
  const [editMode, setEditMode] = React.useState(false);

  const items = cart?.items || [];
  const allSelected = items.length > 0 && items.every((item) => item.isSelected);

  const handleDeleteSelected = async () => {
    const selectedItems = items.filter((item) => item.isSelected);
    if (selectedItems.length === 0) {
      Toast.info(tr('commerce.cart.select_product', '请选择商品'));
      return;
    }

    for (const item of selectedItems) {
      await removeItem(item.id);
    }
    Toast.success(tr('commerce.cart.deleted', '已删除'));
  };

  const footer = (
    <div className="commerce-cart__footer">
      <label className="commerce-cart__select-all">
        <input type="checkbox" checked={allSelected} onChange={(event) => void selectAll(event.target.checked)} />
        {tr('commerce.select_all', '全选')}
      </label>
      {editMode ? (
        <Button variant="danger" fullWidth onClick={handleDeleteSelected}>
          {tr('commerce.cart.delete_selected', '删除已选')}
        </Button>
      ) : (
        <>
          <div className="commerce-cart__total">
            <div className="commerce-cart__total-label">{tr('commerce.total', '合计')}</div>
            <PriceText amount={selectedAmount || 0} />
          </div>
          <Button
            fullWidth
            onClick={() => {
              if (!selectedCount) {
                Toast.info(tr('commerce.cart.select_checkout', '请选择结算商品'));
                return;
              }
              onCheckout?.();
            }}
          >
            {tr('commerce.checkout', '去结算')}({selectedCount || 0})
          </Button>
        </>
      )}
    </div>
  );

  return (
    <PageScaffold
      title={`${tr('commerce.cart.title', '购物车')}${items.length > 0 ? `(${items.length})` : ''}`}
      onBack={onBack}
      rightElement={
        <button type="button" className="commerce-cart__manage" onClick={() => setEditMode((value) => !value)}>
          {editMode ? tr('common.complete', '完成') : tr('common.manage', '管理')}
        </button>
      }
      footer={footer}
    >
      {isLoading ? <SectionCard style={{ color: 'var(--text-secondary)' }}>{tr('commerce.cart.loading', '正在加载购物车...')}</SectionCard> : null}

      {!isLoading && items.length === 0 ? (
        <EmptyState
          icon="🛒"
          title={tr('commerce.cart_empty', '购物车空空如也')}
          actionText={tr('commerce.go_shopping', '去逛逛')}
          onAction={() => {
            if (onContinueShopping) {
              onContinueShopping();
              return;
            }
            onBack?.();
          }}
        />
      ) : null}

      {!isLoading && items.length > 0
        ? items.map((item: CartItem) => (
            <SectionCard key={item.id} style={{ marginBottom: '10px' }}>
              <div className="commerce-cart__item">
                <input
                  type="checkbox"
                  checked={item.isSelected}
                  onChange={(event) => {
                    void selectItem(item.id, event.target.checked);
                  }}
                  className="commerce-cart__checkbox"
                />

                <button
                  type="button"
                  className="commerce-cart__cover"
                  style={{ backgroundImage: `url(${item.productImage})` }}
                  onClick={() => onProductClick?.(item.productId)}
                />

                <div className="commerce-cart__item-main">
                  <div className="commerce-cart__item-name">{item.productName}</div>
                  <div className="commerce-cart__item-meta">
                    <PriceText amount={item.price} />
                    <QuantityControl
                      value={item.quantity}
                      onMinus={() => {
                        void updateQuantity(item.id, item.quantity - 1);
                      }}
                      onPlus={() => {
                        void updateQuantity(item.id, item.quantity + 1);
                      }}
                    />
                  </div>
                  <div className="commerce-cart__item-actions">
                    <button
                      type="button"
                      className="commerce-cart__remove"
                      onClick={() => {
                        void removeItem(item.id);
                      }}
                    >
                      <Icon name="close" size={14} />
                      {tr('commerce.cart.remove', '移除')}
                    </button>
                  </div>
                </div>
              </div>
            </SectionCard>
          ))
        : null}
    </PageScaffold>
  );
};

export default ShoppingCartPage;
