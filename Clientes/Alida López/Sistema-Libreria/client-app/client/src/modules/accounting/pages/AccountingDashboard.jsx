// client/src/pages/Admin/AccountingDashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../login/contexts/AuthContext';
import api from '../../../shared/services/api';
import QuickSaleModal from '../components/expenses/QuickSaleModal';
import ExpenseModal from '../components/expenses/ExpenseModal';
import CustomerDebtModal from '../components/debts/CustomerDebtModal';
import BusinessDebtModal from '../components/debts/BusinessDebtModal';
import ReportsModal from '../components/reports/ReportsModal';

export default function AccountingDashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showCustomerDebtModal, setShowCustomerDebtModal] = useState(false);
  const [showBusinessDebtModal, setShowBusinessDebtModal] = useState(false);
  const [message, setMessage] = useState('');
  const [showReports, setShowReports] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const { data } = await api.get('/accounting/dashboard');
      setDashboard(data);
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const payCustomerDebt = async (debtId) => {
    if (!confirm('¿Marcar esta deuda como pagada? Se registrará el ingreso en caja.')) return;
    
    try {
      await api.put(`/accounting/customer-debt/${debtId}/pay`, {
        metodo: 'efectivo'
      });
      loadDashboard();
      setMessage('✅ Deuda marcada como pagada');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error al pagar deuda:', error);
      setMessage('❌ Error al pagar deuda');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const payBusinessDebt = async (debtId) => {
    if (!confirm('¿Marcar esta deuda como pagada? Se registrará el gasto.')) return;
    
    try {
      await api.put(`/accounting/business-debt/${debtId}/pay`);
      loadDashboard();
      setMessage('✅ Deuda pagada');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error al pagar deuda:', error);
      setMessage('❌ Error al pagar deuda');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Cargando...</div>;
  }

  return (
    <div className="p-6">
      {message && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {message}
        </div>
      )}

      {/* Botones de acción rápida */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <button
          onClick={() => setShowSaleModal(true)}
          className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex flex-col items-center"
        >
          <span className="text-2xl mb-2">💰</span>
          <span className="font-semibold">Venta rápida</span>
        </button>
        
        <button
          onClick={() => setShowExpenseModal(true)}
          className="p-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex flex-col items-center"
        >
          <span className="text-2xl mb-2">💸</span>
          <span className="font-semibold">Gasto</span>
        </button>
        
        <button
          onClick={() => setShowCustomerDebtModal(true)}
          className="p-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition flex flex-col items-center"
        >
          <span className="text-2xl mb-2">📝</span>
          <span className="font-semibold">Deuda de cliente</span>
        </button>
        
        <button
          onClick={() => setShowBusinessDebtModal(true)}
          className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex flex-col items-center"
        >
          <span className="text-2xl mb-2">🏪</span>
          <span className="font-semibold">Deuda de negocio</span>
        </button>
        {/* Botón para reportes 
        <button
          onClick={() => setShowReports(true)}
          className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex flex-col items-center"
        >
          <span className="text-2xl mb-2">📊</span>
          <span className="font-semibold">Reportes</span>
        </button>*/}
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm mb-2">Hoy</h3>
          <div className="text-2xl font-bold text-green-600">
            +${dashboard?.hoy?.ingresos?.toLocaleString() || 0}
          </div>
          <div className="text-red-500">
            -${dashboard?.hoy?.gastos?.toLocaleString() || 0}
          </div>
          <div className="border-t mt-2 pt-2 font-semibold">
            Ganancia: ${dashboard?.hoy?.ganancia?.toLocaleString() || 0}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm mb-2">Esta semana</h3>
          <div className="text-2xl font-bold text-green-600">
            +${dashboard?.semana?.ingresos?.toLocaleString() || 0}
          </div>
          <div className="text-red-500">
            -${dashboard?.semana?.gastos?.toLocaleString() || 0}
          </div>
          <div className="border-t mt-2 pt-2 font-semibold">
            Ganancia: ${dashboard?.semana?.ganancia?.toLocaleString() || 0}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm mb-2">Este mes</h3>
          <div className="text-2xl font-bold text-green-600">
            +${dashboard?.mes?.ingresos?.toLocaleString() || 0}
          </div>
          <div className="text-red-500">
            -${dashboard?.mes?.gastos?.toLocaleString() || 0}
          </div>
          <div className="border-t mt-2 pt-2 font-semibold">
            Ganancia: ${dashboard?.mes?.ganancia?.toLocaleString() || 0}
          </div>
        </div>
      </div>

      {/* Deudas */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Deudas de clientes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">💰 Deudas de clientes</h3>
          <div className="text-2xl font-bold text-yellow-600 mb-4">
            Total: ${dashboard?.deudas?.clientes?.total?.toLocaleString() || 0}
          </div>
          {dashboard?.deudas?.clientes?.items?.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-auto">
              {dashboard.deudas.clientes.items.map((deuda) => (
                <div key={deuda._id} className="border-b pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{deuda.clienteNombre}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(deuda.fecha).toLocaleDateString()}
                      </p>
                      {deuda.notas && (
                        <p className="text-xs text-gray-400 mt-1">{deuda.notas}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-yellow-600">${deuda.monto.toLocaleString()}</p>
                      {deuda.fechaLimite && (
                        <p className="text-xs text-gray-400">
                          Vence: {new Date(deuda.fechaLimite).toLocaleDateString()}
                        </p>
                      )}
                      <button
                        onClick={() => payCustomerDebt(deuda._id)}
                        className="mt-2 text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        Pagar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No hay deudas pendientes</p>
          )}
        </div>
        
        {/* Deudas del negocio */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">🏢 Deudas del negocio</h3>
          <div className="text-2xl font-bold text-red-600 mb-4">
            Total: ${dashboard?.deudas?.negocio?.total?.toLocaleString() || 0}
          </div>
          {dashboard?.deudas?.negocio?.items?.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-auto">
              {dashboard.deudas.negocio.items.map((deuda) => (
                <div key={deuda._id} className="border-b pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{deuda.proveedor}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(deuda.fecha).toLocaleDateString()}
                      </p>
                      {deuda.notas && (
                        <p className="text-xs text-gray-400 mt-1">{deuda.notas}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">${deuda.monto.toLocaleString()}</p>
                      {deuda.fechaLimite && (
                        <p className="text-xs text-gray-400">
                          Vence: {new Date(deuda.fechaLimite).toLocaleDateString()}
                        </p>
                      )}
                      <button
                        onClick={() => payBusinessDebt(deuda._id)}
                        className="mt-2 text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        Pagar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No hay deudas pendientes</p>
          )}
        </div>
      </div>

      {/* Últimos movimientos */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">📋 Últimos movimientos</h3>
        <div className="text-2xl font-bold mb-4">
          Saldo en caja: ${dashboard?.caja?.saldoActual?.toLocaleString() || 0}
        </div>
        <div className="space-y-2 max-h-96 overflow-auto">
          {dashboard?.caja?.ultimosMovimientos?.length > 0 ? (
            dashboard.caja.ultimosMovimientos.map((mov) => (
              <div key={mov._id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">{mov.descripcion}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(mov.fecha).toLocaleString()}
                  </p>
                </div>
                <div className={`font-bold ${mov.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                  {mov.tipo === 'ingreso' ? '+' : '-'}${mov.monto.toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No hay movimientos registrados</p>
          )}
        </div>
      </div>

      {/* Modales */}
      <QuickSaleModal
        isOpen={showSaleModal}
        onClose={() => setShowSaleModal(false)}
        onSuccess={() => {
          setShowSaleModal(false);
          loadDashboard();
          setMessage('✅ Venta registrada correctamente');
          setTimeout(() => setMessage(''), 3000);
        }}
      />
      
      <ExpenseModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        onSuccess={() => {
          setShowExpenseModal(false);
          loadDashboard();
          setMessage('✅ Gasto registrado correctamente');
          setTimeout(() => setMessage(''), 3000);
        }}
      />
      
      <CustomerDebtModal
        isOpen={showCustomerDebtModal}
        onClose={() => setShowCustomerDebtModal(false)}
        onSuccess={() => {
          setShowCustomerDebtModal(false);
          loadDashboard();
          setMessage('✅ Deuda registrada');
          setTimeout(() => setMessage(''), 3000);
        }}
      />
      
      <BusinessDebtModal
        isOpen={showBusinessDebtModal}
        onClose={() => setShowBusinessDebtModal(false)}
        onSuccess={() => {
          setShowBusinessDebtModal(false);
          loadDashboard();
          setMessage('✅ Deuda registrada');
          setTimeout(() => setMessage(''), 3000);
        }}
      />

      <ReportsModal
        isOpen={showReports}
        onClose={() => setShowReports(false)}
      />
    </div>
  );
}