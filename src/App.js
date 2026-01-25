import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, CartContext } from './context/CartContext';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import Login from './components/Login';
import Register from './components/Register';
import Navbar from './components/Navbar';
import CheckoutSuccess from './components/CheckoutSuccess';
import CheckoutCancel from './components/CheckoutCancel';
import { ToastProvider } from './components/ToastProvider';
import './App.css';
import './styles/theme.css';
import './styles/global.css';
import './styles/ecommerce.css';
import './styles/critical.css';

// Componente para redirección única después del login
const PostLoginRedirect = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const hasRedirected = React.useRef(false);

  useEffect(() => {
    // Solo redirigir una vez cuando se autentica, pero con un pequeño delay
    // para permitir que el carrito se cargue primero
    // NO redirigir si está en páginas de checkout, carrito, o si ya está en la página principal
    const isCheckoutPage = location.pathname.startsWith('/checkout/');
    const isHomePage = location.pathname === '/';
    const isCartPage = location.pathname === '/cart';
    
    if (isAuthenticated && !hasRedirected.current && !isCheckoutPage && !isHomePage && !isCartPage) {
      hasRedirected.current = true;
      setTimeout(() => {
        console.log('🔄 User just logged in, redirecting to product list...');
        navigate('/', { replace: true });
      }, 100); // Pequeño delay para evitar conflictos con carga de carrito
    }
    
    // Reset cuando se desautentica
    if (!isAuthenticated) {
      hasRedirected.current = false;
    }
  }, [isAuthenticated, navigate, location.pathname]);

  return null;
};

// Componente para manejar el logout y navegación
const LogoutNavigationHandler = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Si el usuario no está autenticado y no está en la página principal, redirigir
    if (!isAuthenticated && location.pathname !== '/') {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate, location.pathname]);
  
  return null;
};

// Componente para cargar el carrito pendiente después del login
const PendingCartLoader = () => {
  const { user, isAuthenticated } = useAuth();
  const { combineCartWithGuest, loadCartFromDB } = useContext(CartContext);
  
  useEffect(() => {
    if (!isAuthenticated || !user) {
      console.log('🔑 User not authenticated, skipping cart operations');
      return;
    }

    const isGuest = localStorage.getItem('isGuest') === 'true';
    const hasPendingCart = localStorage.getItem('pendingCart');
    const hasLoadedUserCart = localStorage.getItem('userCartLoaded') === 'true';
    
    console.log('🔑 PendingCartLoader - User authenticated:', {
      username: user.username,
      isGuest,
      hasPendingCart: !!hasPendingCart,
      hasLoadedUserCart
    });

    if (isGuest) {
      // Usuario invitado - no hacer nada especial con el carrito
      console.log('🔑 Guest user - no cart operations needed');
      return;
    }

    if (hasPendingCart && !hasLoadedUserCart) {
      // Usuario que tenía carrito como invitado y ahora se loguea
      console.log('🔑 Found pending cart, combining with user cart...');
      
      if (combineCartWithGuest) {
        combineCartWithGuest()
          .then((success) => {
            console.log('🔑 Cart combination result:', success);
            localStorage.setItem('userCartLoaded', 'true');
          })
          .catch((error) => {
            console.error('🔑 Error combining carts:', error);
          });
      }
    } else if (!hasLoadedUserCart) {
      // Login normal sin carrito pendiente - cargar carrito del usuario
      console.log('🔑 Loading user cart from database...');
      
      if (loadCartFromDB) {
        loadCartFromDB()
          .then(() => {
            console.log('🔑 User cart loaded from database');
            localStorage.setItem('userCartLoaded', 'true');
          })
          .catch((error) => {
            console.error('🔑 Error loading user cart:', error);
          });
      }
    } else {
      console.log('🔑 Cart already loaded for this session');
    }
  }, [isAuthenticated, user, combineCartWithGuest, loadCartFromDB]);
  
  return null;
};

// Componente de loading
const LoadingScreen = () => (
  <div className="loading-screen">
    <div className="loading-spinner-large"></div>
    <p>Cargando...</p>
  </div>
);

// Componente principal que maneja la autenticación
const AppContent = () => {
  const { isAuthenticated, isLoading, login, loginAsGuest } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  // Verificar si el usuario viene del carrito y quiere registrarse
  useEffect(() => {
    // Solo ejecutar cuando NO esté autenticado (para evitar ejecutar cuando ya está logueado)
    if (!isAuthenticated) {
      const wantsToRegister = localStorage.getItem('wantsToRegister');
      console.log('🔑 Checking wantsToRegister flag:', wantsToRegister);
      
      if (wantsToRegister === 'true') {
        console.log('🔑 User wants to register - showing register form');
        setShowRegister(true);
        localStorage.removeItem('wantsToRegister'); // Limpiar después de usar
      } else if (wantsToRegister === 'false') {
        console.log('🔑 User wants to login - showing login form');
        setShowRegister(false);
        localStorage.removeItem('wantsToRegister'); // Limpiar después de usar
      }
    }
  }, [isAuthenticated]); // Ejecutar cada vez que cambie isAuthenticated

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return (
      <div className="auth-container">
        {showRegister ? (
          <Register 
            onRegister={login}
            onSwitchToLogin={() => setShowRegister(false)}
            onGuestAccess={loginAsGuest}
          />
        ) : (
          <Login 
            onLogin={login}
            onSwitchToRegister={() => setShowRegister(true)}
            onGuestAccess={loginAsGuest}
          />
        )}
      </div>
    );
  }

  // Usuario autenticado - mostrar la aplicación principal
  return (
    <CartProvider>
      <PendingCartLoader />
      <Router>
        <PostLoginRedirect />
        <LogoutNavigationHandler />
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
            <Route path="/checkout/cancel" element={<CheckoutCancel />} />
          </Routes>
        </div>
        <ToastProvider />
      </Router>
    </CartProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
