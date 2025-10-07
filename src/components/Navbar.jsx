import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    // Siempre redirigir a la página principal después del logout
    navigate('/');
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <span className="store-icon">🏪</span>
          <span className="store-name">Tienda Abarrotes</span>
        </div>

        <div className="navbar-user">
          <div className="user-info" onClick={toggleUserMenu}>
            <div className="user-avatar">
              {user?.isGuest ? '🚪' : user?.first_name?.charAt(0)?.toUpperCase() || '👤'}
            </div>
            <div className="user-details">
              <span className="user-name">
                {user?.isGuest ? 'Usuario Invitado' : `${user?.first_name} ${user?.last_name}`}
              </span>
              <span className="user-username">
                {user?.isGuest ? 'Sesión temporal' : `@${user?.username}`}
              </span>
            </div>
            <span className={`dropdown-arrow ${showUserMenu ? 'open' : ''}`}>
              ▼
            </span>
          </div>

          {showUserMenu && (
            <div className="user-dropdown">
              <div className="user-dropdown-header">
                <strong>
                  {user?.isGuest ? 'Usuario Invitado' : `${user?.first_name} ${user?.last_name}`}
                </strong>
                <small>
                  {user?.isGuest ? 'Sesión temporal sin registro' : user?.email}
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
              <button 
                className="dropdown-item logout-btn"
                onClick={handleLogout}
              >
                <span className="logout-icon">🚪</span>
                {user?.isGuest ? 'Salir' : 'Cerrar Sesión'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Overlay para cerrar el menú al hacer click fuera */}
      {showUserMenu && (
        <div 
          className="dropdown-overlay" 
          onClick={() => setShowUserMenu(false)}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;