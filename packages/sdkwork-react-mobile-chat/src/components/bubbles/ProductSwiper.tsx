import React, { useRef, useEffect } from 'react';
import { ProductData, ProductItemCard } from './ProductItemCard';
import { Toast } from '@sdkwork/react-mobile-commons';

interface ProductSwiperProps {
  t?: (key: string) => string;
  items: ProductData[];
  onInteract?: (action: string, payload: any) => void;
  onNavigate?: (path: string, params?: any) => void;
}

export const ProductSwiper: React.FC<ProductSwiperProps> = ({ t, items, onInteract, onNavigate }) => {
  const tr = (key: string, fallback: string) => {
    const value = t?.(key);
    if (value && value !== key) return value;
    return fallback;
  };

  const handleDetail = (item: ProductData) => {
    onInteract?.('view_product', item);
    if (!onNavigate) {
      Toast.info(tr('chat.bubble.view_product', 'View product details'));
      return;
    }
    onNavigate('/product', { id: item.id });
  };

  const handleBuy = async (item: ProductData) => {
    Toast.success(tr('chat.bubble.added_to_cart', 'Added to cart'));
    onInteract?.('buy', item);
  };

  const isSingle = items.length === 1;
  const CARD_WIDTH_MULTI = '240px';
  const CARD_GAP = 12;

  const containerStyle: React.CSSProperties = {
    width: '100%',
    position: 'relative',
    marginTop: '0px',
    marginBottom: '0px',
    touchAction: 'pan-x',
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    if (e.button !== 0) return;

    isDragging.current = true;
    scrollRef.current.style.cursor = 'grabbing';

    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
  };

  const handleGlobalMouseUp = () => {
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = 'grab';

    window.removeEventListener('mousemove', handleGlobalMouseMove);
    window.removeEventListener('mouseup', handleGlobalMouseUp);
  };

  const handleGlobalMouseMove = (e: MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();

    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  return (
    <div style={containerStyle}>
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        style={{
          display: 'flex',
          gap: `${CARD_GAP}px`,
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollSnapType: isSingle || isDragging.current ? 'none' : 'x mandatory',
          paddingLeft: '0px',
          paddingRight: '16px',
          paddingBottom: '20px',
          paddingTop: '4px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          alignItems: 'stretch',
          cursor: 'grab',
          userSelect: 'none',
        }}
      >
        {items.map((item, idx) => (
          <ProductItemCard
            key={item.id || idx}
            t={t}
            item={item}
            onClick={handleDetail}
            onBuy={handleBuy}
            width={isSingle ? '100%' : CARD_WIDTH_MULTI}
            isHero={isSingle}
            rank={idx}
          />
        ))}

        {!isSingle && <div style={{ width: '4px', flexShrink: 0 }} />}
      </div>

      <style>{`
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

