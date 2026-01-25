/**
 * Payment Service
 * Handles all payment-related operations for checkout
 * 
 * PAYMENT FLOW:
 * 
 * CASH PAYMENT:
 * 1. User selects cash payment and confirms order
 * 2. Order is created immediately in database (payment pending - will be paid on delivery)
 * 3. User sees confirmation screen with order details
 * 4. Cart is cleared
 * 
 * CARD PAYMENT (Stripe):
 * 1. User selects card payment and confirms order
 * 2. Stripe session is created with order data as metadata (NO database order yet)
 * 3. User is redirected to Stripe payment page
 * 4. User completes payment on Stripe
 * 5. Stripe redirects back to /checkout/success with session_id
 * 6. verifyStripePayment() is called:
 *    - Verifies payment with Stripe
 *    - Creates order in database ONLY if payment successful
 *    - Returns order details
 * 7. User sees confirmation screen with order details
 * 8. Cart is cleared
 * 
 * This ensures orders are only created in DB after payment confirmation for card payments,
 * while cash payments are accepted immediately (payment on delivery).
 */

import { createOrder } from './api';
import { pesosTocents } from '../utils/currency';
import { sanitizeFormData } from '../utils/checkoutValidation';

/**
 * Payment method constants
 */
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card'
};

/**
 * Payment status constants
 */
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

/**
 * Process cash payment
 * Creates order directly in database with cash payment method
 */
export const processCashPayment = async (formData, cartItems, calculateTotal) => {
  try {
    const sanitizedData = sanitizeFormData(formData);
    
    // Validate cart items
    const validItems = cartItems.filter(item => {
      const hasPrice = item.price_cents || item.price;
      if (!hasPrice) {
        console.warn('⚠️ Item without price:', item);
      }
      return hasPrice && item.quantity > 0;
    });

    if (validItems.length === 0) {
      throw new Error('No hay items válidos en el carrito');
    }

    // Prepare order data
    const orderData = {
      customer_name: sanitizedData.customerName,
      customer_phone: sanitizedData.customerPhone,
      customer_email: sanitizedData.customerEmail,
      delivery_address: sanitizedData.deliveryAddress,
      order_notes: sanitizedData.orderNotes,
      payment_method: PAYMENT_METHODS.CASH,
      payment_status: PAYMENT_STATUS.PENDING,
      items: validItems.map(item => {
        const itemPrice = item.price_cents ? item.price_cents / 100 : (item.price || 0);
        return {
          product_id: item.id,
          quantity: item.quantity,
          unit_price: itemPrice
        };
      }),
      total_amount: calculateTotal()
    };

    console.log('💵 Processing cash payment:', orderData);

    // Create order
    const response = await createOrder(orderData);
    
    if (!response || !response.order_number) {
      throw new Error('No se recibió número de orden del servidor');
    }

    console.log('✅ Cash payment processed successfully:', response.order_number);
    
    return {
      success: true,
      orderNumber: response.order_number,
      orderId: response.order_id,
      paymentMethod: PAYMENT_METHODS.CASH,
      status: PAYMENT_STATUS.PENDING
    };

  } catch (error) {
    console.error('❌ Error processing cash payment:', error);
    
    const paymentError = new Error(error.message || 'Error al procesar pago en efectivo');
    paymentError.success = false;
    paymentError.details = error;
    throw paymentError;
  }
};

/**
 * Process card payment via Stripe
 * Creates Stripe checkout session with metadata for later order creation
 */
export const processCardPayment = async (formData, cartItems, calculateTotal) => {
  try {
    const sanitizedData = sanitizeFormData(formData);
    
    // Validate cart items
    const validItems = cartItems.filter(item => {
      const hasPrice = item.price_cents || item.price;
      return hasPrice && item.quantity > 0;
    });

    if (validItems.length === 0) {
      throw new Error('No hay items válidos en el carrito');
    }

    // Prepare order data to send as metadata
    const orderMetadata = {
      customer_name: sanitizedData.customerName,
      customer_phone: sanitizedData.customerPhone,
      customer_email: sanitizedData.customerEmail,
      delivery_address: sanitizedData.deliveryAddress,
      order_notes: sanitizedData.orderNotes,
      items: validItems.map(item => {
        const itemPrice = item.price_cents ? item.price_cents / 100 : (item.price || 0);
        return {
          product_id: item.id,
          name: item.name,
          quantity: item.quantity,
          unit_price: itemPrice
        };
      }),
      total_amount: calculateTotal()
    };

    // Prepare Stripe session data
    const sessionData = {
      items: validItems.map(item => {
        const itemPrice = item.price_cents ? item.price_cents / 100 : (item.price || 0);
        return {
          product_id: item.id,
          name: item.name,
          price_cents: Math.round(itemPrice * 100), // Stripe requires cents
          quantity: item.quantity,
          image: item.image_url || (item.image ? `/images/products/${item.image}` : null)
        };
      }),
      customer_info: {
        name: sanitizedData.customerName,
        phone: sanitizedData.customerPhone,
        email: sanitizedData.customerEmail,
        address: sanitizedData.deliveryAddress,
        notes: sanitizedData.orderNotes
      },
      metadata: orderMetadata, // Send order data as metadata
      total_cents: pesosTocents(calculateTotal())
    };

    console.log('💳 Creating Stripe checkout session with metadata:', sessionData);

    // Create Stripe checkout session
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Error al crear sesión de pago');
    }

    const { url, session_id } = await response.json();
    
    if (!url) {
      throw new Error('No se recibió URL de pago de Stripe');
    }

    console.log('✅ Stripe session created (order will be created after payment):', session_id);

    return {
      success: true,
      redirectUrl: url,
      sessionId: session_id,
      paymentMethod: PAYMENT_METHODS.CARD,
      status: PAYMENT_STATUS.PROCESSING
    };

  } catch (error) {
    console.error('❌ Error processing card payment:', error);
    
    const paymentError = new Error(error.message || 'Error al procesar pago con tarjeta');
    paymentError.success = false;
    paymentError.details = error;
    throw paymentError;
  }
};

/**
 * Main payment processing function
 * Routes to appropriate payment method handler
 */
export const processPayment = async (paymentMethod, formData, cartItems, calculateTotal) => {
  console.log('🔄 Processing payment:', paymentMethod);

  if (paymentMethod === PAYMENT_METHODS.CASH) {
    return await processCashPayment(formData, cartItems, calculateTotal);
  } else if (paymentMethod === PAYMENT_METHODS.CARD) {
    return await processCardPayment(formData, cartItems, calculateTotal);
  } else {
    throw new Error(`Método de pago no válido: ${paymentMethod}`);
  }
};

/**
 * Verify Stripe payment after redirect
 * Called by CheckoutSuccess component
 * Creates order in database AFTER payment is confirmed
 */
export const verifyStripePayment = async (sessionId) => {
  try {
    console.log('🔍 Verifying Stripe payment and creating order:', sessionId);

    const response = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ session_id: sessionId })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Error al verificar el pago');
    }

    const result = await response.json();
    
    console.log('✅ Payment verified and order created:', result);

    return {
      success: true,
      orderNumber: result.order_number,
      orderId: result.order_id,
      status: PAYMENT_STATUS.COMPLETED,
      message: result.message,
      // Include order details for display
      customer_name: result.customer_name,
      customer_phone: result.customer_phone,
      customer_email: result.customer_email,
      delivery_address: result.delivery_address,
      items: result.items,
      total_amount: result.total_amount
    };

  } catch (error) {
    console.error('❌ Error verifying payment:', error);
    
    const verificationError = new Error(error.message || 'Error al verificar el pago');
    verificationError.success = false;
    verificationError.details = error;
    throw verificationError;
  }
};
