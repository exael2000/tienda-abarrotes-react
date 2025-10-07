import React, { createContext, useReducer, useEffect } from 'react';

// Actions
const CART_ACTIONS = {
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART'
};

// Reducer
function cartReducer(state, action) {
  switch (action.type) {
    case CART_ACTIONS.ADD_TO_CART: {
      const existingItem = state.cartItems.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        return {
          ...state,
          cartItems: state.cartItems.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: Math.min(item.quantity + action.payload.quantity, item.stock) }
              : item
          )
        };
      } else {
        return {
          ...state,
          cartItems: [...state.cartItems, { ...action.payload }]
        };
      }
    }
    
    case CART_ACTIONS.REMOVE_FROM_CART:
      return {
        ...state,
        cartItems: state.cartItems.filter(item => item.id !== action.payload)
      };
    
    case CART_ACTIONS.UPDATE_QUANTITY:
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          cartItems: state.cartItems.filter(item => item.id !== action.payload.id)
        };
      }
      
      return {
        ...state,
        cartItems: state.cartItems.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: Math.min(action.payload.quantity, item.stock) }
            : item
        )
      };
    
    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        cartItems: []
      };
    
    case CART_ACTIONS.LOAD_CART:
      return {
        ...state,
        cartItems: action.payload
      };
    
    default:
      return state;
  }
}

// Estado inicial
const initialState = {
  cartItems: []
};

// Crear contexto
export const CartContext = createContext();

// Provider del contexto
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Cargar carrito desde localStorage al inicializar
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        dispatch({ type: CART_ACTIONS.LOAD_CART, payload: cartData });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.cartItems));
  }, [state.cartItems]);

  // Funciones del carrito
  const addToCart = (product, quantity = 1) => {
    if (product.stock <= 0) {
      alert('Producto sin stock disponible');
      return;
    }
    
    // Actualizar estado inmediatamente
    dispatch({
      type: CART_ACTIONS.ADD_TO_CART,
      payload: { ...product, quantity }
    });

    // Sincronizar con BD si está autenticado y no es invitado (de forma asíncrona sin esperar)
    const token = localStorage.getItem('access_token');
    const isGuest = localStorage.getItem('isGuest') === 'true';
    
    if (token && !isGuest) {
      // Ejecutar la sincronización sin esperar (fire and forget)
      fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          product_id: product.id, 
          quantity: quantity 
        })
      }).catch(error => {
        console.error('Error syncing add to cart with DB:', error);
      });
    }
  };

  const removeFromCart = (productId) => {
    // Actualizar estado inmediatamente
    dispatch({
      type: CART_ACTIONS.REMOVE_FROM_CART,
      payload: productId
    });

    // Sincronizar con BD si está autenticado y no es invitado (de forma asíncrona sin esperar)
    const token = localStorage.getItem('access_token');
    const isGuest = localStorage.getItem('isGuest') === 'true';
    
    if (token && !isGuest) {
      // Ejecutar la sincronización sin esperar (fire and forget)
      fetch(`/api/cart/remove?product_id=${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).catch(error => {
        console.error('Error syncing remove from cart with DB:', error);
      });
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    // Actualizar estado inmediatamente
    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { id: productId, quantity: newQuantity }
    });

    // Sincronizar con BD si está autenticado y no es invitado (de forma asíncrona sin esperar)
    const token = localStorage.getItem('access_token');
    const isGuest = localStorage.getItem('isGuest') === 'true';
    
    if (token && !isGuest) {
      // Ejecutar la sincronización sin esperar (fire and forget)
      fetch('/api/cart/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          product_id: productId, 
          quantity: newQuantity 
        })
      }).catch(error => {
        console.error('Error syncing update quantity with DB:', error);
      });
    }
  };

  const clearCart = () => {
    if (window.confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      dispatch({ type: CART_ACTIONS.CLEAR_CART });
    }
  };

  const getCartTotal = () => {
    return state.cartItems.reduce((total, item) => {
      return total + (item.price_cents * item.quantity);
    }, 0);
  };

  const getCartItemsCount = () => {
    return state.cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const isInCart = (productId) => {
    return state.cartItems.some(item => item.id === productId);
  };

  const getItemQuantity = (productId) => {
    const item = state.cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  const loadPendingCart = () => {
    const pendingCart = localStorage.getItem('pendingCart');
    if (pendingCart) {
      try {
        const cartData = JSON.parse(pendingCart);
        // Combinar el carrito pendiente con el actual
        if (cartData.length > 0) {
          cartData.forEach(item => {
            addToCart(item, item.quantity);
          });
        }
        // Limpiar el carrito pendiente después de cargarlo
        localStorage.removeItem('pendingCart');
        return true;
      } catch (error) {
        console.error('Error loading pending cart:', error);
        localStorage.removeItem('pendingCart');
      }
    }
    return false;
  };

  // Funciones de sincronización con la base de datos
  const loadCartFromDB = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return false;

    try {
      const response = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const cartData = await response.json();
        dispatch({ type: CART_ACTIONS.LOAD_CART, payload: cartData });
        return true;
      }
    } catch (error) {
      console.error('Error loading cart from DB:', error);
    }
    return false;
  };

  const syncCartWithDB = async () => {
    const token = localStorage.getItem('access_token');
    if (!token || state.cartItems.length === 0) return false;

    try {
      const response = await fetch('/api/cart/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cart_items: state.cartItems })
      });

      if (response.ok) {
        // Después de sincronizar, cargar el carrito actualizado desde la BD
        await loadCartFromDB();
        return true;
      }
    } catch (error) {
      console.error('Error syncing cart with DB:', error);
    }
    return false;
  };

  const saveCartToDB = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return false;

    try {
      // Sincronizar todos los items actuales del carrito
      await syncCartWithDB();
      return true;
    } catch (error) {
      console.error('Error saving cart to DB:', error);
    }
    return false;
  };

  const combineCartWithGuest = async () => {
    // Primero cargar desde BD si el usuario ya tenía un carrito
    await loadCartFromDB();
    
    // Luego cargar el carrito pendiente (del usuario invitado) si existe
    const hasPendingCart = loadPendingCart();
    
    return hasPendingCart;
  };

  const value = {
    cartItems: state.cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    isInCart,
    getItemQuantity,
    loadPendingCart,
    loadCartFromDB,
    syncCartWithDB,
    saveCartToDB,
    combineCartWithGuest
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}