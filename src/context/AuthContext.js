import { createContext, useContext, useEffect, useState } from 'react';
import { showToast } from '../components/ToastProvider';

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
          console.log('🔑 Guest user restored:', guestUser.username);
        } else if (savedToken && savedUser) {
          // Usuario registrado - verificar que el token sea válido
          try {
            const response = await fetch('/api/auth/profile', {
              headers: {
                Authorization: `Bearer ${savedToken}`,
              },
            });

            if (response.ok) {
              const userData = await response.json();
              setUser(userData);
              setToken(savedToken);
              setIsAuthenticated(true);
              console.log('🔑 Authenticated user restored:', userData.username);
            } else {
              // Token inválido, limpiar storage y mostrar como no autenticado
              console.log('🔑 Invalid token, clearing authentication');
              localStorage.removeItem('access_token');
              localStorage.removeItem('user');
              localStorage.removeItem('isGuest');
              setUser(null);
              setToken(null);
              setIsAuthenticated(false);
            }
          } catch (fetchError) {
            console.error('🔑 Error validating token:', fetchError);
            // En caso de error de red, mantener la sesión local por ahora
            // pero en una app real deberías considerar limpiar la sesión
            const userData = JSON.parse(savedUser);
            setUser(userData);
            setToken(savedToken);
            setIsAuthenticated(true);
            console.log('🔑 Network error, maintaining local session');
          }
        } else {
          // No hay datos guardados, usuario no autenticado
          console.log('🔑 No saved authentication found');
          setUser(null);
          setToken(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        // Limpiar datos en caso de error
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        localStorage.removeItem('isGuest');
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (userData, accessToken) => {
    console.log('🔑 Login function called with:', {
      userData,
      accessToken: accessToken ? accessToken.substring(0, 20) + '...' : 'null',
    });

    setUser(userData);
    setToken(accessToken);
    setIsAuthenticated(true);
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.removeItem('isGuest'); // Asegurar que no esté marcado como invitado

    console.log(
      '🔑 Token saved to localStorage:',
      localStorage.getItem('access_token') ? 'YES' : 'NO'
    );
    console.log(
      '🔑 User saved to localStorage:',
      localStorage.getItem('user') ? 'YES' : 'NO'
    );
  };

  const loginAsGuest = guestUser => {
    setUser(guestUser);
    setToken(null);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(guestUser));
    localStorage.setItem('isGuest', 'true');
    localStorage.removeItem('access_token'); // Asegurar que no haya token

    // Limpiar carrito anterior y flags de sesión para invitados
    localStorage.removeItem('cart');
    localStorage.removeItem('cartCombinationDone');
    localStorage.removeItem('userCartLoaded');
    localStorage.removeItem('pendingCart');

    console.log('🔑 Guest login - cart and session flags cleared');
  };

  const logout = async () => {
    try {
      // Llamar al endpoint de logout solo si hay token (usuario registrado)
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // Limpiar estado local siempre
      console.log('🔑 Logging out user:', user?.username || 'unknown');

      // Limpiar todas las notificaciones activas inmediatamente
      showToast.clearAll();

      setUser(null);
      setToken(null);
      setIsAuthenticated(false);

      // Limpiar localStorage completamente
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      localStorage.removeItem('isGuest');

      // Limpiar flags del carrito para permitir carga fresca en próximo login
      localStorage.removeItem('cartCombinationDone');
      localStorage.removeItem('userCartLoaded');
      localStorage.removeItem('cart');

      // NO eliminar pendingCart aquí - puede ser necesario para combinación de carritos
      // localStorage.removeItem('pendingCart'); // Se elimina después de la combinación

      console.log(
        '🔑 Logout completed - all data cleared, notifications dismissed'
      );
    }
  };

  const updateUser = updatedUserData => {
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
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
