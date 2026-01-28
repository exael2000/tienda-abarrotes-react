import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SuccessScreen.css';

function SuccessScreen({ orderNumber, formData, paymentMethod }) {
  const navigate = useNavigate();

  const handleBackHome = () => {
    navigate('/');
  };

  return (
    <div className="checkout-step success-screen">
      {/* Success Header */}
      <div className="success-header">
        <div className="success-checkmark">
          <div className="checkmark-circle">
            <div className="checkmark-stem"></div>
            <div className="checkmark-kick"></div>
          </div>
        </div>
        <h2>¡Pedido confirmado!</h2>
        <p className="success-subtitle">
          {paymentMethod === 'card' 
            ? 'Tu pago ha sido procesado exitosamente'
            : 'Tu pedido ha sido registrado correctamente'
          }
        </p>
      </div>

      {/* Order Number */}
      <div className="order-tracking">
        <h3>Número de seguimiento</h3>
        <div className="tracking-number">
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

      {/* Timeline */}
      <div className="order-timeline">
        <h3>Estado del pedido</h3>
        <div className="timeline">
          <div className="timeline-item active">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <h4>Pedido recibido</h4>
              <p>Tu pedido ha sido confirmado</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <h4>Preparando pedido</h4>
              <p>Estamos preparando tus productos</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <h4>En camino</h4>
              <p>Tu pedido está siendo entregado</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <h4>Entregado</h4>
              <p>¡Disfruta tu pedido!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="delivery-info">
        <h3>Información de entrega</h3>
        <div className="info-card">
          <div className="info-item">
            <span className="info-icon">📍</span>
            <div>
              <strong>Dirección</strong>
              <p>{formData.deliveryAddress}</p>
            </div>
          </div>
          <div className="info-item">
            <span className="info-icon">📞</span>
            <div>
              <strong>Te llamaremos</strong>
              <p>Nos comunicaremos al {formData.customerPhone} antes de entregar</p>
            </div>
          </div>
          <div className="info-item">
            <span className="info-icon">⏰</span>
            <div>
              <strong>Tiempo estimado</strong>
              <p>60-90 minutos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="success-footer">
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

export default SuccessScreen;
