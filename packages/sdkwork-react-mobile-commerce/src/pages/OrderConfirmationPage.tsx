import React from 'react';
import { Button, Toast } from '@sdkwork/react-mobile-commons';
import { useCart } from '../hooks/useCart';
import { useOrders } from '../hooks/useOrders';
import type { CartItem, PaymentMethod } from '../types';
import { EmptyState, PageScaffold, PriceText, SectionCard } from '../components';
import './OrderConfirmationPage.css';

interface OrderConfirmationPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
  onOrderCreated?: (orderId: string) => void;
}

interface AddressOption {
  id: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
}

const DEFAULT_ADDRESSES: AddressOption[] = [
  {
    id: 'addr_default',
    name: '张三',
    phone: '13800001234',
    province: '上海市',
    city: '上海市',
    district: '浦东新区',
    detail: '张江高科技园区 88 号',
  },
  {
    id: 'addr_2',
    name: '李四',
    phone: '13900004567',
    province: '浙江省',
    city: '杭州市',
    district: '西湖区',
    detail: '文三路 100 号',
  },
];

const FREE_SHIPPING_AMOUNT = 99;
const DEFAULT_SHIPPING_FEE = 12;

const formatVariantText = (item: CartItem): string => {
  const variants = item.selectedVariants || {};
  const values = Object.values(variants).filter(Boolean);
  return values.join(' / ');
};

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({ t, onBack, onOrderCreated }) => {
  const tr = (key: string, fallback: string) => {
    const value = t?.(key) ?? key;
    return value === key ? fallback : value;
  };

  const { getSelectedItems, clearSelected } = useCart();
  const { createOrder } = useOrders();
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [addressId, setAddressId] = React.useState(DEFAULT_ADDRESSES[0].id);
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>('wechat_pay');
  const [remark, setRemark] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    const loadSelectedItems = async () => {
      const selected = await getSelectedItems();
      setItems(selected);
    };
    void loadSelectedItems();
  }, [getSelectedItems]);

  const selectedAddress = React.useMemo(() => {
    return DEFAULT_ADDRESSES.find((item) => item.id === addressId) || DEFAULT_ADDRESSES[0];
  }, [addressId]);

  const amount = React.useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const shippingFee = amount >= FREE_SHIPPING_AMOUNT ? 0 : DEFAULT_SHIPPING_FEE;
  const payableAmount = amount + shippingFee;
  const paymentOptions: Array<{ label: string; value: PaymentMethod }> = React.useMemo(
    () => [
      { label: tr('commerce.order.payment.wechat', '微信支付'), value: 'wechat_pay' },
      { label: tr('commerce.order.payment.alipay', '支付宝'), value: 'alipay' },
      { label: tr('commerce.order.payment.balance', '余额支付'), value: 'balance' },
    ],
    [t]
  );

  const handleSubmit = async () => {
    if (items.length === 0 || submitting) return;
    setSubmitting(true);

    try {
      const order = await createOrder({
        items: items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          productImage: item.productImage,
          quantity: item.quantity,
          price: item.price,
          selectedVariants: item.selectedVariants,
        })),
        shippingAddress: {
          ...selectedAddress,
          isDefault: true,
        },
        paymentMethod,
        remark: remark.trim() || undefined,
        shippingAmount: shippingFee,
      });

      await clearSelected();
      Toast.success(tr('commerce.order_confirmation.created_success', '订单创建成功'));
      onOrderCreated?.(order.id);
    } catch (error) {
      console.error('[OrderConfirmationPage] create order failed:', error);
      Toast.error(tr('commerce.order_confirmation.created_failed', '创建订单失败，请稍后重试'));
    } finally {
      setSubmitting(false);
    }
  };

  const footer = (
    <div className="commerce-order-confirmation__footer">
      <div className="commerce-order-confirmation__payable">
        <div className="commerce-order-confirmation__payable-label">{tr('commerce.order_confirmation.payable', '应付金额')}</div>
        <PriceText amount={payableAmount} large />
      </div>
      <Button fullWidth loading={submitting} onClick={handleSubmit}>
        {tr('commerce.order_confirmation.submit', '提交订单')}
      </Button>
    </div>
  );

  return (
    <PageScaffold title={tr('commerce.order_confirmation.title', '确认订单')} onBack={onBack} footer={footer}>
      {items.length === 0 ? (
        <EmptyState
          icon="🧺"
          title={tr('commerce.order_confirmation.empty', '暂无可结算商品')}
          actionText={tr('commerce.order_confirmation.back_cart', '返回购物车')}
          onAction={onBack}
        />
      ) : (
        <div className="commerce-order-confirmation">
          <SectionCard>
            <div className="commerce-order-confirmation__section-title">{tr('commerce.order_confirmation.shipping_address', '收货地址')}</div>
            {DEFAULT_ADDRESSES.map((address) => {
              const checked = address.id === addressId;
              return (
                <label key={address.id} className="commerce-order-confirmation__address-item">
                  <input type="radio" checked={checked} onChange={() => setAddressId(address.id)} />
                  <div className="commerce-order-confirmation__address-main">
                    <div className="commerce-order-confirmation__address-name">
                      {address.name}
                      <span>{address.phone}</span>
                    </div>
                    <div className="commerce-order-confirmation__address-text">
                      {address.province}
                      {address.city}
                      {address.district}
                      {address.detail}
                    </div>
                  </div>
                </label>
              );
            })}
          </SectionCard>

          <SectionCard>
            <div className="commerce-order-confirmation__section-title">{tr('commerce.order_confirmation.payment_method', '支付方式')}</div>
            <div className="commerce-order-confirmation__payment-list">
              {paymentOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`commerce-order-confirmation__payment-item ${
                    paymentMethod === option.value ? 'commerce-order-confirmation__payment-item--active' : ''
                  }`}
                  onClick={() => setPaymentMethod(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard>
            <div className="commerce-order-confirmation__section-title">{tr('commerce.order_confirmation.product_list', '商品清单')}</div>
            {items.map((item) => (
              <div key={item.id} className="commerce-order-confirmation__product">
                <div
                  className="commerce-order-confirmation__product-image"
                  style={{ backgroundImage: `url(${item.productImage})` }}
                />
                <div className="commerce-order-confirmation__product-main">
                  <div className="commerce-order-confirmation__product-name">{item.productName}</div>
                  {formatVariantText(item) ? (
                    <div className="commerce-order-confirmation__product-variant">{formatVariantText(item)}</div>
                  ) : null}
                  <div className="commerce-order-confirmation__product-qty">x{item.quantity}</div>
                </div>
                <PriceText amount={item.price * item.quantity} />
              </div>
            ))}
          </SectionCard>

          <SectionCard>
            <div className="commerce-order-confirmation__summary-row">
              <span>{tr('commerce.order_confirmation.product_amount', '商品金额')}</span>
              <span>¥{amount.toFixed(2)}</span>
            </div>
            <div className="commerce-order-confirmation__summary-row">
              <span>{tr('commerce.order_confirmation.shipping_fee', '运费')}</span>
              <span>{shippingFee > 0 ? `¥${shippingFee.toFixed(2)}` : tr('commerce.order_confirmation.free_shipping', '包邮')}</span>
            </div>
            <div className="commerce-order-confirmation__shipping-note">
              {tr('commerce.order_confirmation.free_shipping_note', '满 {amount} 免运费').replace(
                '{amount}',
                `¥${FREE_SHIPPING_AMOUNT.toFixed(2)}`
              )}
            </div>
            <textarea
              value={remark}
              placeholder={tr('commerce.order_confirmation.remark_placeholder', '给商家留言（选填）')}
              onChange={(event) => setRemark(event.target.value)}
              rows={2}
              className="commerce-order-confirmation__remark"
            />
          </SectionCard>
        </div>
      )}
    </PageScaffold>
  );
};

export default OrderConfirmationPage;
