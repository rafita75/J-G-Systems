// client/src/modules/inventory/components/StockMovementHistory.jsx
import { useState, useEffect } from 'react';
import { getSales, getFilteredMovements, getMovementStats } from '../services/inventoryService';
import Card from '../../core/components/UI/Card';
import Button from '../../core/components/UI/Button';

const typeLabels = {
  sale: 'Venta',
  purchase: 'Compra',
  adjustment: 'Ajuste',
  return: 'Devolución'
};

const typeColors = {
  sale: 'text-blue-600 bg-blue-50',
  purchase: 'text-green-600 bg-green-50',
  adjustment: 'text-yellow-600 bg-yellow-50',
  return: 'text-purple-600 bg-purple-50'
};

export default function StockMovementHistory() {
  const [viewMode, setViewMode] = useState('grouped');
  const [sales, setSales] = useState([]);
  const [movements, setMovements] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: ''
  });

  useEffect(() => {
    loadData();
  }, [filters, viewMode]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (viewMode === 'grouped') {
        const salesData = await getSales({ limit: 50 });
        setSales(salesData);
      } else {
        const movementsData = await getFilteredMovements(filters);
        setMovements(movementsData);
      }
      const statsData = await getMovementStats(30);
      setStats(statsData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-100 rounded"></div>
            <div className="h-16 bg-gray-100 rounded"></div>
            <div className="h-16 bg-gray-100 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      {/* Header con tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span>📋</span> Movimientos
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grouped')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'grouped' 
                ? 'bg-primary-600 text-white shadow-sm' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            📦 Por venta
          </button>
          <button
            onClick={() => setViewMode('detailed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'detailed' 
                ? 'bg-primary-600 text-white shadow-sm' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🔍 Detallado
          </button>
        </div>
      </div>

      {/* Gráfica simple */}
      {stats.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <h4 className="text-sm font-medium text-gray-700 mb-3">📊 Movimientos (últimos 30 días)</h4>
          <div className="flex items-end gap-2 h-32">
            {stats.map(day => {
              const maxValue = Math.max(...stats.map(s => s.sales + s.purchases + s.adjustments), 1);
              const salesHeight = (day.sales / maxValue) * 80;
              const purchasesHeight = (day.purchases / maxValue) * 80;
              const adjustmentsHeight = (day.adjustments / maxValue) * 80;
              
              return (
                <div key={day._id} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col gap-1 items-center">
                    {purchasesHeight > 0 && (
                      <div 
                        className="w-full bg-green-500 rounded-t transition-all hover:opacity-80"
                        style={{ height: `${purchasesHeight}px`, maxHeight: '80px' }}
                        title={`Compras: ${day.purchases}`}
                      ></div>
                    )}
                    {salesHeight > 0 && (
                      <div 
                        className="w-full bg-red-500 rounded-t transition-all hover:opacity-80"
                        style={{ height: `${salesHeight}px`, maxHeight: '80px' }}
                        title={`Ventas: ${day.sales}`}
                      ></div>
                    )}
                    {adjustmentsHeight > 0 && (
                      <div 
                        className="w-full bg-yellow-500 rounded-t transition-all hover:opacity-80"
                        style={{ height: `${adjustmentsHeight}px`, maxHeight: '80px' }}
                        title={`Ajustes: ${day.adjustments}`}
                      ></div>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 mt-2">
                    {new Date(day._id).toLocaleDateString('es', { day: '2-digit', month: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center gap-4 mt-4 text-xs">
            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded"></div> Compras</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded"></div> Ventas</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-500 rounded"></div> Ajustes</span>
          </div>
        </div>
      )}

      {/* Filtros (solo en modo detallado) */}
      {viewMode === 'detailed' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Todos los tipos</option>
            <option value="sale">Ventas</option>
            <option value="purchase">Compras</option>
            <option value="adjustment">Ajustes</option>
          </select>
        </div>
      )}
      
      {/* Lista de movimientos */}
      <div className="space-y-3 max-h-96 overflow-auto">
        {viewMode === 'grouped' ? (
          // Vista agrupada por venta
          sales.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🛒</div>
              <p>No hay ventas registradas</p>
              <p className="text-sm text-gray-400">Las ventas del POS aparecerán aquí</p>
            </div>
          ) : (
            sales.map(sale => (
              <div key={sale._id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition">
                <div className="bg-gray-50 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{sale.saleNumber}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(sale.createdAt).toLocaleString()} • {sale.clienteNombre}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary-600">Q{sale.total.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 capitalize">{sale.paymentMethod}</p>
                  </div>
                </div>
                <div className="p-4 bg-white space-y-2">
                  {sale.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <div className="flex-1">
                        <span className="text-gray-600">{item.name}</span>
                        <span className="text-gray-400 ml-2">x{item.quantity}</span>
                      </div>
                      <span className="font-medium text-gray-900">
                        Q{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )
        ) : (
          // Vista detallada por movimiento
          movements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📭</div>
              <p>No hay movimientos registrados</p>
              <p className="text-sm text-gray-400">Aplica filtros para ver más resultados</p>
            </div>
          ) : (
            movements.map(mov => (
              <div key={mov._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                <div className="flex-1 mb-2 sm:mb-0">
                  <p className="font-medium text-gray-900">{mov.productName}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-400 mt-1">
                    <span>{new Date(mov.createdAt).toLocaleString()}</span>
                    {mov.saleId && (
                      <span className="text-blue-600 font-medium">#{mov.saleId.saleNumber}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[mov.type]}`}>
                    {typeLabels[mov.type]}
                  </span>
                  <p className={`text-sm font-semibold ${mov.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity}
                  </p>
                  <p className="text-xs text-gray-400 whitespace-nowrap">
                    {mov.previousStock} → {mov.newStock}
                  </p>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </Card>
  );
}