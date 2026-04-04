// client/src/pages/Admin/ServicesManager.jsx
import { useState, useEffect } from 'react';
import api from '../../../shared/services/api';
import Button from '../../core/components/UI/Button';
import Card from '../../core/components/UI/Card';
import Input from '../../core/components/UI/Input';

export default function ServicesManager() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 30,
    price: '',
    image: '',
    isActive: true
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const { data } = await api.get('/services/admin/all');
      setServices(data);
    } catch (error) {
      console.error('Error cargando servicios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/services/${editing._id}`, formData);
        setMessage('✅ Servicio actualizado');
      } else {
        await api.post('/services', formData);
        setMessage('✅ Servicio creado');
      }
      setShowForm(false);
      setEditing(null);
      setFormData({ name: '', description: '', duration: 30, price: '', image: '', isActive: true });
      loadServices();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error al guardar');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este servicio?')) return;
    try {
      await api.delete(`/services/${id}`);
      setMessage('✅ Servicio eliminado');
      loadServices();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error al eliminar');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>✂️</span> Servicios
          </h2>
          <p className="text-gray-500 text-sm mt-1">Gestiona los servicios que ofreces a tus clientes</p>
        </div>
        <Button variant="primary" onClick={() => {
          setEditing(null);
          setFormData({ name: '', description: '', duration: 30, price: '', image: '', isActive: true });
          setShowForm(true);
        }}>
          + Nuevo servicio
        </Button>
      </div>

      {message && (
        <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 animate-fade-in">
          {message}
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <Card className="p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editing ? '✏️ Editar Servicio' : '➕ Nuevo Servicio'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nombre del servicio *"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Corte de cabello, Barba, Tinte"
              required
              icon="✂️"
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows="3"
                placeholder="Describe el servicio..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Duración (minutos) *"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                min="5"
                step="5"
                required
                icon="⏱️"
              />
              <Input
                label="Precio *"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                min="0"
                step="0.01"
                required
                icon="💰"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Imagen (URL)</label>
              <input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              {formData.image && (
                <div className="mt-3">
                  <img 
                    src={formData.image} 
                    alt="Vista previa" 
                    className="w-20 h-20 object-cover rounded-xl border-2 border-gray-200"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/80?text=Error';
                    }}
                  />
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700 cursor-pointer">
                Activo (visible para los clientes)
              </label>
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="primary">
                {editing ? 'Actualizar' : 'Crear'} servicio
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Lista de servicios - Tarjetas en móvil, tabla en desktop */}
      <div className="block lg:hidden space-y-3">
        {services.map((service) => (
          <Card key={service._id} className="p-4">
            <div className="flex gap-4">
              <div className="w-16 h-16 flex-shrink-0">
                {service.image ? (
                  <img 
                    src={service.image} 
                    alt={service.name} 
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                    ✂️
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">{service.description || 'Sin descripción'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary-600">${service.price}</p>
                    <span className="badge badge-neutral text-xs">{service.duration} min</span>
                  </div>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <span className={`badge ${service.isActive ? 'badge-success' : 'badge-neutral'} text-xs`}>
                    {service.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditing(service);
                        setFormData({
                          name: service.name,
                          description: service.description || '',
                          duration: service.duration,
                          price: service.price,
                          image: service.image || '',
                          isActive: service.isActive
                        });
                        setShowForm(true);
                      }}
                      className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(service._id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabla desktop */}
      <div className="hidden lg:block bg-white rounded-xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Servicio</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Duración</th>
                <th className="p-4 text-right text-sm font-semibold text-gray-600">Precio</th>
                <th className="p-4 text-center text-sm font-semibold text-gray-600">Estado</th>
                <th className="p-4 text-center text-sm font-semibold text-gray-600">Acciones</th>
               </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {services.map((service) => (
                  <tr key={service._id} className="hover:bg-gray-50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {service.image ? (
                          <img 
                            src={service.image} 
                            alt={service.name} 
                            className="w-10 h-10 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                            ✂️
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{service.name}</div>
                          {service.description && (
                            <div className="text-xs text-gray-400 max-w-md truncate">
                              {service.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="badge badge-neutral">{service.duration} min</span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-semibold text-primary-600">${service.price}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`badge ${service.isActive ? 'badge-success' : 'badge-neutral'}`}>
                        {service.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => {
                            setEditing(service);
                            setFormData({
                              name: service.name,
                              description: service.description || '',
                              duration: service.duration,
                              price: service.price,
                              image: service.image || '',
                              isActive: service.isActive
                            });
                            setShowForm(true);
                          }}
                          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(service._id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Eliminar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {services.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500">
              No hay servicios creados. Haz clic en "Nuevo servicio" para comenzar.
            </div>
          )}
        </div>
      </div>
  );
}