// client/src/modules/inventory/components/LowStockAlert.jsx
import { useState, useEffect } from 'react';
import { getLowStockProducts, getLowStockVariants, adjustStock, adjustVariantStock } from '../services/inventoryService';
import Button from '../../core/components/UI/Button';
import Card from '../../core/components/UI/Card';

export default function LowStockAlert() {
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustQuantity, setAdjustQuantity] = useState(0);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [reason, setReason] = useState('');
  const [itemType, setItemType] = useState('product'); // 'product' o 'variant'

  useEffect(() => {
    loadLowStock();
  }, []);

  const loadLowStock = async () => {
    try {
      const [productsData, variantsData] = await Promise.all([
        getLowStockProducts(),
        getLowStockVariants()
      ]);
      setProducts(productsData);
      setVariants(variantsData);
    } catch (error) {
      console.error('Error cargando stock bajo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustStock = async () => {
    if (!selectedItem) return;
    
    try {
      if (itemType === 'product') {
        await adjustStock(selectedItem._id, adjustQuantity, reason);
      } else {
        await adjustVariantStock(selectedItem.productId, selectedItem.variantId, adjustQuantity, reason, purchasePrice);
      }
      setSelectedItem(null);
      setAdjustQuantity(0);
      setPurchasePrice(0);
      setReason('');
      loadLowStock();
    } catch (error) {
      console.error('Error ajustando stock:', error);
      alert('Error al ajustar stock');
    }
  };

  if (loading) {
    return <Card className="p-6"><div className="animate-pulse">Cargando alertas...</div></Card>;
  }

  const totalAlerts = products.length + variants.length;

  if (totalAlerts === 0) {
    return (
      <Card className="p-6 text-center">
        <div className="text-4xl mb-2">✅</div>
        <p className="text-gray-500">No hay productos con stock bajo</p>
        <p className="text-sm text-gray-400">Todos los productos tienen stock suficiente</p>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>⚠️</span> Alertas de stock bajo
        </h3>
        
        {/* Productos normales con stock bajo */}
        {products.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">📦 Productos</h4>
            <div className="space-y-2">
              {products.map(product => (
                <div key={product._id} className="flex justify-between items-center p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">
                      Stock actual: <span className="font-bold text-yellow-700">{product.stock}</span> | 
                      Mínimo: {product.minStock || 5}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      setItemType('product');
                      setSelectedItem(product);
                    }}
                  >
                    Reponer stock
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Variantes con stock bajo */}
        {variants.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">🔄 Variantes</h4>
            <div className="space-y-2">
              {variants.map(variant => (
                <div key={`${variant.productId}-${variant.variantId}`} className="flex justify-between items-center p-3 bg-orange-50 rounded-xl border border-orange-200">
                  <div>
                    <p className="font-medium text-gray-900">{variant.productName}</p>
                    <p className="text-sm text-gray-600">
                      Variante: <span className="font-medium">{variant.variantName}</span><br />
                      Stock actual: <span className="font-bold text-orange-700">{variant.stock}</span> | 
                      Mínimo: {variant.minStock || 5}
                    </p>
                    <p className="text-xs text-gray-400">SKU: {variant.sku}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      setItemType('variant');
                      setSelectedItem(variant);
                    }}
                  >
                    Reponer stock
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Modal para reponer stock */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Reponer stock</h3>
              <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <p className="text-gray-600 mb-4">
              Producto: <strong>{itemType === 'product' ? selectedItem.name : `${selectedItem.productName} - ${selectedItem.variantName}`}</strong><br />
              Stock actual: <strong>{selectedItem.stock}</strong>
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad a agregar</label>
                <input
                  type="number"
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(parseInt(e.target.value) || 0)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Ej: 50"
                />
              </div>
              {itemType === 'variant' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio de compra (para gasto)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Ej: 25.50"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo / Proveedor</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Ej: Compra a proveedor"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="primary" onClick={handleAdjustStock} className="flex-1">
                  Agregar stock
                </Button>
                <Button variant="ghost" onClick={() => setSelectedItem(null)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}