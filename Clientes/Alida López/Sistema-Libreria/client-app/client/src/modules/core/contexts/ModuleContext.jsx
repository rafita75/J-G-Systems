// src/contexts/ModuleContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../../../shared/services/api';

const ModuleContext = createContext();

export function ModuleProvider({ children }) {
  const [modules, setModules] = useState(null);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);

  // Cargar configuración desde ruta PÚBLICA (sin autenticación)
  const loadConfig = async () => {
    try {
      // CAMBIADO: usar ruta pública /public/modules
      const { data } = await api.get('/superadmin/public/modules');
      setModules(data.modules);
      setConfig({
        siteName: data.siteName,
        primaryColor: data.primaryColor
      });
    } catch (error) {
      console.error('Error cargando configuración:', error);
      // Valores por defecto si hay error
      setModules({
        catalog: true,
        cart: true,
        blog: false,
        appointments: false,
        courses: false,
        accounting: false
      });
      setConfig({
        siteName: 'Mi Tienda',
        primaryColor: '#3b82f6'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  // Verificar si un módulo está activo
  const hasModule = (moduleName) => {
    if (!modules) return false;
    return modules[moduleName] === true;
  };

  // Recargar configuración (después de cambios desde superadmin)
  const reload = () => {
    setLoading(true);
    loadConfig();
  };

  return (
    <ModuleContext.Provider value={{ 
      modules, 
      config,
      loading, 
      hasModule, 
      reload 
    }}>
      {children}
    </ModuleContext.Provider>
  );
}

export function useModules() {
  return useContext(ModuleContext);
}