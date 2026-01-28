// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation (basic - adjust for your country)
const PHONE_REGEX = /^[0-9]{10}$/;

/**
 * Validates customer information form
 * @param {Object} formData - Form data to validate
 * @param {boolean} isGuest - Whether the user is a guest
 * @returns {Object} Object with isValid boolean and errors object
 */
export function validateCheckoutForm(formData, isGuest = false) {
  const errors = {};

  // Validate customer name
  if (!formData.customerName || formData.customerName.trim() === '') {
    errors.customerName = 'El nombre es requerido';
  } else if (formData.customerName.trim().length < 3) {
    errors.customerName = 'El nombre debe tener al menos 3 caracteres';
  }

  // Validate phone
  if (!formData.customerPhone || formData.customerPhone.trim() === '') {
    errors.customerPhone = 'El teléfono es requerido';
  } else if (!PHONE_REGEX.test(formData.customerPhone.replace(/\s/g, ''))) {
    errors.customerPhone = 'Ingresa un teléfono válido de 10 dígitos';
  }

  // Validate email (optional for guests)
  if (!isGuest) {
    if (!formData.customerEmail || formData.customerEmail.trim() === '') {
      errors.customerEmail = 'El email es requerido';
    } else if (!EMAIL_REGEX.test(formData.customerEmail)) {
      errors.customerEmail = 'Ingresa un email válido';
    }
  } else if (formData.customerEmail && !EMAIL_REGEX.test(formData.customerEmail)) {
    errors.customerEmail = 'Ingresa un email válido';
  }

  // Validate delivery address
  if (!formData.deliveryAddress || formData.deliveryAddress.trim() === '') {
    errors.deliveryAddress = 'La dirección de entrega es requerida';
  } else if (formData.deliveryAddress.trim().length < 10) {
    errors.deliveryAddress = 'La dirección debe ser más específica';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validates payment method selection
 * @param {string} paymentMethod - Selected payment method
 * @returns {Object} Object with isValid boolean and error message
 */
export function validatePaymentMethod(paymentMethod) {
  const validMethods = ['cash', 'card'];
  
  if (!paymentMethod || !validMethods.includes(paymentMethod)) {
    return {
      isValid: false,
      error: 'Selecciona un método de pago válido'
    };
  }

  return {
    isValid: true,
    error: null
  };
}

/**
 * Validates cart has items
 * @param {Array} cartItems - Cart items array
 * @returns {Object} Object with isValid boolean and error message
 */
export function validateCart(cartItems) {
  if (!cartItems || cartItems.length === 0) {
    return {
      isValid: false,
      error: 'El carrito está vacío'
    };
  }

  return {
    isValid: true,
    error: null
  };
}

/**
 * Formats phone number for display
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
export function formatPhoneNumber(phone) {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
}

/**
 * Sanitizes form data before submission
 * @param {Object} formData - Form data to sanitize
 * @returns {Object} Sanitized form data
 */
export function sanitizeFormData(formData) {
  return {
    customerName: formData.customerName.trim(),
    customerPhone: formData.customerPhone.replace(/\s/g, ''),
    customerEmail: formData.customerEmail.trim().toLowerCase(),
    deliveryAddress: formData.deliveryAddress.trim(),
    orderNotes: formData.orderNotes ? formData.orderNotes.trim() : '',
    paymentMethod: formData.paymentMethod
  };
}
