// client/src/pages/Services.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainHeader from '../../core/components/Layout/MainHeader';
import Button from '../../core/components/UI/Button';
import Card from '../../core/components/UI/Card';
import api from '../../../shared/services/api';

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const { data } = await api.get('/services');
      setServices(data);
    } catch (error) {
      console.error('Error cargando servicios:', error);
    } finally {
      setLoading(false);
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
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12 animate-slide-up">
            <h1 className="text-4xl font-bold text-gray-900">✂️ Nuestros Servicios</h1>
            <p className="text-gray-500 mt-2">Descubre lo que podemos hacer por ti</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card key={service._id} className="overflow-hidden hover:shadow-medium transition-all duration-300 group">
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                  {service.image ? (
                    <img 
                      src={service.image} 
                      alt={service.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="text-6xl">✂️</div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{service.description}</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-2xl font-bold text-primary-600">${service.price}</span>
                      <span className="text-sm text-gray-400"> / {service.duration} min</span>
                    </div>
                    <Link to={`/servicio/${service._id}`}>
                      <Button variant="primary" size="sm">
                        Reservar
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}