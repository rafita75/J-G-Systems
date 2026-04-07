// client/src/services/sectionService.js
import api from './api';

// Obtener todas las secciones activas (público)
export const getSections = async () => {
  const { data } = await api.get('api/sections');
  return data;
};

// Obtener todas las secciones para admin
export const getAdminSections = async () => {
  const { data } = await api.get('api/sections/admin');
  return data;
};

// Crear nueva sección
export const createSection = async (sectionData) => {
  const { data } = await api.post('api/sections', sectionData);
  return data;
};

// Actualizar sección
export const updateSection = async (id, sectionData) => {
  const { data } = await api.put(`api/sections/${id}`, sectionData);
  return data;
};

// Eliminar sección
export const deleteSection = async (id) => {
  const { data } = await api.delete(`api/sections/${id}`);
  return data;
};

// Reordenar secciones
export const reorderSections = async (sections) => {
  const { data } = await api.post('api/sections/reorder', { sections });
  return data;
};