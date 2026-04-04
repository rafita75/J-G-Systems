// client/src/pages/Admin/BookingsManager.jsx
import { useState, useEffect } from 'react';
import api from '../../../shared/services/api';
import Button from '../../core/components/UI/Button';
import Card from '../../core/components/UI/Card';
import Input from '../../core/components/UI/Input';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800'
};

const statusLabels = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Completada'
};

export default function BookingsManager() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [filter, setFilter] = useState('all');
  const [message, setMessage] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    serviceId: '',
    professionalId: '',
    fecha: '',
    hora: '',
    clienteNombre: '',
    clienteTelefono: '',
    clienteEmail: '',
    notas: ''
  });
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const { data } = await api.get('/appointments/admin');
      setBookings(data);
    } catch (error) {
      console.error('Error cargando reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status, reason = '') => {
    try {
      await api.put(`/appointments/admin/${id}/status`, { status, cancelReason: reason });
      setMessage(`✅ Estado actualizado a ${statusLabels[status]}`);
      loadBookings();
      setSelectedBooking(null);
      setCancelReason('');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error al actualizar estado');
    }
  };

  useEffect(() => {
    if (showCreateModal) {
      loadServicesAndProfessionals();
    }
  }, [showCreateModal]);

  const loadServicesAndProfessionals = async () => {
    try {
      const [servicesRes, prosRes] = await Promise.all([
        api.get('/services'),
        api.get('/professionals')
      ]);
      setServices(servicesRes.data);
      setProfessionals(prosRes.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  useEffect(() => {
    if (createForm.fecha && createForm.serviceId) {
      loadCreateAvailability();
    }
  }, [createForm.fecha, createForm.professionalId, createForm.serviceId]);

  const loadCreateAvailability = async () => {
    try {
      const { data } = await api.get('/availability', {
        params: {
          serviceId: createForm.serviceId,
          professionalId: createForm.professionalId,
          fecha: createForm.fecha
        }
      });
      setAvailableSlots(data);
    } catch (error) {
      console.error('Error cargando disponibilidad:', error);
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!createForm.hora) {
      alert('Selecciona un horario');
      return;
    }
    
    try {
      await api.post('/appointments/admin/create', {
        ...createForm,
        userId: null
      });
      setMessage('✅ Reserva creada manualmente');
      setShowCreateModal(false);
      setCreateForm({
        serviceId: '',
        professionalId: '',
        fecha: '',
        hora: '',
        clienteNombre: '',
        clienteTelefono: '',
        clienteEmail: '',
        notas: ''
      });
      loadBookings();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error al crear reserva');
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (filter === 'all') return true;
    return b.estado === filter;
  });

  const counts = {
    all: bookings.length,
    pending: bookings.filter(b => b.estado === 'pending').length,
    confirmed: bookings.filter(b => b.estado === 'confirmed').length,
    completed: bookings.filter(b => b.estado === 'completed').length,
    cancelled: bookings.filter(b => b.estado === 'cancelled').length
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
      {/* Header y botón */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span>📅</span> Reservas
        </h2>
        <Button variant="success" onClick={() => setShowCreateModal(true)}>
          + Reserva manual
        </Button>
      </div>

      {message && (
        <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 animate-fade-in">
          {message}
        </div>
      )}

      {/* Filtros - Scroll horizontal en móvil */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-2 min-w-max">
          <Button
            variant={filter === 'all' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            📋 Todas ({counts.all})
          </Button>
          <Button
            variant={filter === 'pending' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('pending')}
          >
            ⏳ Pendientes ({counts.pending})
          </Button>
          <Button
            variant={filter === 'confirmed' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('confirmed')}
          >
            ✅ Confirmadas ({counts.confirmed})
          </Button>
          <Button
            variant={filter === 'completed' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('completed')}
          >
            ✓ Completadas ({counts.completed})
          </Button>
          <Button
            variant={filter === 'cancelled' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('cancelled')}
          >
            ❌ Canceladas ({counts.cancelled})
          </Button>
        </div>
      </div>

      {/* Lista de reservas - Tarjetas en móvil, tabla en desktop */}
      <div className="block lg:hidden space-y-3">
        {filteredBookings.map((booking) => (
          <Card key={booking._id} className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900">
                    {booking.clienteNombre}
                  </p>
                  <p className="text-sm text-gray-500">{booking.clienteTelefono}</p>
                </div>
                <span className={`badge ${statusColors[booking.estado]}`}>
                  {statusLabels[booking.estado]}
                </span>
              </div>
              <div className="text-sm">
                <p>📅 {new Date(booking.fecha).toLocaleDateString()} - {booking.hora}</p>
                <p>✂️ {booking.serviceId?.name} ({booking.serviceId?.duration}min)</p>
                <p>👤 {booking.professionalId?.name || 'Cualquiera'}</p>
                {booking.cancelReason && booking.estado === 'cancelled' && (
                  <p className="text-red-500 text-xs mt-1">Motivo: {booking.cancelReason}</p>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                {booking.estado === 'pending' && (
                  <Button size="sm" variant="success" onClick={() => updateStatus(booking._id, 'confirmed')}>
                    Confirmar
                  </Button>
                )}
                {booking.estado === 'confirmed' && (
                  <Button size="sm" variant="primary" onClick={() => updateStatus(booking._id, 'completed')}>
                    Completar
                  </Button>
                )}
                {(booking.estado === 'pending' || booking.estado === 'confirmed') && (
                  <Button size="sm" variant="danger" onClick={() => setSelectedBooking(booking)}>
                    Cancelar
                  </Button>
                )}
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
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Fecha/Hora</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Cliente</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Servicio</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Profesional</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Estado</th>
                <th className="p-4 text-center text-sm font-semibold text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-gray-50 transition">
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{new Date(booking.fecha).toLocaleDateString()}</div>
                    <div className="text-sm text-gray-500">{booking.hora}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{booking.clienteNombre}</div>
                    <div className="text-sm text-gray-500">{booking.clienteTelefono}</div>
                    {booking.clienteEmail && <div className="text-xs text-gray-400">{booking.clienteEmail}</div>}
                    {!booking.userId && <span className="text-xs text-blue-500">(Cliente sin cuenta)</span>}
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{booking.serviceId?.name}</div>
                    <div className="text-xs text-gray-500">{booking.serviceId?.duration} min - ${booking.serviceId?.price}</div>
                  </td>
                  <td className="p-4 text-gray-600">
                    {booking.professionalId?.name || 'Cualquiera'}
                  </td>
                  <td className="p-4">
                    <span className={`badge ${statusColors[booking.estado]}`}>
                      {statusLabels[booking.estado]}
                    </span>
                    {booking.cancelReason && booking.estado === 'cancelled' && (
                      <div className="text-xs text-gray-400 mt-1">Motivo: {booking.cancelReason}</div>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex gap-2 justify-center">
                      {booking.estado === 'pending' && (
                        <Button size="sm" variant="success" onClick={() => updateStatus(booking._id, 'confirmed')}>
                          Confirmar
                        </Button>
                      )}
                      {booking.estado === 'confirmed' && (
                        <Button size="sm" variant="primary" onClick={() => updateStatus(booking._id, 'completed')}>
                          Completar
                        </Button>
                      )}
                      {(booking.estado === 'pending' || booking.estado === 'confirmed') && (
                        <Button size="sm" variant="danger" onClick={() => setSelectedBooking(booking)}>
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredBookings.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No hay reservas {filter !== 'all' ? `con estado "${statusLabels[filter]}"` : ''}
            </div>
          )}
        </div>
      </div>

      {/* Modal de creación manual */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-auto shadow-hard animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">➕ Crear reserva manual</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Servicio *</label>
                <select
                  value={createForm.serviceId}
                  onChange={(e) => setCreateForm({ ...createForm, serviceId: e.target.value, hora: '' })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Seleccionar servicio</option>
                  {services.map(s => (
                    <option key={s._id} value={s._id}>{s.name} - ${s.price} ({s.duration}min)</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profesional</label>
                <select
                  value={createForm.professionalId}
                  onChange={(e) => setCreateForm({ ...createForm, professionalId: e.target.value, hora: '' })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {professionals.map(p => (
                    <option key={p._id || 'any'} value={p._id || ''}>{p.name}</option>
                  ))}
                </select>
              </div>
              
              <Input
                label="Fecha *"
                type="date"
                value={createForm.fecha}
                onChange={(e) => setCreateForm({ ...createForm, fecha: e.target.value, hora: '' })}
                min={new Date().toISOString().split('T')[0]}
                required
              />
              
              {createForm.fecha && createForm.serviceId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Horario *</label>
                  {availableSlots.length === 0 ? (
                    <p className="text-gray-500 text-sm p-3 bg-gray-50 rounded-xl text-center">No hay horarios disponibles</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map((slot, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCreateForm({ ...createForm, hora: slot.time })}
                          className={`p-2 rounded-xl border text-center transition ${
                            createForm.hora === slot.time
                              ? 'bg-primary-600 text-white border-primary-600'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              <Input
                label="Nombre del cliente *"
                type="text"
                value={createForm.clienteNombre}
                onChange={(e) => setCreateForm({ ...createForm, clienteNombre: e.target.value })}
                required
                icon="👤"
              />
              
              <Input
                label="Teléfono *"
                type="tel"
                value={createForm.clienteTelefono}
                onChange={(e) => setCreateForm({ ...createForm, clienteTelefono: e.target.value })}
                required
                icon="📞"
              />
              
              <Input
                label="Email (opcional)"
                type="email"
                value={createForm.clienteEmail}
                onChange={(e) => setCreateForm({ ...createForm, clienteEmail: e.target.value })}
                icon="✉️"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea
                  value={createForm.notas}
                  onChange={(e) => setCreateForm({ ...createForm, notas: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows="2"
                  placeholder="Información adicional..."
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <Button type="submit" variant="success" className="flex-1">
                  Crear reserva
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de cancelación */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-hard animate-scale-in">
            <h3 className="text-xl font-bold text-gray-900 mb-4">❌ Cancelar reserva</h3>
            <div className="bg-gray-50 p-4 rounded-xl mb-4">
              <p className="text-sm"><strong>Cliente:</strong> {selectedBooking.clienteNombre}</p>
              <p className="text-sm"><strong>Servicio:</strong> {selectedBooking.serviceId?.name}</p>
              <p className="text-sm"><strong>Fecha:</strong> {new Date(selectedBooking.fecha).toLocaleDateString()} - {selectedBooking.hora}</p>
            </div>
            <textarea
              placeholder="Motivo de cancelación"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              rows="3"
            />
            <div className="flex gap-3">
              <Button
                variant="danger"
                onClick={() => updateStatus(selectedBooking._id, 'cancelled', cancelReason)}
                className="flex-1"
              >
                Confirmar cancelación
              </Button>
              <Button variant="ghost" onClick={() => setSelectedBooking(null)}>
                Volver
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}