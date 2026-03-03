import React from 'react';
import { ProductSwiper } from './ProductSwiper';
import { ProductData } from './ProductItemCard';

interface ProductBubbleProps {
    t?: (key: string) => string;
    data: ProductData | ProductData[]; 
    onInteract?: (action: string, payload: any) => void;
}

export const ProductBubble: React.FC<ProductBubbleProps> = ({ t, data, onInteract }) => {
    const products = Array.isArray(data) ? data : [data];
    if (products.length === 0) return null;

    return <ProductSwiper t={t} items={products} onInteract={onInteract} />;
};
