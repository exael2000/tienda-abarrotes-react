import React from 'react';
import './CustomerInfoForm.css';

function CustomerInfoForm({ formData, errors, onChange, isGuest }) {
  return (
    <div className="checkout-step">
      <h3>📝 Información del cliente</h3>

      {isGuest && (
        <div className="guest-info-banner">
          <span className="guest-icon">👤</span>
          <div className="guest-text">
            <strong>Comprando como invitado</strong>
            <p>Completa la información para procesar tu pedido</p>
          </div>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="customerName">
          Nombre completo <span className="required">*</span>
        </label>
        <input
          type="text"
          id="customerName"
          name="customerName"
          value={formData.customerName}
          onChange={onChange}
          placeholder="Juan Pérez"
          className={errors.customerName ? 'error' : ''}
        />
        {errors.customerName && (
          <span className="error-text">{errors.customerName}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="customerPhone">
          Teléfono <span className="required">*</span>
        </label>
        <input
          type="tel"
          id="customerPhone"
          name="customerPhone"
          value={formData.customerPhone}
          onChange={onChange}
          placeholder="5512345678"
          className={errors.customerPhone ? 'error' : ''}
        />
        {errors.customerPhone && (
          <span className="error-text">{errors.customerPhone}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="customerEmail">
          Email {!isGuest && <span className="required">*</span>}
        </label>
        <input
          type="email"
          id="customerEmail"
          name="customerEmail"
          value={formData.customerEmail}
          onChange={onChange}
          placeholder="ejemplo@correo.com"
          className={errors.customerEmail ? 'error' : ''}
        />
        {errors.customerEmail && (
          <span className="error-text">{errors.customerEmail}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="deliveryAddress">
          Dirección de entrega <span className="required">*</span>
        </label>
        <input
          type="text"
          id="deliveryAddress"
          name="deliveryAddress"
          value={formData.deliveryAddress}
          onChange={onChange}
          placeholder="Calle, número, colonia, ciudad"
          className={errors.deliveryAddress ? 'error' : ''}
        />
        {errors.deliveryAddress && (
          <span className="error-text">{errors.deliveryAddress}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="orderNotes">
          Notas adicionales (opcional)
        </label>
        <textarea
          id="orderNotes"
          name="orderNotes"
          value={formData.orderNotes}
          onChange={onChange}
          placeholder="Instrucciones especiales, referencias de ubicación, etc."
          rows="3"
        />
      </div>
    </div>
  );
}

export default CustomerInfoForm;
