import axios from 'axios';

// URLs de los servicios
const API_URL = 'http://localhost:5000/api';

// Configuración de axios con timeout
const api = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

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

// Aquí puedes agregar más funciones para carrito, checkout, etc.
export const addToCart = (productId, quantity = 1) => {
  // Por ahora devuelve una promesa simulada
  return Promise.resolve({ success: true, productId, quantity });
};

export const getCart = () => {
  // Por ahora devuelve un carrito vacío
  return Promise.resolve({ items: [], total: 0 });
};