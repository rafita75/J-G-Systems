// client/src/services/productService.js
import api from './api';

// Obtener todos los productos (admin)
export const getAdminProducts = async () => {
  const { data } = await api.get('/products/admin/all');
  return data;
};

// Obtener productos públicos (con paginación y filtros)
export const getProducts = async (params = {}) => {
  const { data } = await api.get('/products', { params });
  return data;
};

// Obtener producto por slug
export const getProductBySlug = async (slug) => {
  const { data } = await api.get(`/products/${slug}`);
  return data;
};

// Obtener productos destacados
export const getFeaturedProducts = async () => {
  const { data } = await api.get('/products/featured');
  return data;
};

// Crear producto
export const createProduct = async (productData) => {
  const { data } = await api.post('/products', productData);
  return data;
};

// Actualizar producto
export const updateProduct = async (id, productData) => {
  const { data } = await api.put(`/products/${id}`, productData);
  return data;
};

// Eliminar producto
export const deleteProduct = async (id) => {
  const { data } = await api.delete(`/products/${id}`);
  return data;
};