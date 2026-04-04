// client/src/pages/Admin/OrdersManager.jsx
import { useState, useEffect } from 'react';
import api from '../../../shared/services/api';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const statusLabels = {
  pending: 'Pendiente',
  paid: 'Pagado',
  processing: 'Procesando',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado'
};

const paymentMethodLabels = {
  cash: 'Efectivo',
  transfer: 'Transferencia',
  card: 'Tarjeta'
};

export default function OrdersManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [message, setMessage] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, pending, paid

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data } = await api.get('/orders/admin');
      setOrders(data);
    } catch (error) {
      console.error('Error cargando órdenes:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/admin/${orderId}/status`, { status: newStatus });
      setMessage(`✅ Estado actualizado a ${statusLabels[newStatus]}`);
      loadOrders();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error al actualizar estado');
    }
  };

  const markAsPaid = async (orderId) => {
    try {
      await api.put(`/orders/admin/${orderId}/mark-paid`);
      setMessage('✅ Pedido marcado como pagado');
      loadOrders();
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(null);
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error al marcar como pagado');
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filterType === 'pending') return order.paymentStatus === 'pending';
    if (filterType === 'paid') return order.paymentStatus === 'paid';
    return true;
  });

  const pendingCount = orders.filter(o => o.paymentStatus === 'pending').length;
  const paidCount = orders.filter(o => o.paymentStatus === 'paid').length;
  const pendingTotal = orders.filter(o => o.paymentStatus === 'pending').reduce((sum, o) => sum + o.total, 0);

  if (loading) {
    return <div className="p-8 text-center">Cargando órdenes...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold">Pedidos</h2>
        <p className="text-gray-600 text-sm">Gestiona los pedidos de tus clientes</p>
      </div>

      {message && (
        <div className="m-6 p-3 bg-green-100 text-green-700 rounded">
          {message}
        </div>
      )}

      {/* Filtros */}
      <div className="px-6 pt-4 pb-2 border-b flex flex-wrap gap-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded text-sm transition ${
            filterType === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          📋 Todos ({orders.length})
        </button>
        <button
          onClick={() => setFilterType('pending')}
          className={`px-3 py-1.5 rounded text-sm transition ${
            filterType === 'pending' 
              ? 'bg-yellow-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          ⏳ Pendientes ({pendingCount}) - ${pendingTotal.toLocaleString()}
        </button>
        <button
          onClick={() => setFilterType('paid')}
          className={`px-3 py-1.5 rounded text-sm transition ${
            filterType === 'paid' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          ✅ Pagados ({paidCount})
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-left">Orden</th>
              <th className="p-4 text-left">Cliente</th>
              <th className="p-4 text-left">Fecha</th>
              <th className="p-4 text-right">Total</th>
              <th className="p-4 text-left">Pago</th>
              <th className="p-4 text-left">Estado</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order._id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-mono text-sm">{order.orderNumber}</td>
                <td className="p-4">
                  <div className="font-medium">{order.customer.name}</div>
                  <div className="text-sm text-gray-500">{order.customer.email}</div>
                </td>
                <td className="p-4 text-sm">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 text-right font-semibold">
                  ${order.total.toLocaleString()}
                </td>
                <td className="p-4">
                  {order.paymentStatus === 'paid' ? (
                    <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">
                      ✅ Pagado
                    </span>
                  ) : (
                    <div>
                      <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">
                        ⏳ Pendiente
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {paymentMethodLabels[order.paymentMethod]}
                      </p>
                    </div>
                  )}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${statusColors[order.status]}`}>
                    {statusLabels[order.status]}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    Ver detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de detalle */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Pedido {selectedOrder.orderNumber}</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Información del cliente */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-semibold mb-2">Datos del cliente</h4>
              <p><strong>Nombre:</strong> {selectedOrder.customer.name}</p>
              <p><strong>Email:</strong> {selectedOrder.customer.email}</p>
              <p><strong>Teléfono:</strong> {selectedOrder.customer.phone}</p>
              <p><strong>Dirección:</strong> {selectedOrder.customer.address}, {selectedOrder.customer.city}, CP {selectedOrder.customer.zipCode}</p>
              {selectedOrder.customer.notes && <p><strong>Notas:</strong> {selectedOrder.customer.notes}</p>}
            </div>

            {/* Información de pago */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-semibold mb-2">💰 Información de pago</h4>
              <p><strong>Método:</strong> {paymentMethodLabels[selectedOrder.paymentMethod]}</p>
              <p><strong>Estado:</strong> {selectedOrder.paymentStatus === 'paid' ? '✅ Pagado' : '⏳ Pendiente'}</p>
              
              {selectedOrder.paymentStatus !== 'paid' && (
                <div className="mt-3">
                  {selectedOrder.paymentMethod === 'transfer' ? (
                    <div className="mt-2">
                      <p className="text-sm mb-2">El cliente debe realizar una transferencia a:</p>
                      <div className="bg-white p-3 rounded text-sm border">
                        <p><strong>Banco:</strong> Banco Ejemplo S.A.</p>
                        <p><strong>Cuenta:</strong> 1234-5678-9012-3456</p>
                        <p><strong>CLABE:</strong> 012345678901234567</p>
                        <p><strong>Beneficiario:</strong> Mi Empresa S.A. de C.V.</p>
                        <p><strong>Concepto:</strong> {selectedOrder.orderNumber}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm">El cliente pagará en efectivo al recibir el producto.</p>
                  )}
                  
                  <button
                    onClick={() => markAsPaid(selectedOrder._id)}
                    className="mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Marcar como pagado
                  </button>
                </div>
              )}
            </div>

            {/* Productos */}
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Productos</h4>
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">Producto</th>
                    <th className="p-2 text-center">Cantidad</th>
                    <th className="p-2 text-right">Precio</th>
                    <th className="p-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-2">{item.name}</td>
                      <td className="p-2 text-center">{item.quantity}</td>
                      <td className="p-2 text-right">${item.price.toLocaleString()}</td>
                      <td className="p-2 text-right">${(item.price * item.quantity).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" className="p-2 text-right font-bold">Total:</td>
                    <td className="p-2 text-right font-bold">${selectedOrder.total.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Cambiar estado del pedido */}
            <div>
              <h4 className="font-semibold mb-2">Actualizar estado del pedido</h4>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(statusLabels).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => {
                      updateOrderStatus(selectedOrder._id, key);
                      setSelectedOrder(null);
                    }}
                    className={`px-3 py-1 rounded text-sm transition ${
                      selectedOrder.status === key
                        ? 'bg-gray-300 cursor-default'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                    disabled={selectedOrder.status === key}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}