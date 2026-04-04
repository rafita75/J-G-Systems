// client/src/modules/inventory/components/StockMovementHistory.jsx
import { useState, useEffect } from 'react';
import { getStockMovements } from '../services/inventoryService';
import Card from '../../core/components/UI/Card';

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
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMovements();
  }, []);

  const loadMovements = async () => {
    try {
      const data = await getStockMovements({ limit: 20 });
      setMovements(data);
    } catch (error) {
      console.error('Error cargando historial:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Card className="p-6"><div className="animate-pulse">Cargando historial...</div></Card>;
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span>📋</span> Últimos movimientos
      </h3>
      {movements.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No hay movimientos registrados</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-auto">
          {movements.map(mov => (
            <div key={mov._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{mov.productName}</p>
                <p className="text-xs text-gray-400">
                  {new Date(mov.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[mov.type]}`}>
                  {typeLabels[mov.type]}
                </span>
                <p className={`text-sm font-semibold mt-1 ${mov.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity}
                </p>
                <p className="text-xs text-gray-400">
                  {mov.previousStock} → {mov.newStock}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}