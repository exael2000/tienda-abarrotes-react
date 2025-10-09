import React from 'react';
import './CheckoutCancel.css';

function CheckoutCancel() {
  const handleBackToCheckout = () => {
    window.history.back();
  };

  const handleBackToStore = () => {
    window.location.href = '/';
  };

  return (
    <div className="checkout-cancel-container">
      <div className="cancel-content">
        <div className="cancel-icon">❌</div>
        
        <h1 className="cancel-title">Pago cancelado</h1>
        <p className="cancel-subtitle">No se realizó ningún cargo a tu tarjeta</p>
        
        <div className="cancel-message">
          <p>El proceso de pago fue cancelado. Tus productos siguen en el carrito por si deseas continuar con la compra.</p>
        </div>

        <div className="cancel-actions">
          <button 
            onClick={handleBackToCheckout}
            className="btn btn-secondary"
          >
            ← Volver al checkout
          </button>
          <button 
            onClick={handleBackToStore}
            className="btn btn-primary"
          >
            Volver a la tienda
          </button>
        </div>
      </div>
    </div>
  );
}

export default CheckoutCancel;