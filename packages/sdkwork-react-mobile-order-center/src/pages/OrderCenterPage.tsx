import React from 'react';
import { GigCenterPage } from '@sdkwork/react-mobile-commerce';

interface OrderCenterPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
  onGigClick?: (gigId: string) => void;
}

export const OrderCenterPage: React.FC<OrderCenterPageProps> = (props) => {
  return <GigCenterPage {...props} />;
};

export default OrderCenterPage;
