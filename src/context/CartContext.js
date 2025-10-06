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
    
    dispatch({
      type: CART_ACTIONS.ADD_TO_CART,
      payload: { ...product, quantity }
    });
  };

  const removeFromCart = (productId) => {
    dispatch({
      type: CART_ACTIONS.REMOVE_FROM_CART,
      payload: productId
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { id: productId, quantity: newQuantity }
    });
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

  const value = {
    cartItems: state.cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    isInCart,
    getItemQuantity
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}