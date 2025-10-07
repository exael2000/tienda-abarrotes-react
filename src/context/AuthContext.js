import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar si hay un token guardado al cargar la aplicación
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem('access_token');
        const savedUser = localStorage.getItem('user');
        const isGuest = localStorage.getItem('isGuest') === 'true';
        
        if (isGuest && savedUser) {
          // Usuario invitado
          const guestUser = JSON.parse(savedUser);
          setUser(guestUser);
          setToken(null);
          setIsAuthenticated(true);
        } else if (savedToken && savedUser) {
          // Usuario registrado - verificar que el token sea válido
          const response = await fetch('/api/auth/profile', {
            headers: {
              'Authorization': `Bearer ${savedToken}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setToken(savedToken);
            setIsAuthenticated(true);
          } else {
            // Token inválido, limpiar storage
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        // Limpiar datos en caso de error
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (userData, accessToken) => {
    setUser(userData);
    setToken(accessToken);
    setIsAuthenticated(true);
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.removeItem('isGuest'); // Asegurar que no esté marcado como invitado
  };

  const loginAsGuest = (guestUser) => {
    setUser(guestUser);
    setToken(null);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(guestUser));
    localStorage.setItem('isGuest', 'true');
    localStorage.removeItem('access_token'); // Asegurar que no haya token
  };

  const logout = async () => {
    try {
      // Llamar al endpoint de logout solo si hay token (usuario registrado)
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // Limpiar estado local siempre
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      localStorage.removeItem('isGuest');
    }
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    loginAsGuest,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;