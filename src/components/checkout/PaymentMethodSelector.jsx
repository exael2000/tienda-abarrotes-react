import React from 'react';
import './PaymentMethodSelector.css';

const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card'
};

function PaymentMethodSelector({ selectedMethod, onChange }) {
  return (
    <div className="checkout-step">
      <h3>💳 Método de pago</h3>
      
      <div className="payment-methods">
        <div className="payment-method">
          <input
            type="radio"
            id="cash"
            name="paymentMethod"
            value={PAYMENT_METHODS.CASH}
            checked={selectedMethod === PAYMENT_METHODS.CASH}
            onChange={onChange}
          />
          <label htmlFor="cash" className="payment-option">
            <div className="payment-icon">💵</div>
            <div className="payment-info">
              <h4>Pago en efectivo</h4>
              <p>Paga cuando recibas tu pedido</p>
            </div>
            <div className={`check-indicator ${selectedMethod === PAYMENT_METHODS.CASH ? 'active' : ''}`}>
              ✓
            </div>
          </label>
        </div>

        <div className="payment-method">
          <input
            type="radio"
            id="card"
            name="paymentMethod"
            value={PAYMENT_METHODS.CARD}
            checked={selectedMethod === PAYMENT_METHODS.CARD}
            onChange={onChange}
          />
          <label htmlFor="card" className="payment-option">
            <div className="payment-icon">💳</div>
            <div className="payment-info">
              <h4>Tarjeta de crédito/débito</h4>
              <p>Pago seguro con Stripe</p>
            </div>
            <div className={`check-indicator ${selectedMethod === PAYMENT_METHODS.CARD ? 'active' : ''}`}>
              ✓
            </div>
          </label>
        </div>
      </div>

      {selectedMethod === PAYMENT_METHODS.CARD && (
        <div className="payment-note">
          <span className="note-icon">🔒</span>
          <p>
            Tu información de pago está protegida. Usamos Stripe para procesar 
            transacciones de forma segura.
          </p>
        </div>
      )}
    </div>
  );
}

export { PAYMENT_METHODS };
export default PaymentMethodSelector;
