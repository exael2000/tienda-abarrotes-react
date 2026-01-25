import axios from 'axios';

// URLs de los servicios - detectar si estamos en desarrollo o producción
const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';

// Configurar URL específicamente para PythonAnywhere
let API_URL;
if (isDevelopment) {
  // En desarrollo, usar el backend proxy para consistencia
  API_URL = 'http://localhost:5000/api';
} else if (window.location.hostname.includes('pythonanywhere.com')) {
  // Para PythonAnywhere, usar la URL completa con HTTPS
  API_URL = `https://${window.location.hostname}/api`;
} else {
  API_URL = '/api';
}

// Configuración de axios con timeout
const api = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas de error de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.reload(); // Recargar para mostrar login
    }
    return Promise.reject(error);
  }
);

// Funciones para productos
export const getProducts = (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.supplier) params.append('supplier', filters.supplier);
  if (filters.brand) params.append('brand', filters.brand);
  if (filters.min_price) params.append('min_price', filters.min_price);
  if (filters.max_price) params.append('max_price', filters.max_price);
  
  const url = `${API_URL}/products${params.toString() ? `?${params.toString()}` : ''}`;
  return api.get(url);
};

export const getProduct = (productId) => api.get(`${API_URL}/products/${productId}`);

export const getSuppliers = () => api.get(`${API_URL}/suppliers`);

export const getBrands = () => api.get(`${API_URL}/brands`);

export const createOrder = async (orderData) => {
  try {
    const response = await api.post(`${API_URL}/orders`, orderData);
    return response.data;
  } catch (error) {
    console.error('Error en createOrder API:', error);
    if (error.response?.data) {
      console.error('Error response data:', error.response.data);
    }
    throw error;
  }
};

// Exportar el cliente api para uso directo
export { api };