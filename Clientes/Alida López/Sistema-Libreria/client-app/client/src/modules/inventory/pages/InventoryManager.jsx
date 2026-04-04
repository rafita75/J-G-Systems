// client/src/modules/inventory/pages/InventoryManager.jsx
import InventorySummary from '../components/InventorySummary';
import LowStockAlert from '../components/LowStockAlert';
import StockMovementHistory from '../components/StockMovementHistory';

export default function InventoryManager() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span>📦</span> Inventario
        </h1>
        <p className="text-gray-500 mt-1">Control de stock y alertas</p>
      </div>
      
      <InventorySummary />
      <LowStockAlert />
      <StockMovementHistory />
    </div>
  );
}