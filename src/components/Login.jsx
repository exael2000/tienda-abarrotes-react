import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin, onSwitchToRegister, onGuestAccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('');
  };

  const handleGuestAccess = () => {
    // Crear un usuario invitado temporal
    const guestUser = {
      id: 'guest',
      username: 'Invitado',
      email: 'guest@tienda.com',
      first_name: 'Usuario',
      last_name: 'Invitado',
      isGuest: true
    };
    
    // Guardar información del invitado
    localStorage.setItem('user', JSON.stringify(guestUser));
    localStorage.setItem('isGuest', 'true');
    
    // Llamar callback de acceso como invitado
    if (onGuestAccess) {
      onGuestAccess(guestUser);
    } else {
      onLogin(guestUser, null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // Guardar token en localStorage
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Llamar callback de login exitoso
        onLogin(data.user, data.access_token);
      } else {
        setError(data.error || 'Error en el login');
      }
    } catch (error) {
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🏪 Tienda Abarrotes</h1>
          <h2>Iniciar Sesión</h2>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Ingresa tu usuario"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>

          <button 
            type="submit" 
            className="login-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Iniciando sesión...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        {/* Botón de acceso como invitado */}
        <div className="guest-access">
          <button 
            type="button" 
            className="guest-btn"
            onClick={handleGuestAccess}
          >
            🚪 Acceder como Invitado
          </button>
          <p className="guest-description">
            Navega y arma tu carrito sin necesidad de registrarte
          </p>
        </div>

        <div className="login-footer">
          <p>¿No tienes cuenta?</p>
          <button 
            type="button" 
            className="switch-btn"
            onClick={onSwitchToRegister}
          >
            Registrarse
          </button>
        </div>

        <div className="demo-credentials">
          <p><strong>Credenciales de demo:</strong></p>
          <p>Usuario: <code>exael</code></p>
          <p>Contraseña: <code>exael</code></p>
        </div>
      </div>
    </div>
  );
};

export default Login;