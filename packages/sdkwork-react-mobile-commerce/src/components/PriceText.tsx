import React from 'react';
import './PriceText.css';

interface PriceTextProps {
  amount: number;
  originalAmount?: number;
  large?: boolean;
}

const formatPrice = (amount: number): string => {
  return Number(amount).toFixed(2);
};

export const PriceText: React.FC<PriceTextProps> = ({ amount, originalAmount, large = false }) => {
  return (
    <div className="commerce-price-text">
      <span className={`commerce-price-text__current ${large ? 'commerce-price-text__current--large' : ''}`}>
        <span className={`commerce-price-text__symbol ${large ? 'commerce-price-text__symbol--large' : ''}`}>¥</span>
        {formatPrice(amount)}
      </span>
      {typeof originalAmount === 'number' && originalAmount > amount ? (
        <span className="commerce-price-text__original">¥{formatPrice(originalAmount)}</span>
      ) : null}
    </div>
  );
};

export default PriceText;
