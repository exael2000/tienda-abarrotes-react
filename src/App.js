import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, CartContext } from './context/CartContext';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import Login from './components/Login';
import Register from './components/Register';
import Navbar from './components/Navbar';
import './App.css';

// Componente para manejar redirección automática al hacer logout
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
    // Solo cargar si está autenticado y no es invitado
    if (isAuthenticated && user && !localStorage.getItem('isGuest')) {
      if (combineCartWithGuest) {
        combineCartWithGuest();
      } else if (loadCartFromDB) {
        // Fallback: solo cargar desde BD si no hay función de combinación
        loadCartFromDB();
      }
    }
  }, [isAuthenticated, user, combineCartWithGuest, loadCartFromDB]);
  
  return null; // Este componente no renderiza nada
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
    const wantsToRegister = localStorage.getItem('wantsToRegister');
    if (wantsToRegister === 'true') {
      setShowRegister(true);
      localStorage.removeItem('wantsToRegister'); // Limpiar después de usar
    } else if (wantsToRegister === 'false') {
      setShowRegister(false);
      localStorage.removeItem('wantsToRegister'); // Limpiar después de usar
    }
  }, []);

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
        <LogoutNavigationHandler />
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/cart" element={<Cart />} />
          </Routes>
        </div>
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
