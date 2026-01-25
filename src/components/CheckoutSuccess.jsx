import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { verifyStripePayment, PAYMENT_STATUS } from '../services/paymentService';
import { formatPrice, pesosTocents } from '../utils/currency';
import './CheckoutSuccess.css';

// Helper function to format currency
const formatCurrency = (pesos) => {
  return formatPrice(pesosTocents(pesos));
};

function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processed, setProcessed] = useState(false);
  const { clearCart } = useContext(CartContext);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    const processSuccessfulPayment = async (sessionId) => {
      if (processed) return;
      
      try {
        setProcessed(true);
        console.log('🔄 Processing successful Stripe payment:', sessionId);
        
        // Verify payment using payment service
        const result = await verifyStripePayment(sessionId);
        
        if (result.success) {
          console.log('✅ Payment verified successfully');
          
          setOrderDetails({
            order_number: result.orderNumber,
            order_id: result.orderId,
            session_id: sessionId,
            status: PAYMENT_STATUS.COMPLETED,
            payment_method: 'card',
            message: result.message,
            // Additional details from order
            customer_name: result.customer_name,
            customer_phone: result.customer_phone,
            customer_email: result.customer_email,
            delivery_address: result.delivery_address,
            items: result.items || [],
            total_amount: result.total_amount
          });
          
          // Clear cart after successful payment verification
          clearCart();
          
        } else {
          throw new Error(result.error || 'Error al verificar el pago');
        }
        
      } catch (err) {
        console.error('💥 Error processing payment verification:', err);
        setError(err.message || 'Error al procesar el pago');
      } finally {
        setLoading(false);
      }
    };
    
    if (sessionId && !processed) {
      processSuccessfulPayment(sessionId);
    } else if (!sessionId) {
      setError('No se encontró información de la sesión de pago');
      setLoading(false);
    }
  }, [searchParams, clearCart, processed]);

  const handleBackToStore = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="checkout-success-container">
        <div className="success-content">
          <div className="loading-content">
            <div className="simple-spinner"></div>
            <h3>Verificando pago...</h3>
            <p>Un momento por favor</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checkout-success-container">
        <div className="success-content error-content">
          <div className="error-icon">❌</div>
          <h2>Error al procesar el pago</h2>
          <p>{error}</p>
          <button onClick={handleBackToStore} className="btn btn-primary">
            Volver a la tienda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-success-container">
      <div className="success-content">
        <div className="success-animation">
          <div className="checkmark-circle">
            <div className="checkmark">✓</div>
          </div>
        </div>
        
        <h1 className="success-title">¡Pago exitoso!</h1>
        <p className="success-subtitle">Tu pedido ha sido procesado correctamente</p>
        
        {/* Tracking Number */}
        <div className="tracking-section">
          <h3>Número de seguimiento</h3>
          <div className="tracking-display">
            <span className="tracking-code">{orderDetails?.order_number}</span>
            <button 
              className="copy-btn"
              onClick={() => {
                navigator.clipboard.writeText(orderDetails?.order_number || '');
              }}
              title="Copiar número"
            >
              📋
            </button>
          </div>
          <p className="tracking-note">Guarda este número para rastrear tu pedido</p>
        </div>

        {/* Customer Info */}
        {orderDetails?.customer_name && (
          <div className="order-section">
            <h4>Información del cliente</h4>
            <div className="customer-info">
              <div className="info-row">
                <span className="info-label">Nombre:</span>
                <span className="info-value">{orderDetails.customer_name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Teléfono:</span>
                <span className="info-value">{orderDetails.customer_phone}</span>
              </div>
              {orderDetails.customer_email && (
                <div className="info-row">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{orderDetails.customer_email}</span>
                </div>
              )}
              <div className="info-row">
                <span className="info-label">Dirección:</span>
                <span className="info-value">{orderDetails.delivery_address}</span>
              </div>
            </div>
          </div>
        )}

        {/* Order Summary */}
        {orderDetails?.items && orderDetails.items.length > 0 && (
          <div className="order-section">
            <h4>Resumen del pedido</h4>
            <div className="order-items">
              {orderDetails.items.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-info">
                    <span className="item-name">{item.name || item.product_name}</span>
                    <span className="item-details">
                      {item.quantity} x {formatCurrency(item.unit_price)}
                    </span>
                  </div>
                  <span className="item-total">
                    {formatCurrency(item.unit_price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            
            {orderDetails.total_amount && (
              <div className="order-total">
                <span className="total-label">Total pagado</span>
                <span className="total-amount">{formatCurrency(orderDetails.total_amount)}</span>
              </div>
            )}
          </div>
        )}
        
        <div className="order-details">
          <div className="detail-item">
            <span className="detail-label">Método de pago:</span>
            <span className="detail-value">Tarjeta (Stripe)</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Estado:</span>
            <span className="detail-value success-status">✓ Completado</span>
          </div>
        </div>

        <div className="success-message">
          <h3>¿Qué sigue?</h3>
          <ul>
            <li>📧 Recibirás un email de confirmación</li>
            <li>📦 Prepararemos tu pedido para entrega</li>
            <li>🚚 Te contactaremos para coordinar la entrega</li>
            <li>⏰ Tiempo estimado: 60-90 minutos</li>
          </ul>
        </div>

        <div className="success-actions">
          <button 
            onClick={handleBackToStore}
            className="btn btn-primary finish-order-btn"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}

export default CheckoutSuccess;