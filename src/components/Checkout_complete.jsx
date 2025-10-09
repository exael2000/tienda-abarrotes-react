import React, { useState, useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice, pesosTocents } from '../utils/currency';
import StripePayment from './StripePayment';
import './Checkout.css';

const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card'
};

// Helper function para formatear precios en pesos
const formatCurrency = (pesos) => {
  return formatPrice(pesosTocents(pesos));
};

function Checkout({ onSuccess, onCancel }) {
  const { cartItems, clearCart } = useContext(CartContext);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: info, 2: payment, 3: confirmation, 4: card payment, 5: success
  const [orderNumber, setOrderNumber] = useState(null);
  const [orderComplete, setOrderComplete] = useState(false);
  
  // Función para construir el nombre completo del usuario
  const getUserFullName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    } else if (user?.first_name) {
      return user.first_name;
    } else if (user?.username) {
      return user.username;
    }
    return '';
  };

  // Función para cargar datos guardados del usuario
  const loadSavedUserData = () => {
    if (user?.id) {
      const savedData = localStorage.getItem(`userCheckoutData_${user.id}`);
      if (savedData) {
        return JSON.parse(savedData);
      }
    }
    return {};
  };

  const [formData, setFormData] = useState(() => {
    const savedData = loadSavedUserData();
    return {
      customerName: savedData.customerName || getUserFullName(),
      customerPhone: savedData.customerPhone || '',
      customerEmail: savedData.customerEmail || user?.email || '',
      deliveryAddress: savedData.deliveryAddress || '',
      orderNotes: '',
      paymentMethod: ''
    };
  });
  
  const [errors, setErrors] = useState({});

  // Función para guardar datos del usuario para futuros pedidos
  const saveUserData = () => {
    if (user?.id) {
      const dataToSave = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        deliveryAddress: formData.deliveryAddress
      };
      localStorage.setItem(`userCheckoutData_${user.id}`, JSON.stringify(dataToSave));
    }
  };

  // Calcular total
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      // Manejar tanto price_cents como price para compatibilidad
      const itemPrice = item.price_cents ? item.price_cents / 100 : item.price;
      return total + (itemPrice * item.quantity);
    }, 0);
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Nombre es requerido';
    }
    
    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Teléfono es requerido';
    }
    
    if (formData.customerEmail && !/\\S+@\\S+\\.\\S+/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Email inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Seleccione un método de pago';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error específico
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
    
    // Guardar automáticamente información importante del usuario logueado
    if (user?.id && ['customerName', 'customerPhone', 'customerEmail', 'deliveryAddress'].includes(name)) {
      const currentData = loadSavedUserData();
      const updatedData = {
        ...currentData,
        [name]: value
      };
      localStorage.setItem(`userCheckoutData_${user.id}`, JSON.stringify(updatedData));
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const createOrder = async () => {
    try {
      const orderData = {
        customer_name: formData.customerName,
        customer_phone: formData.customerPhone,
        customer_email: formData.customerEmail,
        delivery_address: formData.deliveryAddress,
        order_notes: formData.orderNotes,
        payment_method: formData.paymentMethod,
        total_amount: calculateTotal(),
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price_cents ? item.price_cents / 100 : item.price,
          name: item.name,
          image_url: item.image_url || item.image || `/images/products/${item.image}`,
        }))
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear la orden');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const handleSubmitOrder = async () => {
    setLoading(true);
    
    try {
      if (formData.paymentMethod === PAYMENT_METHODS.CASH) {
        // Para efectivo, crear orden directamente
        const result = await createOrder();
        
        // Guardar datos del usuario para futuros pedidos
        saveUserData();
        
        // Guardar información del pedido
        setOrderNumber(result.order_number);
        setOrderComplete(true);
        setCurrentStep(5); // Ir al paso de éxito
        
        // Limpiar carrito
        clearCart();
        
        if (onSuccess) {
          onSuccess(result);
        }
        
      } else if (formData.paymentMethod === PAYMENT_METHODS.CARD) {
        // Para tarjeta, mostrar formulario de Stripe
        setCurrentStep(4); // Nuevo paso para Stripe
      }
      
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar la orden: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStripeSuccess = (result) => {
    // Guardar datos del usuario para futuros pedidos
    saveUserData();
    
    // Guardar información del pedido
    setOrderNumber(result.order_number);
    setOrderComplete(true);
    setCurrentStep(5); // Ir al paso de éxito
    
    // Limpiar carrito
    clearCart();
    
    if (onSuccess) {
      onSuccess(result);
    }
  };

  const handleStripeError = (error) => {
    console.error('Stripe error:', error);
    alert('Error al procesar el pago: ' + error.message);
    setCurrentStep(3); // Volver al paso de confirmación
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-container">
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2>Tu carrito está vacío</h2>
          <p>Agrega algunos productos para continuar con tu compra.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="btn btn-primary"
          >
            Ir al catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h2>Finalizar compra</h2>
      
      {/* Indicador de pasos */}
      <div className="checkout-steps">
        <div className={`step ${currentStep >= 1 ? (currentStep === 1 ? 'active' : 'completed') : 'inactive'}`}>
          <span className="step-number">1</span>
          <span>Información</span>
        </div>
        <div className={`step ${currentStep >= 2 ? (currentStep === 2 ? 'active' : 'completed') : 'inactive'}`}>
          <span className="step-number">2</span>
          <span>Pago</span>
        </div>
        <div className={`step ${currentStep >= 3 ? (currentStep === 3 ? 'active' : 'completed') : 'inactive'}`}>
          <span className="step-number">3</span>
          <span>Confirmación</span>
        </div>
        {currentStep >= 4 && (
          <div className={`step ${currentStep >= 4 ? (currentStep === 4 ? 'active' : 'completed') : 'inactive'}`}>
            <span className="step-number">4</span>
            <span>Pago con tarjeta</span>
          </div>
        )}
        {currentStep >= 5 && (
          <div className={`step ${currentStep === 5 ? 'active' : 'completed'}`}>
            <span className="step-number">✓</span>
            <span>Completado</span>
          </div>
        )}
      </div>

      {/* Resumen del carrito CON IMÁGENES */}
      <div className="checkout-summary">
        <h3>Resumen del pedido</h3>
        <div className="cart-items-summary">
          {cartItems.map(item => {
            const itemPrice = item.price_cents ? item.price_cents / 100 : item.price;
            const itemImage = item.image_url || item.image || `/images/products/${item.image}`;
            const itemName = item.name || 'Producto sin nombre';
            
            return (
              <div key={item.id} className="cart-item-summary">
                <img 
                  src={itemImage} 
                  alt={itemName}
                  className="cart-item-image"
                  onError={(e) => {
                    e.target.src = '/images/products/placeholder.svg';
                  }}
                />
                <div className="item-details">
                  <span className="item-name">{itemName}</span>
                  <span className="item-quantity">Cantidad: {item.quantity}</span>
                  <span className="item-price">Precio unitario: {formatCurrency(itemPrice)}</span>
                </div>
                <span className="item-total">{formatCurrency(itemPrice * item.quantity)}</span>
              </div>
            );
          })}
        </div>
        <div className="total-amount">
          <strong>Total: {formatCurrency(calculateTotal())}</strong>
        </div>
      </div>

      {/* Paso 1: Información del cliente */}
      {currentStep === 1 && (
        <div className="checkout-step">
          <h3>Información del cliente</h3>
          
          {user && !localStorage.getItem('isGuest') && (
            <div className="user-info-banner">
              <p>👤 Hola, <strong>{getUserFullName() || user.username}</strong>!</p>
              <p className="info-note">Hemos precargado tu información. Puedes modificarla si es necesario.</p>
            </div>
          )}

          {(!user || localStorage.getItem('isGuest') === 'true') && (
            <div className="guest-info-banner">
              <p>🛍️ <strong>Comprando como invitado</strong></p>
              <p className="info-note">
                💡 ¿Sabías que puedes <strong>registrarte</strong> para guardar tu información y hacer futuras compras más rápido?
              </p>
            </div>
          )}
          
          <div className="form-group">
            <label>Nombre completo *</label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleInputChange}
              className={errors.customerName ? 'error' : ''}
              placeholder={user ? "Tu nombre completo" : "Ingresa tu nombre completo"}
            />
            {errors.customerName && <span className="error-text">{errors.customerName}</span>}
          </div>

          <div className="form-group">
            <label>Teléfono *</label>
            <input
              type="tel"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleInputChange}
              className={errors.customerPhone ? 'error' : ''}
              placeholder={formData.customerPhone ? formData.customerPhone : "Ej: 1234567890"}
            />
            {errors.customerPhone && <span className="error-text">{errors.customerPhone}</span>}
          </div>

          <div className="form-group">
            <label>Email (opcional)</label>
            <input
              type="email"
              name="customerEmail"
              value={formData.customerEmail}
              onChange={handleInputChange}
              className={errors.customerEmail ? 'error' : ''}
              placeholder={formData.customerEmail ? formData.customerEmail : "tu@email.com"}
            />
            {errors.customerEmail && <span className="error-text">{errors.customerEmail}</span>}
          </div>

          <div className="form-group">
            <label>Dirección de entrega (opcional)</label>
            <textarea
              name="deliveryAddress"
              value={formData.deliveryAddress}
              onChange={handleInputChange}
              placeholder={formData.deliveryAddress ? formData.deliveryAddress : "Calle, número, colonia, ciudad..."}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Notas del pedido (opcional)</label>
            <textarea
              name="orderNotes"
              value={formData.orderNotes}
              onChange={handleInputChange}
              placeholder="Instrucciones especiales, preferencias de entrega, etc."
              rows="3"
            />
          </div>

          <div className="checkout-actions">
            <button onClick={onCancel} className="btn btn-secondary">
              Cancelar
            </button>
            <button onClick={handleNextStep} className="btn btn-primary">
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* Paso 2: Método de pago */}
      {currentStep === 2 && (
        <div className="checkout-step">
          <h3>Método de pago</h3>
          <div className="payment-methods">
            <div className="payment-method">
              <input
                type="radio"
                id="cash"
                name="paymentMethod"
                value={PAYMENT_METHODS.CASH}
                checked={formData.paymentMethod === PAYMENT_METHODS.CASH}
                onChange={handleInputChange}
              />
              <label htmlFor="cash" className="payment-option">
                <div className="payment-icon">💵</div>
                <div className="payment-info">
                  <strong>Pago en efectivo</strong>
                  <p>Paga al recibir tu pedido. Sin comisiones adicionales.</p>
                </div>
              </label>
            </div>

            <div className="payment-method">
              <input
                type="radio"
                id="card"
                name="paymentMethod"
                value={PAYMENT_METHODS.CARD}
                checked={formData.paymentMethod === PAYMENT_METHODS.CARD}
                onChange={handleInputChange}
              />
              <label htmlFor="card" className="payment-option">
                <div className="payment-icon">💳</div>
                <div className="payment-info">
                  <strong>Pasarela de pago</strong>
                  <p>Paga con tarjeta de crédito/débito, transferencia electrónica o cualquier método de pago en línea.</p>
                </div>
              </label>
            </div>
          </div>

          {errors.paymentMethod && <span className="error-text">{errors.paymentMethod}</span>}

          <div className="checkout-actions">
            <button onClick={handlePreviousStep} className="btn btn-secondary">
              Anterior
            </button>
            <button onClick={handleNextStep} className="btn btn-primary">
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* Paso 3: Confirmación */}
      {currentStep === 3 && (
        <div className="checkout-step">
          <h3>Confirmar pedido</h3>
          
          <div className="order-confirmation">
            <div className="confirmation-section">
              <h4>📋 Información del cliente</h4>
              <div className="confirmation-grid">
                <p><strong>Nombre:</strong> {formData.customerName}</p>
                <p><strong>Teléfono:</strong> {formData.customerPhone}</p>
                {formData.customerEmail && <p><strong>Email:</strong> {formData.customerEmail}</p>}
                {formData.deliveryAddress && (
                  <div className="full-width">
                    <p><strong>Dirección de entrega:</strong></p>
                    <p className="address-text">{formData.deliveryAddress}</p>
                  </div>
                )}
                {formData.orderNotes && (
                  <div className="full-width">
                    <p><strong>Notas del pedido:</strong></p>
                    <p className="notes-text">{formData.orderNotes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="confirmation-section">
              <h4>💳 Método de pago</h4>
              <div className="payment-method-display">
                {formData.paymentMethod === PAYMENT_METHODS.CASH && (
                  <div className="payment-selected">
                    <span className="payment-icon-small">💵</span>
                    <span>Pago en efectivo al recibir</span>
                  </div>
                )}
                {formData.paymentMethod === PAYMENT_METHODS.CARD && (
                  <div className="payment-selected">
                    <span className="payment-icon-small">💳</span>
                    <span>Pasarela de pago</span>
                  </div>
                )}
              </div>
            </div>

            <div className="confirmation-section">
              <h4>🛒 Resumen del pedido</h4>
              <div className="order-items-mini">
                {cartItems.map(item => {
                  const itemPrice = item.price_cents ? item.price_cents / 100 : item.price;
                  const itemImage = item.image_url || item.image || `/images/products/${item.image}`;
                  const itemName = item.name || 'Producto sin nombre';
                  
                  return (
                    <div key={item.id} className="order-item-mini">
                      <img 
                        src={itemImage} 
                        alt={itemName}
                        className="order-item-image"
                        onError={(e) => {
                          e.target.src = '/images/products/placeholder.svg';
                        }}
                      />
                      <div className="item-info">
                        <span className="item-name">{itemName}</span>
                        <span className="item-quantity">{item.quantity}x</span>
                      </div>
                      <span className="item-subtotal">
                        {formatCurrency(itemPrice * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="order-total">
                <h4>💰 Total a pagar: {formatCurrency(calculateTotal())}</h4>
              </div>
            </div>
          </div>

          <div className="checkout-actions">
            <button onClick={handlePreviousStep} className="btn btn-secondary">
              Anterior
            </button>
            <button 
              onClick={handleSubmitOrder} 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Confirmar pedido'}
            </button>
          </div>
        </div>
      )}

      {/* Paso 4: Pago con Stripe (solo para tarjeta) */}
      {currentStep === 4 && formData.paymentMethod === PAYMENT_METHODS.CARD && (
        <div className="checkout-step">
          <h3>Pago con tarjeta</h3>
          
          <div className="payment-summary">
            <p><strong>Total a pagar:</strong> {formatCurrency(calculateTotal())}</p>
            <p><strong>Cliente:</strong> {formData.customerName}</p>
          </div>

          <StripePayment
            amount={calculateTotal()}
            onSuccess={handleStripeSuccess}
            onError={handleStripeError}
            customerData={formData}
            cartItems={cartItems}
          />

          <div className="checkout-actions">
            <button 
              onClick={() => setCurrentStep(3)} 
              className="btn btn-secondary"
            >
              Volver
            </button>
          </div>
        </div>
      )}

      {/* Paso 5: Éxito del pedido */}
      {currentStep === 5 && orderComplete && (
        <div className="checkout-step order-success">
          <div className="success-icon">
            ✅
          </div>
          <h3>¡Pedido realizado con éxito!</h3>
          {orderNumber && (
            <div className="order-number">
              <strong>Número de pedido: #{orderNumber}</strong>
            </div>
          )}
          
          <div className="success-details">
            <div className="success-section">
              <h4>📋 Resumen del pedido</h4>
              <div className="order-summary-final">
                {cartItems.map(item => {
                  const itemPrice = item.price_cents ? item.price_cents / 100 : item.price;
                  const itemImage = item.image_url || item.image || `/images/products/${item.image}`;
                  const itemName = item.name || 'Producto sin nombre';
                  
                  return (
                    <div key={item.id} className="final-item">
                      <img 
                        src={itemImage} 
                        alt={itemName}
                        className="final-item-image"
                        onError={(e) => {
                          e.target.src = '/images/products/placeholder.svg';
                        }}
                      />
                      <div className="final-item-info">
                        <span className="final-item-name">{itemName}</span>
                        <span className="final-item-quantity">{item.quantity}x</span>
                      </div>
                      <span className="final-item-price">
                        {formatCurrency(itemPrice * item.quantity)}
                      </span>
                    </div>
                  );
                })}
                <div className="final-total">
                  <strong>Total pagado: {formatCurrency(calculateTotal())}</strong>
                </div>
              </div>
            </div>

            <div className="success-section">
              <h4>📞 Información de contacto</h4>
              <p><strong>Cliente:</strong> {formData.customerName}</p>
              <p><strong>Teléfono:</strong> {formData.customerPhone}</p>
              {formData.customerEmail && <p><strong>Email:</strong> {formData.customerEmail}</p>}
            </div>

            <div className="success-section">
              <h4>💳 Método de pago</h4>
              <p>
                {formData.paymentMethod === PAYMENT_METHODS.CASH && '💵 Pago en efectivo al recibir'}
                {formData.paymentMethod === PAYMENT_METHODS.CARD && '💳 Pasarela de pago - Procesado'}
              </p>
            </div>

            {formData.deliveryAddress && (
              <div className="success-section">
                <h4>🚚 Entrega</h4>
                <p><strong>Dirección:</strong></p>
                <p className="delivery-address">{formData.deliveryAddress}</p>
              </div>
            )}
          </div>

          <div className="success-actions">
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={() => window.location.href = '/'}
            >
              🏠 Volver al inicio
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => {
                setCurrentStep(1);
                setOrderComplete(false);
                setOrderNumber(null);
              }}
            >
              🛒 Realizar otro pedido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkout;