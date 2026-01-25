import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { showToast } from './ToastProvider';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    const userName = user?.username || user?.first_name || 'Usuario';
    console.log('🔑 Logout initiated for:', userName);
    
    try {
      showToast.success(`Hasta luego, ${userName}!`, { icon: '👋', duration: 3000 });
      await logout();
      setShowUserMenu(false);
      // Siempre redirigir a la página principal después del logout
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
      showToast.error('Error al cerrar sesión', { icon: '❌' });
    }
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  return (
    <motion.nav 
      className="navbar"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      <div className="navbar-container">
        <motion.div 
          className="navbar-brand"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.span 
            className="store-icon"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            🏪
          </motion.span>
          <span className="store-name gradient-text">Tienda Abarrotes</span>
        </motion.div>

        <div className="navbar-actions">
          <ThemeToggle />
          
          <div className="navbar-user">
            <motion.div 
              className="user-info" 
              onClick={toggleUserMenu}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div 
                className="user-avatar"
                whileHover={{ rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {user?.isGuest ? 
                  '🚪' : 
                  (user?.first_name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || '👤')
                }
              </motion.div>
              <div className="user-details">
                <span className="user-name">
                  {user?.isGuest ? 
                    'Usuario Invitado' : 
                    (user?.first_name && user?.last_name ? 
                      `${user.first_name} ${user.last_name}` : 
                      user?.username || 'Usuario'
                    )
                  }
                </span>
                <span className="user-username">
                  {user?.isGuest ? 
                    'Sesión temporal' : 
                    (user?.email || `@${user?.username || 'usuario'}`)
                  }
                </span>
              </div>
              <motion.span 
                className="dropdown-arrow"
                animate={{ rotate: showUserMenu ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                ▼
              </motion.span>
            </motion.div>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div 
                  className="user-dropdown glass-card"
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
              <div className="user-dropdown-header">
                <strong>
                  {user?.isGuest ? 
                    'Usuario Invitado' : 
                    (user?.first_name && user?.last_name ? 
                      `${user.first_name} ${user.last_name}` : 
                      user?.username || 'Usuario'
                    )
                  }
                </strong>
                <small>
                  {user?.isGuest ? 
                    'Sesión temporal sin registro' : 
                    (user?.email || 'Sin email registrado')
                  }
                </small>
              </div>
              {user?.isGuest && (
                <>
                  <div className="user-dropdown-divider"></div>
                  <div className="guest-info">
                    <span className="guest-icon">ℹ️</span>
                    <span>Para finalizar compras, considera registrarte</span>
                  </div>
                </>
              )}
              <div className="user-dropdown-divider"></div>
              <motion.button 
                className="dropdown-item logout-btn"
                onClick={handleLogout}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="logout-icon">🚪</span>
                {user?.isGuest ? 'Salir' : 'Cerrar Sesión'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
        </div>
      </div>

      {/* Overlay para cerrar el menú al hacer click fuera */}
      <AnimatePresence>
        {showUserMenu && (
          <motion.div 
            className="dropdown-overlay" 
            onClick={() => setShowUserMenu(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;