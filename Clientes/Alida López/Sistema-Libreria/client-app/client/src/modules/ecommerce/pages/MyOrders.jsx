// client/src/pages/MyOrders.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainHeader from '../../core/components/Layout/MainHeader';
import Card from '../../core/components/UI/Card';
import Button from '../../core/components/UI/Button';
import api from '../../../shared/services/api';

const statusLabels = {
  pending: 'Pendiente',
  paid: 'Pagado',
  processing: 'Procesando',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado'
};

const statusColors = {
  pending: 'badge-warning',
  paid: 'badge-success',
  processing: 'badge-info',
  shipped: 'badge-info',
  delivered: 'badge-success',
  cancelled: 'badge-danger'
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data } = await api.get('/orders/my-orders');
      setOrders(data);
    } catch (error) {
      console.error('Error cargando pedidos:', error);
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
          <div className="text-center mb-8 animate-slide-up">
            <h1 className="text-3xl font-bold text-gray-900">📦 Mis Pedidos</h1>
            <p className="text-gray-500 mt-2">Historial de tus compras</p>
          </div>
          
          {orders.length === 0 ? (
            <Card className="text-center py-12">
              <div className="text-6xl mb-3">🛒</div>
              <p className="text-gray-500 mb-4">No tienes pedidos aún</p>
              <Link to="/catalogo">
                <Button variant="primary">Comenzar a comprar</Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order._id} className="overflow-hidden hover:shadow-medium transition">
                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <p className="font-mono font-bold text-primary-600 text-lg">{order.orderNumber}</p>
                          <span className={`badge ${statusColors[order.status]}`}>
                            {statusLabels[order.status]}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          📅 {new Date(order.createdAt).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                        <p className="text-sm text-gray-500">
                          📦 {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary-600">
                          ${order.total.toLocaleString()}
                        </p>
                        <Link
                          to={`/pedido/seguimiento/${order.orderNumber}`}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center gap-1 mt-2"
                        >
                          Ver seguimiento
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}