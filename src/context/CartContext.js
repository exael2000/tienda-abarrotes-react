import React, { createContext, useReducer, useEffect, useCallback } from 'react';

// Actions
const CART_ACTIONS = {
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART'
};

// Función de utilidad para ordenar items del carrito
const sortCartItems = (items) => {
  return [...items].sort((a, b) => {
    // Ordenar por 'order' si existe, sino por 'addedAt', sino por id
    if (a.order && b.order) {
      return a.order - b.order;
    }
    if (a.addedAt && b.addedAt) {
      return a.addedAt - b.addedAt;
    }
    return a.id - b.id;
  });
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
        // Encontrar el siguiente número de orden
        const maxOrder = state.cartItems.length > 0 
          ? Math.max(...state.cartItems.map(item => item.order || 0))
          : 0;
        
        return {
          ...state,
          cartItems: [...state.cartItems, { 
            ...action.payload, 
            order: maxOrder + 1,
            addedAt: Date.now() // timestamp para fallback
          }]
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
      // Asignar números de orden a items que no los tengan y ordenar
      const itemsWithOrder = action.payload.map((item, index) => ({
        ...item,
        order: item.order || (index + 1),
        addedAt: item.addedAt || Date.now()
      }));
      
      return {
        ...state,
        cartItems: sortCartItems(itemsWithOrder)
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
  const addToCart = useCallback((product, quantity = 1) => {
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
  }, []);

  const removeFromCart = useCallback((productId) => {
    console.log('🗑️ Removing from cart:', productId);
    
    // Actualizar estado inmediatamente
    dispatch({
      type: CART_ACTIONS.REMOVE_FROM_CART,
      payload: productId
    });

    console.log('🗑️ State updated, syncing with backend...');

    // Sincronizar con BD si está autenticado y no es invitado (de forma asíncrona sin esperar)
    const token = localStorage.getItem('access_token');
    const isGuest = localStorage.getItem('isGuest') === 'true';
    
    if (token && !isGuest) {
      console.log('🗑️ Syncing removal with database...');
      // Ejecutar la sincronización sin esperar (fire and forget)
      fetch(`/api/cart/remove?product_id=${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then(response => {
        console.log('🗑️ Backend sync response:', response.status);
        return response.json();
      }).then(data => {
        console.log('🗑️ Backend sync result:', data);
      }).catch(error => {
        console.error('❌ Error syncing remove from cart with DB:', error);
      });
    } else {
      console.log('🗑️ Guest user, no backend sync needed');
    }
  }, []);

  const updateQuantity = useCallback((productId, newQuantity) => {
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
  }, []);

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

  const loadPendingCart = useCallback(() => {
    const pendingCart = localStorage.getItem('pendingCart');
    console.log('🔄 Loading pending cart:', pendingCart ? 'Found' : 'Not found');
    
    if (pendingCart) {
      try {
        const cartData = JSON.parse(pendingCart);
        console.log('🔄 Pending cart items:', cartData.length);
        
        // Combinar el carrito pendiente con el actual usando el dispatcher directo
        if (cartData.length > 0) {
          // En lugar de usar state.cartItems, vamos a usar el dispatch directamente
          cartData.forEach((item, index) => {
            dispatch({
              type: CART_ACTIONS.ADD_TO_CART,
              payload: { 
                ...item, 
                quantity: item.quantity,
                order: index + 1000, // Usar un offset alto para evitar conflictos
                addedAt: Date.now() + index
              }
            });
            console.log(`🔄 Added pending item: ${item.name} (quantity: ${item.quantity})`);
          });
        }
        
        // Limpiar el carrito pendiente después de cargarlo
        localStorage.removeItem('pendingCart');
        localStorage.removeItem('wantsToRegister');
        console.log('✅ Pending cart loaded and cleaned');
        return true;
      } catch (error) {
        console.error('Error loading pending cart:', error);
        localStorage.removeItem('pendingCart');
        localStorage.removeItem('wantsToRegister');
      }
    }
    return false;
  }, []); // Sin dependencias para evitar re-renders

  // Funciones de sincronización con la base de datos
  const loadCartFromDB = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    
    console.log('🔄 loadCartFromDB called, token exists:', !!token);
    console.log('🔄 Token value:', token ? token.substring(0, 20) + '...' : 'null');
    
    if (!token) {
      console.log('❌ No token found, cannot load cart from DB');
      return false;
    }

    console.log('🔄 Making request to /api/cart...');

    try {
      const response = await fetch('/api/cart', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('🔄 Cart API response status:', response.status);
      console.log('🔄 Cart API response headers:', response.headers);

      if (response.ok) {
        const cartData = await response.json();
        console.log('🔄 Cart loaded from DB:', cartData.length, 'items');
        console.log('🔄 Cart data details:', cartData);
        dispatch({ type: CART_ACTIONS.LOAD_CART, payload: cartData });
        return true;
      } else {
        const errorText = await response.text();
        console.log('❌ Cart API response not ok:', response.status, response.statusText);
        console.log('❌ Error response body:', errorText);
      }
    } catch (error) {
      console.error('❌ Error loading cart from DB:', error);
      console.error('❌ Error details:', error.message, error.stack);
    }
    return false;
  }, []);

  const syncCartWithDB = useCallback(async () => {
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
        // ✅ NO recargar desde BD, mantener estado local
        console.log('🔄 Cart synced with DB without reloading');
        return true;
      }
    } catch (error) {
      console.error('Error syncing cart with DB:', error);
    }
    return false;
  }, [state.cartItems]);

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

  const combineCartWithGuest = useCallback(async () => {
    console.log('🔄 Starting cart combination process...');
    
    const hasPendingCart = localStorage.getItem('pendingCart');
    console.log('🔄 Pending cart exists:', !!hasPendingCart);
    
    if (hasPendingCart) {
      try {
        const pendingCartData = JSON.parse(hasPendingCart);
        console.log('🔄 Pending cart has', pendingCartData.length, 'items');
        
        // PASO 1: Cargar el carrito del usuario desde la BD
        console.log('🔄 Loading user cart from database first...');
        const userCartLoaded = await loadCartFromDB();
        console.log('🔄 User cart loaded:', userCartLoaded);
        
        // PASO 2: Combinar el carrito de invitado con el carrito del usuario ya cargado
        if (pendingCartData.length > 0) {
          console.log('🔄 Combining guest cart with user cart...');
          
          pendingCartData.forEach((guestItem, index) => {
            // Buscar si el producto ya existe en el carrito del usuario
            const existingItemIndex = state.cartItems.findIndex(item => item.id === guestItem.id);
            
            if (existingItemIndex >= 0) {
              // Si existe, sumar las cantidades
              console.log(`🔄 Product ${guestItem.name} already exists, adding quantities`);
              dispatch({
                type: CART_ACTIONS.UPDATE_QUANTITY,
                payload: { 
                  productId: guestItem.id, 
                  quantity: state.cartItems[existingItemIndex].quantity + guestItem.quantity 
                }
              });
            } else {
              // Si no existe, agregarlo como nuevo item
              console.log(`🔄 Adding new product from guest cart: ${guestItem.name}`);
              dispatch({
                type: CART_ACTIONS.ADD_TO_CART,
                payload: { 
                  ...guestItem, 
                  quantity: guestItem.quantity,
                  order: state.cartItems.length + index + 1,
                  addedAt: Date.now() + index
                }
              });
            }
          });
        }
        
        // PASO 3: Sincronizar el carrito combinado con la BD
        console.log('🔄 Syncing combined cart to database...');
        setTimeout(async () => {
          await syncCartWithDB();
          console.log('✅ Combined cart synced to database');
        }, 500); // Pequeño delay para que el state se actualice
        
        // PASO 4: Limpiar el carrito pendiente
        localStorage.removeItem('pendingCart');
        localStorage.removeItem('wantsToRegister');
        console.log('✅ Cart combination completed successfully');
        
        return true;
      } catch (error) {
        console.error('❌ Error combining carts:', error);
        return false;
      }
    } else {
      console.log('🔄 No pending cart, loading from DB only...');
      await loadCartFromDB();
      return false;
    }
  }, [loadCartFromDB, state.cartItems, syncCartWithDB]);

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