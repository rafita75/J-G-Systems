// client/src/pages/ServiceDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../login/contexts/AuthContext';
import MainHeader from '../../core/components/Layout/MainHeader';
import Button from '../../core/components/UI/Button';
import Card from '../../core/components/UI/Card';
import api from '../../../shared/services/api';

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadService();
  }, [id]);

  const loadService = async () => {
    try {
      const { data } = await api.get(`/services/${id}`);
      setService(data);
    } catch (error) {
      setError('Servicio no encontrado');
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = () => {
    if (!user) {
      if (confirm('Debes iniciar sesión para reservar. ¿Ir al login?')) {
        navigate('/login');
      }
      return;
    }
    navigate(`/reservar/${service._id}`);
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

  if (error || !service) {
    return (
      <>
        <MainHeader />
        <div className="pt-20 min-h-screen flex items-center justify-center">
          <Card className="text-center p-8 max-w-md">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-red-600 mb-4">{error || 'Servicio no encontrado'}</p>
            <Link to="/servicios">
              <Button variant="primary">Ver todos los servicios</Button>
            </Link>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <MainHeader />
      <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          <Link to="/servicios" className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a servicios
          </Link>
          
          <Card className="overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8 p-6 md:p-8">
              {/* Imagen */}
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center overflow-hidden">
                {service.image ? (
                  <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-8xl">✂️</div>
                )}
              </div>
              
              {/* Información */}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{service.name}</h1>
                <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <span className="text-2xl">⏱️</span>
                    <span className="text-gray-700">Duración: <strong className="text-gray-900">{service.duration} minutos</strong></span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <span className="text-2xl">💰</span>
                    <span className="text-gray-700">Precio: <strong className="text-2xl text-primary-600">${service.price}</strong></span>
                  </div>
                </div>
                
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleReserve}
                  className="w-full"
                >
                  📅 Reservar cita
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}