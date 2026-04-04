// client/src/pages/OrderConfirmation.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainHeader from '../../core/components/Layout/MainHeader';
import Button from '../../core/components/UI/Button';
import Card from '../../core/components/UI/Card';
import api from '../../../shared/services/api';

export default function OrderConfirmation() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [orderNumber]);

  const loadOrder = async () => {
    try {
      const { data } = await api.get(`/orders/track/${orderNumber}`);
      setOrder(data);
    } catch (error) {
      console.error('Error cargando orden:', error);
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

  if (!order) {
    return (
      <>
        <MainHeader />
        <div className="pt-20 min-h-screen flex items-center justify-center">
          <Card className="text-center p-8 max-w-md">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-red-600 mb-4">Orden no encontrada</p>
            <Link to="/">
              <Button variant="primary">Volver al inicio</Button>
            </Link>
          </Card>
        </div>
      </>
    );
  }

  const statusLabel = {
    pending: 'Pendiente',
    paid: 'Pagado',
    processing: 'Procesando',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado'
  };

  return (
    <>
      <MainHeader />
      <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto text-center p-8 animate-fade-in">
            <div className="text-7xl mb-4 animate-bounce-slow">🎉</div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              ¡Pedido realizado con éxito!
            </h1>
            <p className="text-gray-500 mb-6">
              Hemos recibido tu pedido. Te mantendremos informado sobre su estado.
            </p>
            
            <div className="bg-gray-50 rounded-2xl p-6 mb-6 text-left">
              <div className="flex justify-between items-center mb-3">
                <p className="font-semibold text-gray-600">Número de orden</p>
                <p className="font-mono font-bold text-primary-600 text-lg">{order.orderNumber}</p>
              </div>
              <div className="flex justify-between items-center mb-3">
                <p className="font-semibold text-gray-600">Fecha</p>
                <p className="text-gray-700">
                  {new Date(order.createdAt).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <p className="font-semibold text-gray-600">Estado</p>
                <span className="badge badge-warning">
                  {statusLabel[order.status]}
                </span>
              </div>
              <div className="border-t border-gray-200 mt-4 pt-4">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-primary-600">${order.total.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/catalogo">
                <Button variant="primary">
                  🛍️ Seguir comprando
                </Button>
              </Link>
              <Link to={`/pedido/seguimiento/${order.orderNumber}`}>
                <Button variant="outline">
                  📦 Ver seguimiento
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}