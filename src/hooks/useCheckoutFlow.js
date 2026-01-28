import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export function useCheckoutFlow(cartItems) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [orderNumber, setOrderNumber] = useState(null);
  const [orderComplete, setOrderComplete] = useState(false);

  // Get user full name
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

  // Load saved user data from localStorage
  const loadSavedUserData = () => {
    if (user?.id) {
      const savedData = localStorage.getItem(`userCheckoutData_${user.id}`);
      if (savedData) {
        return JSON.parse(savedData);
      }
    }
    return {};
  };

  // Initialize form data
  const [formData, setFormData] = useState(() => {
    const savedData = loadSavedUserData();
    
    return {
      customerName: savedData.customerName || getUserFullName(),
      customerPhone: savedData.customerPhone || user?.phone || '',
      customerEmail: savedData.customerEmail || user?.email || '',
      deliveryAddress: savedData.deliveryAddress || user?.address || '',
      orderNotes: savedData.orderNotes || '',
      paymentMethod: savedData.paymentMethod || 'cash'
    };
  });

  const [errors, setErrors] = useState({});

  // Save user data to localStorage when it changes
  useEffect(() => {
    if (user?.id && formData.customerName) {
      const dataToSave = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        deliveryAddress: formData.deliveryAddress,
        orderNotes: formData.orderNotes,
        paymentMethod: formData.paymentMethod
      };
      localStorage.setItem(`userCheckoutData_${user.id}`, JSON.stringify(dataToSave));
    }
  }, [formData, user?.id]);

  // Calculate total
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const itemPrice = item.price_cents ? item.price_cents / 100 : (item.price || 0);
      return total + (itemPrice * item.quantity);
    }, 0);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle payment method change
  const handlePaymentMethodChange = (e) => {
    setFormData(prev => ({
      ...prev,
      paymentMethod: e.target.value
    }));
  };

  // Navigate between steps
  const goToStep = (step) => {
    setCurrentStep(step);
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const previousStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  return {
    currentStep,
    formData,
    errors,
    orderNumber,
    orderComplete,
    setFormData,
    setErrors,
    setOrderNumber,
    setOrderComplete,
    handleInputChange,
    handlePaymentMethodChange,
    goToStep,
    nextStep,
    previousStep,
    calculateTotal,
    getUserFullName,
    isGuest: localStorage.getItem('isGuest') === 'true'
  };
}
