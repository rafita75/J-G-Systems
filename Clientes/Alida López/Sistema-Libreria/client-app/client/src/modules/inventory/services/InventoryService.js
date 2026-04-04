// client/src/modules/inventory/services/inventoryService.js
import api from '../../../shared/services/api';

export const getInventorySummary = async () => {
  const { data } = await api.get('/inventory/summary');
  return data;
};

export const getLowStockProducts = async () => {
  const { data } = await api.get('/inventory/low-stock');
  return data;
};

export const getStockMovements = async (params = {}) => {
  const { data } = await api.get('/inventory/movements', { params });
  return data;
};

export const adjustStock = async (productId, quantity, reason, type = 'adjustment') => {
  const { data } = await api.put(`/inventory/products/${productId}/stock`, {
    quantity,
    reason,
    type
  });
  return data;
};

export const updateMinStock = async (productId, minStock) => {
  const { data } = await api.put(`/inventory/products/${productId}/min-stock`, { minStock });
  return data;
};