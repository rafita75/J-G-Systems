// client/src/pages/Booking.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../login/contexts/AuthContext';
import MainHeader from '../../core/components/Layout/MainHeader';
import Button from '../../core/components/UI/Button';
import Card from '../../core/components/UI/Card';
import Input from '../../core/components/UI/Input';
import api from '../../../shared/services/api';

export default function Booking() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [professionals, setProfessionals] = useState([]);
  const [selectedProfessional, setSelectedProfessional] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [telefono, setTelefono] = useState('');
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedDate && service) {
      loadAvailability();
    }
  }, [selectedDate, selectedProfessional, service]);

  const loadData = async () => {
    try {
      const [serviceRes, prosRes] = await Promise.all([
        api.get(`/services/${serviceId}`),
        api.get('/professionals')
      ]);
      setService(serviceRes.data);
      setProfessionals(prosRes.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailability = async () => {
    try {
      const { data } = await api.get('/availability', {
        params: {
          serviceId,
          professionalId: selectedProfessional,
          fecha: selectedDate
        }
      });
      setAvailableSlots(data);
    } catch (error) {
      console.error('Error cargando disponibilidad:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setError('Selecciona un horario');
      return;
    }
    if (!telefono.trim()) {
      setError('El teléfono es requerido');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      await api.post('/appointments', {
        serviceId,
        professionalId: selectedProfessional || null,
        fecha: selectedDate,
        hora: selectedSlot,
        telefono: telefono,
        notas
      });
      navigate('/mis-reservas');
    } catch (error) {
      setError(error.response?.data?.error || 'Error al crear reserva');
    } finally {
      setSubmitting(false);
    }
  };

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
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="text-center mb-8 animate-slide-up">
            <h1 className="text-3xl font-bold text-gray-900">📅 Reservar cita</h1>
            <p className="text-gray-500 mt-2">Completa los datos para agendar tu servicio</p>
          </div>
          
          <Card className="p-6 md:p-8 animate-fade-in">
            <div className="mb-6 p-4 bg-primary-50 rounded-xl border border-primary-100">
              <div className="flex items-center gap-3">
                <div className="text-3xl">✂️</div>
                <div>
                  <p className="font-semibold text-gray-900">{service?.name}</p>
                  <p className="text-sm text-gray-500">{service?.duration} min · ${service?.price}</p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profesional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">👤 Profesional</label>
                <select
                  value={selectedProfessional}
                  onChange={(e) => setSelectedProfessional(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                >
                  {professionals.map(pro => (
                    <option key={pro._id || 'any'} value={pro._id || ''}>
                      {pro.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">📅 Fecha</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              
              {/* Horarios */}
              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">🕐 Horarios disponibles</label>
                  {availableSlots.length === 0 ? (
                    <div className="p-4 bg-gray-50 rounded-xl text-center text-gray-500">
                      No hay horarios disponibles para esta fecha
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map((slot, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedSlot(slot.time)}
                          className={`p-3 rounded-xl border text-center font-medium transition ${
                            selectedSlot === slot.time
                              ? 'bg-primary-600 text-white border-primary-600 shadow-soft'
                              : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* Teléfono */}
              <Input
                label="Teléfono"
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej: 12345678"
                required
                icon="📞"
                helper="Te contactaremos a este número si es necesario"
              />
              
              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">📝 Notas adicionales</label>
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows="3"
                  placeholder="Alguna preferencia o información adicional..."
                />
              </div>
              
              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm">
                  {error}
                </div>
              )}
              
              <Button
                type="submit"
                variant="success"
                loading={submitting}
                disabled={!selectedSlot}
                className="w-full"
                size="lg"
              >
                Confirmar reserva
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}