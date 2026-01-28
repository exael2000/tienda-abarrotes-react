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
    console.log('🔑 Guest access initiated');
    
    // Crear un usuario invitado temporal
    const guestUser = {
      id: 'guest',
      username: 'Invitado',
      email: 'guest@tienda.com',
      first_name: 'Usuario',
      last_name: 'Invitado',
      isGuest: true
    };
    
    console.log('🔑 Created guest user:', guestUser);
    
    // Llamar callback de acceso como invitado
    if (onGuestAccess) {
      onGuestAccess(guestUser);
    } else {
      onLogin(guestUser, null);
    }
    
    console.log('🔑 Guest access completed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validaciones básicas
    if (!formData.username.trim()) {
      setError('Por favor ingresa tu usuario');
      setIsLoading(false);
      return;
    }

    if (!formData.password) {
      setError('Por favor ingresa tu contraseña');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔑 Attempting login for user:', formData.username);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('🔑 Login successful for:', data.user.username);
        
        // Llamar callback de login exitoso
        onLogin(data.user, data.access_token);
        
        // Limpiar formulario
        setFormData({ username: '', password: '' });
      } else {
        console.log('🔑 Login failed:', data.error);
        setError(data.error || 'Error en el login');
      }
    } catch (error) {
      console.error('🔑 Network error during login:', error);
      setError('Error de conexión. Verifica tu internet e inténtalo de nuevo.');
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
            disabled={isLoading}
          >
            🚪 Acceder como Invitado
          </button>
          <p className="guest-description">
            Navega y arma tu carrito sin necesidad de registrarte.
            <br /><small>Podrás registrarte más tarde para finalizar tu compra.</small>
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