import React from 'react';
import './LoadingSkeleton.css';

export const LoadingSkeleton = ({ 
  type = 'product', 
  count = 1, 
  className = '' 
}) => {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  if (type === 'product') {
    return (
      <div className={`skeleton-container ${className}`}>
        {skeletons.map(index => (
          <div key={index} className="skeleton-product-card">
            <div className="skeleton-image"></div>
            <div className="skeleton-content">
              <div className="skeleton-title"></div>
              <div className="skeleton-brand"></div>
              <div className="skeleton-price"></div>
              <div className="skeleton-button"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'cart-item') {
    return (
      <div className={`skeleton-container ${className}`}>
        {skeletons.map(index => (
          <div key={index} className="skeleton-cart-item">
            <div className="skeleton-image-small"></div>
            <div className="skeleton-item-details">
              <div className="skeleton-title-small"></div>
              <div className="skeleton-subtitle"></div>
            </div>
            <div className="skeleton-price-small"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'checkout-step') {
    return (
      <div className={`skeleton-checkout ${className}`}>
        <div className="skeleton-steps">
          <div className="skeleton-step"></div>
          <div className="skeleton-step"></div>
          <div className="skeleton-step"></div>
          <div className="skeleton-step"></div>
        </div>
        <div className="skeleton-form">
          <div className="skeleton-form-group">
            <div className="skeleton-label"></div>
            <div className="skeleton-input"></div>
          </div>
          <div className="skeleton-form-group">
            <div className="skeleton-label"></div>
            <div className="skeleton-input"></div>
          </div>
        </div>
      </div>
    );
  }

  // Default skeleton genérico
  return (
    <div className={`skeleton-container ${className}`}>
      {skeletons.map(index => (
        <div key={index} className="skeleton-generic">
          <div className="skeleton-line skeleton-line-title"></div>
          <div className="skeleton-line skeleton-line-text"></div>
          <div className="skeleton-line skeleton-line-short"></div>
        </div>
      ))}
    </div>
  );
};