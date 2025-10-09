import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import './CheckoutSuccess.css';

function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processed, setProcessed] = useState(false); // Evitar múltiples ejecuciones
  const { clearCart } = useContext(CartContext);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    const processSuccessfulPayment = async (sessionId) => {
      if (processed) return; // Ya procesado, evitar loop
      
      try {
        setProcessed(true); // Marcar como procesado
        
        // Aquí podríamos verificar la sesión con Stripe y crear la orden
        // Por ahora simularemos una orden exitosa
        const orderData = {
          order_number: `ORD-${Date.now()}`,
          session_id: sessionId,
          status: 'completed',
          payment_method: 'card'
        };
        
        setOrderDetails(orderData);
        
        // Limpiar carrito después del pago exitoso (sin confirmación)
        clearCart(true);
        
      } catch (err) {
        console.error('Error al procesar pago exitoso:', err);
        setError('Error al procesar el pago');
      } finally {
        setLoading(false);
      }
    };
    
    if (sessionId && !processed) {
      // Procesar el pago exitoso y crear la orden
      processSuccessfulPayment(sessionId);
    } else if (!sessionId) {
      setError('No se encontró información de la sesión de pago');
      setLoading(false);
    }
  }, [searchParams, clearCart, processed]);

  const handleBackToStore = () => {
    // Usar navigate en lugar de window.location para mejor UX
    window.location.href = '/';
  };

  // Prevenir cualquier redirección automática durante los primeros segundos
  useEffect(() => {
    console.log('✅ CheckoutSuccess mounted, preventing auto-redirects');
    return () => {
      console.log('✅ CheckoutSuccess unmounted');
    };
  }, []);

  if (loading) {
    return (
      <div className="checkout-success-container">
        <div className="success-content">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Procesando tu pedido...</p>
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
        
        <div className="order-details">
          <div className="detail-item">
            <span className="detail-label">Número de orden:</span>
            <span className="detail-value">{orderDetails?.order_number}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Método de pago:</span>
            <span className="detail-value">Tarjeta (Stripe)</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Estado:</span>
            <span className="detail-value success-status">Completado</span>
          </div>
        </div>

        <div className="success-message">
          <h3>¿Qué sigue?</h3>
          <ul>
            <li>📧 Recibirás un email de confirmación</li>
            <li>📦 Prepararemos tu pedido para entrega</li>
            <li>🚚 Te contactaremos para coordinar la entrega</li>
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