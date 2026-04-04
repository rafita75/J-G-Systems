// client/src/pages/OrderTracking.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MainHeader from '../../core/components/Layout/MainHeader';
import Button from '../../core/components/UI/Button';
import Card from '../../core/components/UI/Card';
import Input from '../../core/components/UI/Input';
import api from '../../../shared/services/api';

const statusLabels = {
  pending: 'Pendiente',
  paid: 'Pagado',
  processing: 'Procesando',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado'
};

const paymentMethodLabels = {
  cash: '💵 Efectivo contra entrega',
  transfer: '🏦 Transferencia bancaria',
  card: '💳 Tarjeta'
};

const statusSteps = [
  { key: 'pending', label: 'Pedido recibido', icon: '📋', color: 'gray' },
  { key: 'paid', label: 'Pago confirmado', icon: '💳', color: 'green' },
  { key: 'processing', label: 'Preparando pedido', icon: '📦', color: 'blue' },
  { key: 'shipped', label: 'En camino', icon: '🚚', color: 'indigo' },
  { key: 'delivered', label: 'Entregado', icon: '✅', color: 'green' }
];

export default function OrderTracking() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchNumber, setSearchNumber] = useState(orderNumber || '');

  useEffect(() => {
    if (orderNumber) {
      loadOrder(orderNumber);
    } else {
      setLoading(false);
    }
  }, [orderNumber]);

  const loadOrder = async (num) => {
    try {
      const { data } = await api.get(`/orders/track/${num}`);
      setOrder(data);
      setError('');
    } catch (err) {
      setError('Orden no encontrada');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchNumber) {
      setLoading(true);
      loadOrder(searchNumber);
    }
  };

  const currentStepIndex = order ? statusSteps.findIndex(s => s.key === order.status) : -1;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <MainHeader />
      <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8 animate-slide-up">
              <h1 className="text-3xl font-bold text-gray-900">📦 Seguimiento de pedido</h1>
              <p className="text-gray-500 mt-2">Ingresa tu número de orden para ver el estado</p>
            </div>

            <Card className="p-6 mb-6">
              <form onSubmit={handleSearch} className="flex gap-3">
                <Input
                  type="text"
                  placeholder="Ej: ORD-2024-00001"
                  value={searchNumber}
                  onChange={(e) => setSearchNumber(e.target.value)}
                  className="flex-1"
                  icon="🔍"
                />
                <Button type="submit" variant="primary">
                  Buscar
                </Button>
              </form>
            </Card>

            {loading && (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            )}

            {error && (
              <Card className="p-6 text-center bg-red-50 border-red-200">
                <div className="text-4xl mb-2">🔍</div>
                <p className="text-red-600">{error}</p>
                <p className="text-sm text-gray-500 mt-2">Verifica el número de orden e intenta nuevamente</p>
              </Card>
            )}

            {order && (
              <Card className="p-6 animate-fade-in">
                <div className="text-center mb-6 pb-4 border-b border-gray-100">
                  <p className="text-sm text-gray-500">Número de orden</p>
                  <p className="font-mono text-xl font-bold text-primary-600">{order.orderNumber}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {formatDate(order.createdAt)}
                  </p>
                </div>

                {/* Barra de progreso */}
                <div className="mb-8">
                  <div className="flex justify-between mb-3">
                    {statusSteps.map((step, idx) => (
                      <div key={step.key} className="text-center flex-1">
                        <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-xl mb-2 transition-all ${
                          idx <= currentStepIndex
                            ? `bg-${step.color}-100 text-${step.color}-600 ring-2 ring-${step.color}-200`
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {step.icon}
                        </div>
                        <p className={`text-xs font-medium ${idx <= currentStepIndex ? 'text-gray-700' : 'text-gray-400'}`}>
                          {step.label}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-primary-600 transition-all duration-500"
                      style={{ width: `${((currentStepIndex + 1) / statusSteps.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Información de pago */}
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span>💰</span> Información de pago
                  </h3>
                  <p className="text-gray-600"><strong>Método:</strong> {paymentMethodLabels[order.paymentMethod] || order.paymentMethod}</p>
                  <p className="mt-1">
                    <strong>Estado:</strong> 
                    <span className={`ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
                      order.paymentStatus === 'paid' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.paymentStatus === 'paid' ? '✅ Pagado' : '⏳ Pendiente'}
                    </span>
                  </p>
                  
                  {/* Instrucciones para transferencia */}
                  {order.paymentMethod === 'transfer' && order.paymentStatus !== 'paid' && (
                    <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                      <p className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                        <span>📌</span> Instrucciones de pago
                      </p>
                      <p className="text-sm text-yellow-700 mb-2">Realiza una transferencia a los siguientes datos:</p>
                      <div className="bg-white p-3 rounded-lg text-sm space-y-1">
                        <p><strong>Banco:</strong> Banco Ejemplo S.A.</p>
                        <p><strong>Cuenta:</strong> 1234-5678-9012-3456</p>
                        <p><strong>CLABE:</strong> 012345678901234567</p>
                        <p><strong>Beneficiario:</strong> Mi Empresa S.A. de C.V.</p>
                        <p><strong>Concepto:</strong> <span className="font-mono">{order.orderNumber}</span></p>
                      </div>
                      <p className="text-xs text-yellow-600 mt-2">
                        Una vez realizada la transferencia, el pedido se procesará en 24-48 horas.
                      </p>
                    </div>
                  )}
                  
                  {/* Instrucciones para efectivo */}
                  {order.paymentMethod === 'cash' && order.paymentStatus !== 'paid' && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <p className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                        <span>💵</span> Pago contra entrega
                      </p>
                      <p className="text-sm text-blue-700">
                        Pagas en efectivo al recibir el producto. Ten el monto exacto listo.
                      </p>
                    </div>
                  )}
                </div>

                {/* Resumen del pedido */}
                <div className="border-t border-gray-100 mt-4 pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span>📋</span> Resumen del pedido
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p className="text-gray-600"><strong>Total:</strong></p>
                    <p className="text-right font-bold text-primary-600">${order.total.toLocaleString()}</p>
                    <p className="text-gray-600"><strong>Estado:</strong></p>
                    <p className="text-right">
                      <span className={`badge ${order.status === 'delivered' ? 'badge-success' : order.status === 'cancelled' ? 'badge-danger' : 'badge-warning'}`}>
                        {statusLabels[order.status]}
                      </span>
                    </p>
                    <p className="text-gray-600"><strong>Dirección:</strong></p>
                    <p className="text-right text-gray-700">{order.customer.address}, {order.customer.city}</p>
                  </div>
                </div>

                {/* Productos */}
                <div className="border-t border-gray-100 mt-4 pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span>📦</span> Productos
                  </h3>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                        <span className="text-gray-600">{item.name} <span className="text-gray-400">x{item.quantity}</span></span>
                        <span className="font-medium">${(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}