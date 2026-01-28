import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CashConfirmation.css';

function CashConfirmation({ orderNumber, formData, cartItems, total, formatCurrency }) {
  const navigate = useNavigate();

  const handleBackHome = () => {
    navigate('/');
  };

  return (
    <div className="checkout-step cash-confirmation">
      {/* Header */}
      <div className="cash-header">
        <div className="cash-icon-large">💵</div>
        <h2>¡Orden confirmada!</h2>
        <p className="cash-subtitle">
          Tu pedido será entregado contra pago en efectivo
        </p>
      </div>

      {/* Tracking Number */}
      <div className="tracking-section">
        <h3>Número de seguimiento</h3>
        <div className="tracking-display">
          <span className="tracking-code">{orderNumber}</span>
          <button 
            className="copy-btn"
            onClick={() => {
              navigator.clipboard.writeText(orderNumber);
            }}
            title="Copiar número"
          >
            📋
          </button>
        </div>
        <p className="tracking-note">Guarda este número para rastrear tu pedido</p>
      </div>

      {/* Customer Info */}
      <div className="cash-section">
        <h4>Información del cliente</h4>
        <div className="customer-info">
          <div className="info-row">
            <span className="info-label">Nombre:</span>
            <span className="info-value">{formData.customerName}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Teléfono:</span>
            <span className="info-value">{formData.customerPhone}</span>
          </div>
          {formData.customerEmail && (
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">{formData.customerEmail}</span>
            </div>
          )}
          <div className="info-row">
            <span className="info-label">Dirección:</span>
            <span className="info-value">{formData.deliveryAddress}</span>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="cash-section">
        <h4>Resumen del pedido</h4>
        <div className="cash-items">
          {cartItems.map(item => {
            const itemPrice = item.price_cents ? item.price_cents / 100 : item.price;
            const itemImage = item.image_url || (item.image ? `/images/products/${item.image}` : '/images/products/placeholder.svg');
            const itemName = item.name || 'Producto sin nombre';
            
            return (
              <div key={item.id} className="cash-item">
                <img 
                  src={itemImage} 
                  alt={itemName}
                  className="cash-item-image"
                  onError={(e) => {
                    e.target.src = '/images/products/placeholder.svg';
                  }}
                />
                <div className="cash-item-info">
                  <span className="cash-item-name">{itemName}</span>
                  <span className="cash-item-details">
                    {item.quantity} x {formatCurrency(itemPrice)}
                  </span>
                </div>
                <span className="cash-item-total">
                  {formatCurrency(itemPrice * item.quantity)}
                </span>
              </div>
            );
          })}
        </div>
        
        <div className="cash-total">
          <span className="total-label">Total a pagar</span>
          <span className="total-amount">{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="cash-section">
        <h4>Instrucciones importantes</h4>
        <div className="instructions">
          <div className="instruction">
            <span className="instruction-icon">💵</span>
            <div className="instruction-text">
              <strong>Prepara el dinero exacto</strong>
              <p>Facilita la entrega teniendo el monto exacto: {formatCurrency(total)}</p>
            </div>
          </div>
          <div className="instruction">
            <span className="instruction-icon">📞</span>
            <div className="instruction-text">
              <strong>Te llamaremos antes de entregar</strong>
              <p>Nos comunicaremos al {formData.customerPhone} para coordinar</p>
            </div>
          </div>
          <div className="instruction">
            <span className="instruction-icon">⏰</span>
            <div className="instruction-text">
              <strong>Tiempo de entrega</strong>
              <p>Tu pedido será entregado en 60-90 minutos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="cash-footer">
        <p>¡Gracias por tu preferencia!</p>
        <button 
          type="button" 
          className="btn btn-primary btn-large"
          onClick={handleBackHome}
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}

export default CashConfirmation;
