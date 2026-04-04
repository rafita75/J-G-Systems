// src/pages/SuperAdmin/Dashboard.jsx
import { useState, useEffect } from 'react';
import api from '../../shared/services/api';
import { useNavigate } from 'react-router-dom';
import { useModules } from '../../modules/core/contexts/ModuleContext';

export default function SuperAdminDashboard() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState([]);
  const navigate = useNavigate(); 

  const loadConfig = async () => {
    try {
      const { data } = await api.get('/superadmin/config', {
        headers: { Authorization: `Bearer ${localStorage.getItem('superadminToken')}` }
      });
      setConfig(data);
    } catch (error) {
      localStorage.removeItem('superadminToken');
      navigate('/superadmin');
    } finally {
      setLoading(false);
    }
  };

  // Cargar solicitudes pendientes
  const loadRequests = async () => {
    try {
      const { data } = await api.get('/superadmin/requests/pending', {
        headers: { Authorization: `Bearer ${localStorage.getItem('superadminToken')}` }
      });
      setPendingRequests(data);
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
    }
  };

  // Aprobar solicitud
  const approveRequest = async (requestId, moduleKey) => {
    try {
      await api.post(`/superadmin/requests/${requestId}/approve`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('superadminToken')}` }
      });
      alert('✅ Módulo activado correctamente');
      loadRequests();
      loadConfig(); // Recargar configuración para actualizar módulos activos
    } catch (error) {
      alert('Error al activar módulo');
    }
  };

  // Rechazar solicitud
  const rejectRequest = async (requestId) => {
    try {
      await api.post(`/superadmin/requests/${requestId}/reject`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('superadminToken')}` }
      });
      alert('Solicitud rechazada');
      loadRequests();
    } catch (error) {
      alert('Error al rechazar solicitud');
    }
  };

  const { reload } = useModules();

  const toggleModule = async (moduleName) => {
    const newModules = { ...config.modules, [moduleName]: !config.modules[moduleName] };
    
    try {
      await api.put('/superadmin/modules', 
        { modules: newModules },
        { headers: { Authorization: `Bearer ${localStorage.getItem('superadminToken')}` } }
      );
      setConfig({ ...config, modules: newModules });
      reload(); // Recargar módulos en el contexto
    } catch (error) {
      alert('Error al actualizar módulo');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('superadminToken');
    navigate('/superadmin');
  };

  useEffect(() => {
    const token = localStorage.getItem('superadminToken');
    if (!token) {
      navigate('/superadmin');
      return;
    }
    loadConfig();
    loadRequests();
  }, []);

  if (loading) return <div className="p-8">Cargando...</div>;

  const modulesList = [
  { key: 'login', name: 'Login / Registro', icon: '🔐' },
  { key: 'landingCustomization', name: 'Personalización Landing', icon: '🎨' },
  { key: 'ecommerce', name: 'Ecommerce Completo', icon: '🛍️' },
  { key: 'accounting', name: 'Contabilidad', icon: '💰' },
  { key: 'appointments', name: 'Reservas / Citas', icon: '📅' },
  { key: 'inventory', name: 'Inventario', icon: '📦' },
  { key: 'pos', name: 'POS', icon: '💳' }
];

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">SuperAdmin</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Cerrar Sesión
          </button>
        </div>
      </nav>
      
      <div className="container mx-auto p-8">
        <div className="bg-gray-800 rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            Módulos del Sitio
          </h2>
          <p className="text-gray-400 mb-6">
            Activa o desactiva los módulos que el cliente pagó.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            {modulesList.map(module => (
              <div
                key={module.key}
                className="bg-gray-700 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{module.icon}</span>
                  <div>
                    <h3 className="text-white font-medium">{module.name}</h3>
                    <p className="text-gray-400 text-sm">
                      {config.modules[module.key] ? 'Activo' : 'Inactivo'}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => toggleModule(module.key)}
                  className={`px-4 py-2 rounded font-medium transition ${
                    config.modules[module.key]
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                  }`}
                >
                  {config.modules[module.key] ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      {pendingRequests.length > 0 && (
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 mt-6">
          <h2 className="text-2xl font-bold text-white mb-4">
            Solicitudes Pendientes
          </h2>
          <div className="space-y-3">
            {pendingRequests.map(req => (
              <div key={req._id} className="bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white font-medium">{req.moduleName}</p>
                    <p className="text-gray-400 text-sm">
                      Cliente: {req.clientName} ({req.clientEmail})
                    </p>
                    <p className="text-gray-400 text-sm">
                      Precio: ${req.price} | Solicitado: {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                    {req.notes && (
                      <p className="text-gray-400 text-sm mt-1">
                        Notas: {req.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => approveRequest(req._id, req.moduleKey)}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Aprobar
                    </button>
                    <button
                      onClick={() => rejectRequest(req._id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>

  );
}