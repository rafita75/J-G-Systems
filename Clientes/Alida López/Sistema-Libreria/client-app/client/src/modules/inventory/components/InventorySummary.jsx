// client/src/modules/inventory/components/InventorySummary.jsx
import { useState, useEffect } from 'react';
import { getInventorySummary } from '../services/inventoryService';
import Card from '../../core/components/UI/Card';

export default function InventorySummary() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const data = await getInventorySummary();
      setSummary(data);
    } catch (error) {
      console.error('Error cargando resumen:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  const items = [
    { label: 'Total productos', value: summary?.totalProducts || 0, icon: '📦', color: 'blue' },
    { label: 'Stock bajo', value: summary?.lowStockProducts || 0, icon: '⚠️', color: 'yellow' },
    { label: 'Agotados', value: summary?.outOfStock || 0, icon: '❌', color: 'red' },
    { label: 'Valor inventario', value: `Q${summary?.totalValue?.toLocaleString() || 0}`, icon: '💰', color: 'green' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {items.map((item, idx) => (
        <Card key={idx} className="p-4 text-center hover:shadow-medium transition">
          <div className="text-3xl mb-2">{item.icon}</div>
          <p className="text-2xl font-bold text-gray-900">{item.value}</p>
          <p className="text-sm text-gray-500">{item.label}</p>
        </Card>
      ))}
    </div>
  );
}