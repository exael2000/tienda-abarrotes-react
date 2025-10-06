import React, { useEffect } from 'react';
import './AddToCartNotification.css';

const AddToCartNotification = ({ isVisible, product, quantity, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // La notificación desaparece después de 3 segundos

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible || !product) return null;

  return (
    <div className={`notification-overlay ${isVisible ? 'show' : ''}`}>
      <div className="notification-card">
        <div className="notification-icon">
          ✅
        </div>
        <div className="notification-content">
          <h3>¡Producto agregado!</h3>
          <div className="notification-product">
            <img 
              src={`/images/products/${product.image}`} 
              alt={product.name}
              className="notification-product-image"
              onError={(e) => {
                e.target.src = '/images/products/placeholder.svg';
              }}
            />
            <div className="notification-product-info">
              <p className="notification-product-name">{product.name}</p>
              <p className="notification-quantity">Cantidad: {quantity}</p>
            </div>
          </div>
        </div>
        <button className="notification-close" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
};

export default AddToCartNotification;