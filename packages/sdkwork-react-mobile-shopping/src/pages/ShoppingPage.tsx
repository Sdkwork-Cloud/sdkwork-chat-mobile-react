import React from 'react';
import { MallPage } from '@sdkwork/react-mobile-commerce';

interface ShoppingPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
  onProductClick?: (productId: string) => void;
  onCartClick?: () => void;
  onCategoryClick?: () => void;
}

export const ShoppingPage: React.FC<ShoppingPageProps> = (props) => {
  return <MallPage {...props} />;
};

export default ShoppingPage;
