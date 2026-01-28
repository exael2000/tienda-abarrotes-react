import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { useCheckoutFlow } from '../hooks/useCheckoutFlow';
import { PAYMENT_METHODS, processPayment } from '../services/paymentService';
import {
  validateCart,
  validateCheckoutForm,
} from '../utils/checkoutValidation';
import { formatPrice, pesosTocents } from '../utils/currency';
import CashConfirmation from './checkout/CashConfirmation';
import './checkout/CashConfirmation.css';
import './checkout/Checkout.css';
import CustomerInfoForm from './checkout/CustomerInfoForm';
import './checkout/CustomerInfoForm.css';
import OrderConfirmation from './checkout/OrderConfirmation';
import './checkout/OrderConfirmation.css';
import PaymentMethodSelector from './checkout/PaymentMethodSelector';
import './checkout/PaymentMethodSelector.css';
import { showToast } from './ToastProvider';

// Helper function to format currency
const formatCurrency = pesos => {
  return formatPrice(pesosTocents(pesos));
};

function Checkout() {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useContext(CartContext);
  const [loading, setLoading] = useState(false);
  const [savedCartItems, setSavedCartItems] = useState([]);
  const [savedTotal, setSavedTotal] = useState(0);

  const {
    currentStep,
    formData,
    errors,
    orderNumber,
    setErrors,
    setOrderNumber,
    setOrderComplete,
    handleInputChange,
    handlePaymentMethodChange,
    goToStep,
    nextStep,
    previousStep,
    calculateTotal,
    isGuest,
  } = useCheckoutFlow(cartItems);

  // Validate cart on mount (only for initial steps)
  React.useEffect(() => {
    // Don't validate if we're on confirmation screen (step 6)
    if (currentStep === 6) return;

    const cartValidation = validateCart(cartItems);
    if (!cartValidation.isValid) {
      showToast.error(cartValidation.error);
      navigate('/cart');
    }
  }, [cartItems, navigate, currentStep]);

  // Handle step 1 validation and submission
  const handleStep1Continue = () => {
    const validation = validateCheckoutForm(formData, isGuest);

    if (!validation.isValid) {
      setErrors(validation.errors);
      showToast.error('Por favor completa todos los campos requeridos');
      return;
    }

    nextStep();
  };

  // Handle step 2 continue (payment method selection)
  const handleStep2Continue = () => {
    if (!formData.paymentMethod) {
      showToast.error('Selecciona un método de pago');
      return;
    }
    nextStep();
  };

  // Handle final order submission - Main payment processing
  const handleSubmitOrder = async () => {
    if (loading) return;

    // Save cart items and total BEFORE any processing
    if (cartItems && cartItems.length > 0) {
      setSavedCartItems([...cartItems]);
      setSavedTotal(calculateTotal());
    }

    setLoading(true);

    const toastId = showToast.loading('Procesando tu pedido...');

    try {
      // Process payment using payment service
      const paymentResult = await processPayment(
        formData.paymentMethod,
        formData,
        cartItems,
        calculateTotal
      );

      if (!paymentResult.success) {
        throw new Error(paymentResult.error);
      }

      // Handle payment method specific flow
      if (formData.paymentMethod === PAYMENT_METHODS.CASH) {
        // Cash payment - show confirmation screen
        setOrderNumber(paymentResult.orderNumber);
        setOrderComplete(true);
        clearCart(); // Clear cart immediately for cash
        goToStep(6); // Go to cash confirmation step
        showToast.success('¡Pedido confirmado!', { id: toastId });
      } else if (formData.paymentMethod === PAYMENT_METHODS.CARD) {
        // Card payment - redirect to Stripe
        showToast.success('Redirigiendo a pago seguro...', { id: toastId });

        // Small delay for better UX
        setTimeout(() => {
          window.location.href = paymentResult.redirectUrl;
        }, 500);
      }
    } catch (error) {
      console.error('❌ Payment processing error:', error);

      const errorMessage = error.message || 'Error al procesar el pedido';
      showToast.error(errorMessage, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // Empty cart check - but skip if we're on confirmation screen (step 6) or have saved items
  const shouldRedirect =
    (!cartItems || cartItems.length === 0) &&
    currentStep !== 6 &&
    savedCartItems.length === 0;

  if (shouldRedirect) {
    navigate('/', { replace: true });
    return null;
  }

  // Use saved cart items for confirmation screen if cart is empty
  const displayCartItems =
    cartItems && cartItems.length > 0 ? cartItems : savedCartItems;
  const displayTotal =
    cartItems && cartItems.length > 0 ? calculateTotal() : savedTotal;

  return (
    <div className="checkout-container">
      <h2>Finalizar compra</h2>

      {/* Step Indicator */}
      {currentStep < 5 && currentStep !== 6 && (
        <div className="checkout-steps">
          <div
            className={`step ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : 'inactive'}`}
          >
            <span className="step-number">1</span>
            <span className="step-text">Información</span>
          </div>
          <div
            className={`step ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : 'inactive'}`}
          >
            <span className="step-number">2</span>
            <span className="step-text">Pago</span>
          </div>
          <div
            className={`step ${currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : 'inactive'}`}
          >
            <span className="step-number">3</span>
            <span className="step-text">Confirmar</span>
          </div>
        </div>
      )}

      {/* Cart Summary */}
      {currentStep < 3 && currentStep !== 6 && (
        <div className="checkout-summary">
          <h3>Resumen del carrito</h3>
          <div className="cart-items-summary">
            {displayCartItems.map(item => {
              const itemPrice = item.price_cents
                ? item.price_cents / 100
                : item.price;
              const itemImage =
                item.image_url ||
                (item.image
                  ? `/images/products/${item.image}`
                  : '/images/products/placeholder.svg');

              return (
                <div key={item.id} className="cart-item-summary">
                  <img
                    src={itemImage}
                    alt={item.name}
                    className="cart-item-image"
                    onError={e => {
                      e.target.src = '/images/products/placeholder.svg';
                    }}
                  />
                  <div className="item-details">
                    <span className="item-name">{item.name}</span>
                    <span className="item-quantity">
                      {item.quantity} x {formatCurrency(itemPrice)}
                    </span>
                  </div>
                  <span className="item-total">
                    {formatCurrency(itemPrice * item.quantity)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="total-amount">
            Total: {formatCurrency(displayTotal)}
          </div>
        </div>
      )}

      {/* Step 1: Customer Information */}
      {currentStep === 1 && (
        <>
          <CustomerInfoForm
            formData={formData}
            errors={errors}
            onChange={handleInputChange}
            isGuest={isGuest}
          />
          <div className="checkout-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/')}
            >
              Volver al carrito
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleStep1Continue}
            >
              Continuar
            </button>
          </div>
        </>
      )}

      {/* Step 2: Payment Method */}
      {currentStep === 2 && (
        <>
          <PaymentMethodSelector
            selectedMethod={formData.paymentMethod}
            onChange={handlePaymentMethodChange}
          />
          <div className="checkout-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={previousStep}
            >
              Atrás
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleStep2Continue}
            >
              Continuar
            </button>
          </div>
        </>
      )}

      {/* Step 3: Order Confirmation */}
      {currentStep === 3 && (
        <>
          <OrderConfirmation
            cartItems={cartItems}
            formData={formData}
            paymentMethod={formData.paymentMethod}
            total={calculateTotal()}
            formatCurrency={formatCurrency}
          />
          <div className="checkout-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={previousStep}
              disabled={loading}
            >
              Atrás
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmitOrder}
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Confirmar pedido'}
            </button>
          </div>
        </>
      )}

      {/* Step 6: Cash Confirmation */}
      {currentStep === 6 && (
        <CashConfirmation
          orderNumber={orderNumber}
          formData={formData}
          cartItems={displayCartItems}
          total={displayTotal}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
}

export default Checkout;
