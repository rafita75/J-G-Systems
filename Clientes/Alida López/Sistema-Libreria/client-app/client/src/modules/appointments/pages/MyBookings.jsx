// client/src/pages/MyBookings.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../login/contexts/AuthContext';
import MainHeader from '../../core/components/Layout/MainHeader';
import Button from '../../core/components/UI/Button';
import Card from '../../core/components/UI/Card';
import api from '../../../shared/services/api';

const statusColors = {
  pending: 'badge-warning',
  confirmed: 'badge-success',
  cancelled: 'badge-danger',
  completed: 'badge-neutral'
};

const statusLabels = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Completada'
};

export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const { data } = await api.get('/appointments/my');
      setBookings(data);
    } catch (error) {
      console.error('Error cargando reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async () => {
    try {
      await api.put(`/appointments/${cancelId}/cancel`, { reason: cancelReason });
      setMessage('✅ Reserva cancelada');
      loadBookings();
      setCancelId(null);
      setCancelReason('');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error al cancelar');
    }
  };

  const upcomingBookings = bookings.filter(b => 
    b.estado !== 'cancelled' && b.estado !== 'completed'
  );
  const pastBookings = bookings.filter(b => 
    b.estado === 'completed' || b.estado === 'cancelled'
  );

  if (loading) {
    return (
      <>
        <MainHeader />
        <div className="pt-20 min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <MainHeader />
      <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8 animate-slide-up">
            <h1 className="text-3xl font-bold text-gray-900">📋 Mis reservas</h1>
            <p className="text-gray-500 mt-2">Gestiona tus citas agendadas</p>
          </div>
          
          {message && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 animate-fade-in">
              {message}
            </div>
          )}
          
          {/* Próximas reservas */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>🔜</span> Próximas citas
            </h2>
            {upcomingBookings.length === 0 ? (
              <Card className="text-center py-12">
                <div className="text-5xl mb-3">📅</div>
                <p className="text-gray-500 mb-4">No tienes próximas citas</p>
                <Link to="/servicios">
                  <Button variant="primary">Reservar una cita</Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <Card key={booking._id} className="p-5 hover:shadow-medium transition">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-lg font-semibold text-gray-900">{booking.serviceId?.name}</h3>
                          <span className={`badge ${statusColors[booking.estado]}`}>
                            {statusLabels[booking.estado]}
                          </span>
                        </div>
                        <div className="mt-2 space-y-1">
                          <p className="text-gray-600 flex items-center gap-2">
                            <span>📅</span> {new Date(booking.fecha).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })} - {booking.hora}
                          </p>
                          <p className="text-sm text-gray-500">
                            👤 Profesional: {booking.professionalId?.name || 'Cualquiera'}
                          </p>
                          {booking.notas && (
                            <p className="text-sm text-gray-500 mt-1">📝 Notas: {booking.notas}</p>
                          )}
                        </div>
                      </div>
                      {booking.estado === 'pending' && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setCancelId(booking._id)}
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          {/* Historial */}
          {pastBookings.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>📋</span> Historial
              </h2>
              <div className="space-y-3">
                {pastBookings.map((booking) => (
                  <Card key={booking._id} className="p-4 bg-gray-50/50">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                      <div>
                        <p className="font-medium text-gray-800">{booking.serviceId?.name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(booking.fecha).toLocaleDateString()} - {booking.hora}
                        </p>
                        {booking.cancelReason && booking.estado === 'cancelled' && (
                          <p className="text-sm text-red-500 mt-1">Motivo: {booking.cancelReason}</p>
                        )}
                      </div>
                      <span className={`badge ${statusColors[booking.estado]}`}>
                        {statusLabels[booking.estado]}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de cancelación */}
      {cancelId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-hard animate-scale-in">
            <h3 className="text-xl font-bold text-gray-900 mb-4">❌ Cancelar reserva</h3>
            <div className="bg-gray-50 p-4 rounded-xl mb-4">
              <p className="text-sm text-gray-600">¿Estás seguro de que deseas cancelar esta cita?</p>
            </div>
            <textarea
              placeholder="Motivo de cancelación (opcional)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              rows="3"
            />
            <div className="flex gap-3">
              <Button variant="danger" onClick={cancelBooking} className="flex-1">
                Confirmar cancelación
              </Button>
              <Button variant="ghost" onClick={() => setCancelId(null)}>
                Volver
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}