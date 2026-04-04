// client/src/pages/Admin/CouponsManager.jsx
import { useState, useEffect } from 'react';
import api from '../../../shared/services/api';
import Button from '../../core/components/UI/Button';
import Card from '../../core/components/UI/Card';
import Input from '../../core/components/UI/Input';

export default function CouponsManager() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'percentage',
    value: '',
    minPurchase: '',
    maxDiscount: '',
    startDate: '',
    endDate: '',
    usageLimit: '',
    perUserLimit: '1',
    isActive: true
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      const { data } = await api.get('/coupons/admin');
      setCoupons(data);
    } catch (error) {
      console.error('Error cargando cupones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/coupons/admin/${editing._id}`, formData);
        setMessage('✅ Cupón actualizado');
      } else {
        await api.post('/coupons/admin', formData);
        setMessage('✅ Cupón creado');
      }
      setShowForm(false);
      setEditing(null);
      setFormData({
        code: '', name: '', description: '', type: 'percentage', value: '',
        minPurchase: '', maxDiscount: '', startDate: '', endDate: '',
        usageLimit: '', perUserLimit: '1', isActive: true
      });
      loadCoupons();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error: ' + (error.response?.data?.error || 'Error al guardar'));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este cupón?')) return;
    try {
      await api.delete(`/coupons/admin/${id}`);
      setMessage('✅ Cupón eliminado');
      loadCoupons();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error al eliminar');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
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
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span>🏷️</span> Cupones de descuento
        </h2>
        <Button variant="primary" onClick={() => {
          setEditing(null);
          setFormData({
            code: '', name: '', description: '', type: 'percentage', value: '',
            minPurchase: '', maxDiscount: '', startDate: '', endDate: '',
            usageLimit: '', perUserLimit: '1', isActive: true
          });
          setShowForm(true);
        }}>
          + Nuevo cupón
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
            {editing ? '✏️ Editar Cupón' : '➕ Nuevo Cupón'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Código *"
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="Ej: DESCUENTO10"
                required
                icon="🔖"
              />
              <Input
                label="Nombre"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: 10% de descuento"
                icon="📝"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows="2"
                placeholder="Descripción del cupón..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="percentage">📊 Porcentaje (%)</option>
                  <option value="fixed">💰 Monto fijo ($)</option>
                </select>
              </div>
              <Input
                label="Valor *"
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                placeholder={formData.type === 'percentage' ? 'Ej: 10' : 'Ej: 100'}
                required
                icon={formData.type === 'percentage' ? '%' : '$'}
              />
              <Input
                label="Compra mínima"
                type="number"
                value={formData.minPurchase}
                onChange={(e) => setFormData({ ...formData, minPurchase: parseFloat(e.target.value) })}
                placeholder="0"
                icon="💰"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Límite de uso total"
                type="number"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value ? parseInt(e.target.value) : '' })}
                placeholder="Ilimitado"
                icon="🔢"
              />
              <Input
                label="Límite por usuario"
                type="number"
                value={formData.perUserLimit}
                onChange={(e) => setFormData({ ...formData, perUserLimit: parseInt(e.target.value) })}
                placeholder="1"
                icon="👤"
              />
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
                Activo (visible para clientes)
              </label>
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="primary">
                {editing ? 'Actualizar' : 'Crear'} Cupón
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Lista de cupones - Tarjetas en móvil, tabla en desktop */}
      <div className="block lg:hidden space-y-3">
        {coupons.map((coupon) => (
          <Card key={coupon._id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-primary-600 text-lg">{coupon.code}</span>
                  {coupon.name && <span className="text-sm text-gray-500">({coupon.name})</span>}
                </div>
                {coupon.description && (
                  <p className="text-sm text-gray-500 mt-1">{coupon.description}</p>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="badge badge-success text-sm">
                    {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value.toLocaleString()}`}
                  </span>
                  <span className={`badge ${coupon.isActive ? 'badge-success' : 'badge-neutral'}`}>
                    {coupon.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                  <span className="badge badge-neutral">
                    Usos: {coupon.usedCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ''}
                  </span>
                </div>
                {coupon.endDate && (
                  <p className="text-xs text-gray-400 mt-2">
                    📅 Válido hasta: {formatDate(coupon.endDate)}
                  </p>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setEditing(coupon);
                    setFormData({
                      code: coupon.code,
                      name: coupon.name || '',
                      description: coupon.description || '',
                      type: coupon.type,
                      value: coupon.value,
                      minPurchase: coupon.minPurchase || '',
                      maxDiscount: coupon.maxDiscount || '',
                      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().slice(0, 16) : '',
                      endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().slice(0, 16) : '',
                      usageLimit: coupon.usageLimit || '',
                      perUserLimit: coupon.perUserLimit,
                      isActive: coupon.isActive
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
                  onClick={() => handleDelete(coupon._id)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
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
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Código</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Descuento</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Válido</th>
                <th className="p-4 text-center text-sm font-semibold text-gray-600">Usos</th>
                <th className="p-4 text-center text-sm font-semibold text-gray-600">Estado</th>
                <th className="p-4 text-center text-sm font-semibold text-gray-600">Acciones</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-gray-50 transition">
                    <td className="p-4">
                      <div>
                        <span className="font-mono font-bold text-primary-600">{coupon.code}</span>
                        {coupon.name && <div className="text-xs text-gray-400 mt-0.5">{coupon.name}</div>}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="badge badge-success">
                        {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value.toLocaleString()}`}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {coupon.endDate ? formatDate(coupon.endDate) : 'Sin fecha'}
                    </td>
                    <td className="p-4 text-center text-sm text-gray-600">
                      {coupon.usedCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ''}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`badge ${coupon.isActive ? 'badge-success' : 'badge-neutral'}`}>
                        {coupon.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => {
                            setEditing(coupon);
                            setFormData({
                              code: coupon.code,
                              name: coupon.name || '',
                              description: coupon.description || '',
                              type: coupon.type,
                              value: coupon.value,
                              minPurchase: coupon.minPurchase || '',
                              maxDiscount: coupon.maxDiscount || '',
                              startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().slice(0, 16) : '',
                              endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().slice(0, 16) : '',
                              usageLimit: coupon.usageLimit || '',
                              perUserLimit: coupon.perUserLimit,
                              isActive: coupon.isActive
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
                          onClick={() => handleDelete(coupon._id)}
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
          {coupons.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No hay cupones creados. Haz clic en "Nuevo cupón" para comenzar.
            </div>
          )}
        </div>
      </div>
  );
}