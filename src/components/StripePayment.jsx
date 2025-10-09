import React, { useState } from 'react';
import './StripePayment.css';

// Componente principal de Stripe Checkout
function StripePayment({ amount, onSuccess, onError, customerData, cartItems }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      // Preparar datos para la sesión de Checkout
      const checkoutData = {
        customer_name: customerData.customerName,
        customer_email: customerData.customerEmail,
        customer_phone: customerData.customerPhone,
        delivery_address: customerData.deliveryAddress,
        order_notes: customerData.orderNotes || '',
        items: cartItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          unit_price: item.price_cents ? item.price_cents / 100 : item.price,
          image_url: item.image
        }))
      };

      // Crear sesión de Checkout
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear sesión de Checkout');
      }

      const { url } = await response.json();
      
      // Redirigir a Stripe Checkout
      window.location.href = url;
      
    } catch (err) {
      console.error('Error en Checkout:', err);
      setError(err.message);
      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stripe-checkout">
      <div className="checkout-summary">
        <h3>Resumen del pedido</h3>
        <div className="order-items">
          {cartItems.map((item, index) => (
            <div key={index} className="order-item">
              <span className="item-name">{item.name}</span>
              <span className="item-quantity">x{item.quantity}</span>
              <span className="item-price">
                ${((item.price_cents ? item.price_cents / 100 : item.price) * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <div className="order-total">
          <strong>Total: ${amount.toFixed(2)} MXN</strong>
        </div>
      </div>

      {error && (
        <div className="stripe-error">
          ❌ {error}
        </div>
      )}

      <div className="checkout-actions">
        <button 
          onClick={handleCheckout}
          disabled={loading}
          className="btn btn-primary stripe-checkout-button"
        >
          {loading ? 'Redirigiendo a Stripe...' : '💳 Pagar con Stripe Checkout'}
        </button>
      </div>

      <div className="stripe-security">
        <p>🔒 Serás redirigido a la página segura de Stripe para completar tu pago</p>
        <p>✅ Aceptamos todas las tarjetas principales, Apple Pay, Google Pay y más</p>
      </div>
    </div>
  );
}

export default StripePayment;