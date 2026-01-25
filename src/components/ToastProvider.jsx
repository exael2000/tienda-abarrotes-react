import React from 'react';
import toast, { Toaster } from 'react-hot-toast';
import './ToastProvider.css';

export const ToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Configuración global
        duration: 4000,
        style: {
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-lg)',
          fontSize: '14px',
          padding: '12px 16px',
        },
        // Configuraciones específicas
        success: {
          iconTheme: {
            primary: 'var(--secondary-color)',
            secondary: 'var(--bg-card)',
          },
          style: {
            border: '1px solid var(--secondary-color)',
          },
        },
        error: {
          iconTheme: {
            primary: 'var(--danger-color)',
            secondary: 'var(--bg-card)',
          },
          style: {
            border: '1px solid var(--danger-color)',
          },
        },
        loading: {
          iconTheme: {
            primary: 'var(--primary-color)',
            secondary: 'var(--bg-card)',
          },
        },
      }}
      limit={3}
    />
  );
};

// Funciones helper para toast
export const showToast = {
  success: (message, options = {}) => toast.success(message, {
    duration: 3000,
    ...options
  }),
  
  error: (message, options = {}) => toast.error(message, {
    duration: 5000,
    ...options
  }),
  
  loading: (message) => toast.loading(message),
  
  promise: (promise, messages) => toast.promise(promise, {
    loading: messages.loading || 'Cargando...',
    success: messages.success || '¡Éxito!',
    error: messages.error || 'Error',
  }),
  
  custom: (message, icon = '🔔', options = {}) => toast(message, {
    icon: icon,
    duration: 4000,
    ...options
  }),
  
  addToCart: (productName) => toast.success(
    `${productName} agregado al carrito`,
    {
      icon: '🛒',
      duration: 2000,
      style: {
        background: 'var(--secondary-color)',
        color: 'white',
        border: 'none',
      }
    }
  ),
  
  removeFromCart: (productName) => toast(
    `${productName} eliminado del carrito`,
    {
      icon: '🗑️',
      duration: 2000,
      style: {
        background: 'var(--accent-color)',
        color: 'white',
        border: 'none',
      }
    }
  ),
  
  orderSuccess: (orderNumber) => toast.success(
    `¡Pedido #${orderNumber} creado exitosamente!`,
    {
      icon: '🎉',
      duration: 6000,
      style: {
        background: 'var(--secondary-color)',
        color: 'white',
        border: 'none',
        fontSize: '16px',
        padding: '16px 20px',
      }
    }
  )
};