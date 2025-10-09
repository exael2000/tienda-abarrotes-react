import React, { useState, useContext, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice, pesosTocents } from '../utils/currency';
import { createOrder } from '../services/api';
import './Checkout_fixed.css';

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

  // Debug effect
  useEffect(() => {
    console.log('🔄 Estado actualizado:');
    console.log('- currentStep:', currentStep);
    console.log('- orderComplete:', orderComplete);
    console.log('- orderNumber:', orderNumber);
    console.log('- paymentMethod:', formData.paymentMethod);
    console.log('- cartItems length:', cartItems.length);
  }, [currentStep, orderComplete, orderNumber, formData.paymentMethod, cartItems.length]);

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
    
    if (formData.customerEmail && formData.customerEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail.trim())) {
      newErrors.customerEmail = 'Email inválido (ejemplo: usuario@dominio.com)';
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

  const handlePaymentMethodSelect = (paymentMethod) => {
    // Actualizar el método de pago seleccionado
    setFormData(prev => ({
      ...prev,
      paymentMethod: paymentMethod
    }));
    
    // Limpiar errores de método de pago
    if (errors.paymentMethod) {
      setErrors(prev => ({
        ...prev,
        paymentMethod: undefined
      }));
    }
    
    // Avanzar automáticamente al siguiente paso después de un pequeño delay
    setTimeout(() => {
      setCurrentStep(3);
    }, 300);
  };

  const submitOrder = async () => {
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
          image_url: item.image_url || (item.image ? `/images/products/${item.image}` : '/images/products/placeholder.svg'),
        }))
      };

      const response = await createOrder(orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      // Axios pone el mensaje del servidor en error.response.data
      const errorMessage = error.response?.data?.error || error.message || 'Error al crear la orden';
      throw new Error(errorMessage);
    }
  };

  const handleSubmitOrder = async () => {
    console.log('🔄 Iniciando pedido - Método:', formData.paymentMethod);
    
    setLoading(true);
    
    try {
      if (formData.paymentMethod === PAYMENT_METHODS.CASH) {
        // Para efectivo, crear orden directamente
        const result = await submitOrder();
        console.log('✅ Orden creada para efectivo:', result.order_number);
        
        // Guardar datos del usuario para futuros pedidos
        saveUserData();
        
        // Guardar información del pedido
        setOrderNumber(result.order_number);
        setOrderComplete(true);
        
        // Limpiar carrito después del pago en efectivo (silenciosamente)
        clearCart(true);
        
        // Navegar al paso 6 inmediatamente
        setCurrentStep(6);
        console.log('📊 Navegando a paso 6 - Confirmación de efectivo');
        
      } else if (formData.paymentMethod === PAYMENT_METHODS.CARD) {
        // Para tarjeta, redirigir directamente a Stripe Checkout
        console.log('💳 Redirigiendo a Stripe Checkout...');
        await redirectToStripeCheckout();
      }
      
    } catch (error) {
      console.error('❌ Error:', error);
      // Manejar error sin alert molesto - mostrar en UI
      setErrors({ submit: 'Error al procesar la orden. Por favor intenta nuevamente.' });
    } finally {
      setLoading(false);
    }
  };

  const redirectToStripeCheckout = async () => {
    try {
      // Preparar datos para la sesión de Checkout
      const checkoutData = {
        customer_name: formData.customerName,
        customer_email: formData.customerEmail,
        customer_phone: formData.customerPhone,
        delivery_address: formData.deliveryAddress,
        order_notes: formData.orderNotes || '',
        items: cartItems.map(item => ({
          product_id: item.id,  // Agregar el ID del producto
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
      
      // Guardar datos del usuario antes de redirigir
      saveUserData();
      
      // Redirigir a Stripe Checkout
      console.log('🚀 Redirigiendo a Stripe Checkout...');
      window.location.href = url;
      
    } catch (error) {
      console.error('Error al crear sesión de Checkout:', error);
      throw error;
    }
  };

  // Solo mostrar carrito vacío si no estamos en proceso de checkout (paso 6 o con orden completa)
  if (cartItems.length === 0 && currentStep < 4 && !orderComplete) {
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
        {(currentStep === 5 || currentStep === 6) && (
          <div className={`step ${currentStep === 5 || currentStep === 6 ? 'active' : 'completed'}`}>
            <span className="step-number">✓</span>
            <span>Completado</span>
          </div>
        )}
      </div>

      {/* Resumen del carrito CON IMÁGENES - Solo en pasos 1 y 2 */}
      {(currentStep === 1 || currentStep === 2) && (
        <div className="checkout-summary">
          <h3>Resumen del pedido</h3>
          <div className="cart-items-summary">
          {cartItems.map(item => {
            const itemPrice = item.price_cents ? item.price_cents / 100 : item.price;
            const itemImage = item.image_url || (item.image ? `/images/products/${item.image}` : '/images/products/placeholder.svg');
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
      )}

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
              <label htmlFor="cash" className="payment-option" onClick={() => handlePaymentMethodSelect(PAYMENT_METHODS.CASH)}>
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
              <label htmlFor="card" className="payment-option" onClick={() => handlePaymentMethodSelect(PAYMENT_METHODS.CARD)}>
                <div className="payment-icon">💳</div>
                <div className="payment-info">
                  <strong>Pago Electrónico Seguro</strong>
                  <p>Paga con tarjeta de crédito/débito, transferencia bancaria o cualquier método de pago en línea de forma segura.</p>
                </div>
              </label>
            </div>
          </div>

          {errors.paymentMethod && <span className="error-text">{errors.paymentMethod}</span>}

          <div className="checkout-actions">
            <button onClick={handlePreviousStep} className="btn btn-secondary">
              Anterior
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
                    <span>Pago Electrónico Seguro</span>
                  </div>
                )}
              </div>
            </div>

            <div className="confirmation-section">
              <h4>🛒 Resumen del pedido</h4>
              <div className="order-items-mini">
                {cartItems.map(item => {
                  const itemPrice = item.price_cents ? item.price_cents / 100 : item.price;
                  const itemImage = item.image_url || (item.image ? `/images/products/${item.image}` : '/images/products/placeholder.svg');
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

      {/* Paso 5: Éxito del pedido */}
      {currentStep === 5 && (
        <div className="checkout-step order-success">
          {/* Animación de éxito */}
          <div className="success-animation">
            <div className="success-icon-container">
              <div className="success-icon">✅</div>
              <div className="success-rings">
                <div className="ring ring-1"></div>
                <div className="ring ring-2"></div>
                <div className="ring ring-3"></div>
              </div>
            </div>
          </div>
          
          <div className="success-header">
            <h2>🎉 ¡Pedido realizado con éxito!</h2>
            <p className="success-subtitle">
              Hemos recibido tu pedido y está siendo procesado
            </p>
          </div>

          {/* Número de pedido destacado */}
          {orderNumber && (
            <div className="order-number-banner">
              <div className="order-number-label">Tu número de pedido</div>
              <div className="order-number-value">#{orderNumber}</div>
              <div className="order-number-note">Guarda este número para consultas futuras</div>
            </div>
          )}

          {/* Estado del pedido y próximos pasos */}
          <div className="order-status-timeline">
            <h4>🔄 Estado de tu pedido</h4>
            <div className="timeline">
              <div className="timeline-step active">
                <div className="timeline-icon">✅</div>
                <div className="timeline-content">
                  <h5>Pedido confirmado</h5>
                  <p>Acabas de realizar tu pedido</p>
                  <span className="timeline-time">Ahora</span>
                </div>
              </div>
              <div className="timeline-step pending">
                <div className="timeline-icon">📦</div>
                <div className="timeline-content">
                  <h5>Preparando pedido</h5>
                  <p>Seleccionamos y empacamos tus productos</p>
                  <span className="timeline-time">15-30 min</span>
                </div>
              </div>
              <div className="timeline-step pending">
                <div className="timeline-icon">🚚</div>
                <div className="timeline-content">
                  <h5>En camino</h5>
                  <p>Tu pedido va rumbo a tu dirección</p>
                  <span className="timeline-time">30-60 min</span>
                </div>
              </div>
              <div className="timeline-step pending">
                <div className="timeline-icon">🎯</div>
                <div className="timeline-content">
                  <h5>Entregado</h5>
                  <p>¡Disfruta tu pedido!</p>
                  <span className="timeline-time">60-90 min</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="success-details">
            {/* Resumen del pedido */}
            <div className="success-section">
              <h4>📋 Resumen del pedido</h4>
              <div className="order-summary-final">
                {cartItems.map(item => {
                  const itemPrice = item.price_cents ? item.price_cents / 100 : item.price;
                  const itemImage = item.image_url || (item.image ? `/images/products/${item.image}` : '/images/products/placeholder.svg');
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
                        <span className="final-item-quantity">{item.quantity}x {formatCurrency(itemPrice)}</span>
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

            {/* Información de contacto y entrega */}
            <div className="success-grid">
              <div className="success-section">
                <h4>📞 Información de contacto</h4>
                <div className="contact-info">
                  <div className="contact-item">
                    <span className="contact-icon">👤</span>
                    <div className="contact-details">
                      <strong>{formData.customerName}</strong>
                      <span>Cliente</span>
                    </div>
                  </div>
                  <div className="contact-item">
                    <span className="contact-icon">📱</span>
                    <div className="contact-details">
                      <strong>{formData.customerPhone}</strong>
                      <span>Teléfono</span>
                    </div>
                  </div>
                  {formData.customerEmail && (
                    <div className="contact-item">
                      <span className="contact-icon">📧</span>
                      <div className="contact-details">
                        <strong>{formData.customerEmail}</strong>
                        <span>Email</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="success-section">
                <h4>💳 Método de pago</h4>
                <div className="payment-details">
                  {formData.paymentMethod === PAYMENT_METHODS.CASH && (
                    <div className="payment-method-card cash">
                      <div className="payment-icon">💵</div>
                      <div className="payment-info">
                        <strong>Pago en efectivo</strong>
                        <p>Pagarás al recibir tu pedido</p>
                        <span className="payment-note">Sin comisiones adicionales</span>
                      </div>
                    </div>
                  )}
                  {formData.paymentMethod === PAYMENT_METHODS.CARD && (
                    <div className="payment-method-card card">
                      <div className="payment-icon">💳</div>
                      <div className="payment-info">
                        <strong>Pago Electrónico</strong>
                        <p>Procesado con éxito</p>
                        <span className="payment-note">✅ Pago confirmado</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Información de entrega */}
            {formData.deliveryAddress && (
              <div className="success-section">
                <h4>🚚 Información de entrega</h4>
                <div className="delivery-info">
                  <div className="delivery-address-card">
                    <div className="delivery-icon">📍</div>
                    <div className="delivery-details">
                      <h5>Dirección de entrega</h5>
                      <p>{formData.deliveryAddress}</p>
                      <span className="delivery-note">
                        Tiempo estimado: 60-90 minutos
                      </span>
                    </div>
                  </div>
                  {formData.orderNotes && (
                    <div className="delivery-notes">
                      <h6>📝 Notas especiales:</h6>
                      <p>{formData.orderNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Información adicional */}
            <div className="success-section">
              <h4>💡 Información importante</h4>
              <div className="important-info">
                <div className="info-item">
                  <span className="info-icon">📞</span>
                  <p><strong>Te llamaremos:</strong> Nos comunicaremos contigo antes de la entrega</p>
                </div>
                <div className="info-item">
                  <span className="info-icon">⏰</span>
                  <p><strong>Horario de entrega:</strong> Lunes a Domingo de 8:00 AM a 8:00 PM</p>
                </div>
                <div className="info-item">
                  <span className="info-icon">🛡️</span>
                  <p><strong>Garantía:</strong> Si hay algún problema, contáctanos inmediatamente</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer de agradecimiento con acción */}
          <div className="success-footer">
            <h4>🙏 ¡Gracias por tu preferencia!</h4>
            <p>Tu pago fue procesado exitosamente. Esperamos que disfrutes tu pedido.</p>
            
            {/* Botón principal integrado */}
            <button 
              type="button" 
              className="btn btn-primary btn-large finish-order-btn"
              onClick={() => {
                // Solo navegar directamente sin limpiar carrito ni mostrar alerts
                window.location.href = '/';
              }}
            >
              Volver al inicio
            </button>
            
            <p className="finish-note">Tu pedido está confirmado. Puedes cerrar esta ventana.</p>
          </div>
        </div>
      )}

      {/* Paso 6: Confirmación de pago en efectivo */}
      {currentStep === 6 && (
        <div className="checkout-step cash-order-confirmation">
          {/* Header de confirmación */}
          <div className="cash-confirmation-header">
            <div className="cash-icon">💵</div>
            <h2>📋 ¡Orden confirmada!</h2>
            <p className="confirmation-subtitle">
              Tu pedido ha sido registrado y será entregado contra pago en efectivo
            </p>
          </div>

          {/* Número de seguimiento */}
          <div className="tracking-section">
            <div className="tracking-number">
              <h3>📦 Número de seguimiento</h3>
              <div className="tracking-display">
                <span className="tracking-code">{orderNumber}</span>
                <button 
                  className="copy-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(orderNumber);
                    // Quitar alert molesto - agregar feedback visual silencioso
                    console.log('✅ Número de seguimiento copiado al portapapeles');
                  }}
                  title="Copiar número de seguimiento"
                >
                  📋
                </button>
              </div>
              <p className="tracking-note">Guarda este número para rastrear tu pedido</p>
            </div>
          </div>

          {/* Información del cliente */}
          <div className="cash-confirmation-section">
            <h4>👤 Información del cliente</h4>
            <div className="customer-details">
              <div className="detail-item">
                <span className="detail-label">📛 Nombre:</span>
                <span className="detail-value">{formData.customerName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">📞 Teléfono:</span>
                <span className="detail-value">{formData.customerPhone}</span>
              </div>
              {formData.customerEmail && (
                <div className="detail-item">
                  <span className="detail-label">📧 Email:</span>
                  <span className="detail-value">{formData.customerEmail}</span>
                </div>
              )}
            </div>
          </div>

          {/* Dirección de entrega */}
          {formData.deliveryAddress && (
            <div className="cash-confirmation-section">
              <h4>🚚 Dirección de entrega</h4>
              <div className="address-display">
                <p>{formData.deliveryAddress}</p>
              </div>
            </div>
          )}

          {/* Resumen del pedido */}
          <div className="cash-confirmation-section">
            <h4>🛒 Resumen del pedido</h4>
            <div className="cash-order-items">
              {cartItems.map(item => {
                const itemPrice = item.price_cents ? item.price_cents / 100 : item.price;
                const itemImage = item.image_url || (item.image ? `/images/products/${item.image}` : '/images/products/placeholder.svg');
                const itemName = item.name || 'Producto sin nombre';
                
                return (
                  <div key={item.id} className="cash-order-item">
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
            
            <div className="cash-order-total">
              <div className="total-line">
                <span className="total-label">💰 Total a pagar en efectivo:</span>
                <span className="total-amount">{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
          </div>

          {/* Instrucciones de entrega */}
          <div className="cash-confirmation-section">
            <h4>📋 Instrucciones importantes</h4>
            <div className="instructions-list">
              <div className="instruction-item">
                <span className="instruction-icon">💵</span>
                <div className="instruction-text">
                  <strong>Prepara el dinero exacto:</strong>
                  <p>Facilita la entrega teniendo el monto exacto: <strong>{formatCurrency(calculateTotal())}</strong></p>
                </div>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">📞</span>
                <div className="instruction-text">
                  <strong>Te llamaremos antes de entregar:</strong>
                  <p>Nos comunicaremos contigo al <strong>{formData.customerPhone}</strong> para coordinar la entrega</p>
                </div>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">⏰</span>
                <div className="instruction-text">
                  <strong>Tiempo de entrega:</strong>
                  <p>Tu pedido será entregado en un período de 1 a 3 horas</p>
                </div>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">🆔</span>
                <div className="instruction-text">
                  <strong>Ten tu número de seguimiento listo:</strong>
                  <p>Comparte el código <strong>{orderNumber}</strong> con nuestro repartidor</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notas del pedido */}
          {formData.orderNotes && (
            <div className="cash-confirmation-section">
              <h4>📝 Notas del pedido</h4>
              <div className="order-notes-display">
                <p>{formData.orderNotes}</p>
              </div>
            </div>
          )}

          {/* Contacto de soporte */}
          <div className="cash-confirmation-section">
            <h4>📞 ¿Necesitas ayuda?</h4>
            <div className="support-contact">
              <p>Si tienes alguna duda o necesitas modificar tu pedido, contáctanos:</p>
              <div className="contact-methods">
                <div className="contact-method">
                  <span className="contact-icon">📱</span>
                  <span>WhatsApp: +52 123 456 7890</span>
                </div>
                <div className="contact-method">
                  <span className="contact-icon">📞</span>
                  <span>Teléfono: (55) 1234-5678</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer de agradecimiento con acción */}
          <div className="cash-confirmation-footer">
            <h4>🙏 ¡Gracias por elegirnos!</h4>
            <p>Prepararemos tu pedido con mucho cuidado. ¡Esperamos verte pronto!</p>
            
            {/* Botón principal integrado */}
            <button 
              type="button" 
              className="btn btn-primary btn-large finish-order-btn"
              onClick={() => {
                // Solo navegar directamente sin limpiar carrito ni mostrar alerts
                window.location.href = '/';
              }}
            >
              Volver al inicio
            </button>
            
            <p className="finish-note">Tu pedido está confirmado. Puedes cerrar esta ventana.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkout;