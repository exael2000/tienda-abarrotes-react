import React, { useState, useEffect, useCallback } from 'react';
import './Register.css';

const Register = ({ onRegister, onSwitchToLogin, onGuestAccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estados para validaciones en tiempo real
  const [fieldErrors, setFieldErrors] = useState({});
  const [fieldTouched, setFieldTouched] = useState({});

  // Función para validar un campo específico
  const validateField = useCallback((name, value, allData = formData) => {
    switch (name) {
      case 'username':
        if (!value) return '';
        if (value.length < 3) return 'El usuario debe tener al menos 3 caracteres';
        if (value.length > 20) return 'El usuario no puede tener más de 20 caracteres';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Solo se permiten letras, números y guiones bajos';
        return '';
      
      case 'email':
        if (!value) return '';
        if (!value.includes('@')) return 'Debe contener un @';
        if (!value.includes('.')) return 'Formato de email inválido';
        if (value.length < 5) return 'Email muy corto';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Formato de email inválido';
        return '';
      
      case 'password':
        if (!value) return '';
        if (value.length < 4) return 'Mínimo 4 caracteres';
        if (value.length > 50) return 'Máximo 50 caracteres';
        return '';
      
      case 'confirmPassword':
        if (!value) return '';
        if (value !== allData.password) return 'Las contraseñas no coinciden';
        return '';
      
      case 'first_name':
        if (!value) return '';
        if (value.length < 2) return 'Mínimo 2 caracteres';
        if (value.length > 30) return 'Máximo 30 caracteres';
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return 'Solo se permiten letras';
        return '';
      
      case 'last_name':
        if (!value) return '';
        if (value.length < 2) return 'Mínimo 2 caracteres';
        if (value.length > 30) return 'Máximo 30 caracteres';
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return 'Solo se permiten letras';
        return '';
      
      default:
        return '';
    }
  }, [formData]);

  // Validar todos los campos cuando cambie formData
  useEffect(() => {
    const newFieldErrors = {};
    Object.keys(formData).forEach(key => {
      if (fieldTouched[key]) {
        const error = validateField(key, formData[key], formData);
        if (error) {
          newFieldErrors[key] = error;
        }
      }
    });
    setFieldErrors(newFieldErrors);
  }, [formData, fieldTouched, validateField]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Marcar el campo como tocado
    setFieldTouched({
      ...fieldTouched,
      [name]: true
    });
    
    // Limpiar error general cuando el usuario empiece a escribir
    if (error) setError('');
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setFieldTouched({
      ...fieldTouched,
      [name]: true
    });
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
      onRegister(guestUser, null);
    }
  };

  const validateForm = () => {
    // Marcar todos los campos como tocados
    const allTouched = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setFieldTouched(allTouched);

    // Validar todos los campos
    const errors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key], formData);
      if (error) {
        errors[key] = error;
      }
    });

    // Verificar campos requeridos
    if (!formData.username) errors.username = 'El usuario es requerido';
    if (!formData.email) errors.email = 'El email es requerido';
    if (!formData.password) errors.password = 'La contraseña es requerida';
    if (!formData.confirmPassword) errors.confirmPassword = 'Confirma tu contraseña';
    if (!formData.first_name) errors.first_name = 'El nombre es requerido';
    if (!formData.last_name) errors.last_name = 'El apellido es requerido';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Guardar token en localStorage
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Llamar callback de registro exitoso
        onRegister(data.user, data.access_token);
      } else {
        setError(data.error || 'Error al registrar usuario');
      }
    } catch (error) {
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>🏪 Tienda Abarrotes</h1>
          <h2>Crear Cuenta</h2>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">Nombre</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Tu nombre"
                className={fieldErrors.first_name ? 'error' : ''}
                required
              />
              {fieldErrors.first_name && (
                <div className="field-error">
                  <span className="error-icon">⚠️</span>
                  {fieldErrors.first_name}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="last_name">Apellido</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Tu apellido"
                className={fieldErrors.last_name ? 'error' : ''}
                required
              />
              {fieldErrors.last_name && (
                <div className="field-error">
                  <span className="error-icon">⚠️</span>
                  {fieldErrors.last_name}
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Elige un nombre de usuario"
              className={fieldErrors.username ? 'error' : ''}
              required
            />
            {fieldErrors.username && (
              <div className="field-error">
                <span className="error-icon">⚠️</span>
                {fieldErrors.username}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="tu@email.com"
              className={fieldErrors.email ? 'error' : ''}
              required
            />
            {fieldErrors.email && (
              <div className="field-error">
                <span className="error-icon">⚠️</span>
                {fieldErrors.email}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Crea una contraseña"
              className={fieldErrors.password ? 'error' : ''}
              required
            />
            {fieldErrors.password && (
              <div className="field-error">
                <span className="error-icon">⚠️</span>
                {fieldErrors.password}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Repite tu contraseña"
              className={fieldErrors.confirmPassword ? 'error' : ''}
              required
            />
            {fieldErrors.confirmPassword && (
              <div className="field-error">
                <span className="error-icon">⚠️</span>
                {fieldErrors.confirmPassword}
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="register-btn"
            disabled={isLoading || Object.keys(fieldErrors).length > 0}
          >
            {isLoading ? (
              <>
                <div className="loading-spinner"></div>
                Creando cuenta...
              </>
            ) : (
              'Crear Cuenta'
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

        <div className="register-footer">
          <p>¿Ya tienes una cuenta?</p>
          <button onClick={onSwitchToLogin} className="switch-btn">
            Iniciar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;