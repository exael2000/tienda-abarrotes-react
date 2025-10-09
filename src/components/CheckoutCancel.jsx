import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CheckoutCancel.css';

function CheckoutCancel() {
  const navigate = useNavigate();

  // Optimización: Prevenir cualquier procesamiento innecesario
  useEffect(() => {
    console.log('🚫 CheckoutCancel mounted - pago cancelado');
    return () => {
      console.log('🚫 CheckoutCancel unmounted');
    };
  }, []);

  const handleBackToCheckout = () => {
    // Usar navigate en lugar de window.history para mejor performance
    navigate(-1);
  };

  const handleBackToStore = () => {
    // Usar navigate en lugar de window.location para mejor UX
    navigate('/');
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