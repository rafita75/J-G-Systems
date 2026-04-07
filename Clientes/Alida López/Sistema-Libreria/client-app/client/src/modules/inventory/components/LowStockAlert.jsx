// client/src/modules/inventory/components/LowStockAlert.jsx
import { useState, useEffect } from 'react';
import { getLowStockProducts, getLowStockVariants, adjustStock, adjustVariantStock } from '../services/inventoryService';
import Button from '../../core/components/UI/Button';

export default function LowStockAlert() {
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustQuantity, setAdjustQuantity] = useState(0);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [reason, setReason] = useState('');
  const [itemType, setItemType] = useState('product');

  useEffect(() => {
    loadLowStock();
  }, []);

  const loadLowStock = async () => {
    try {
      const [productsData, variantsData] = await Promise.all([
        getLowStockProducts(),
        getLowStockVariants()
      ]);
      
      const filteredProducts = productsData.filter(p => !p.hasVariants);
      setProducts(filteredProducts);
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
        await adjustStock(selectedItem._id, adjustQuantity, reason, purchasePrice);
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
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse">Cargando alertas...</div>
      </div>
    );
  }

  const totalAlerts = products.length + variants.length;

  if (totalAlerts === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
        <div className="text-5xl mb-3">✅</div>
        <p className="text-gray-500">No hay productos con stock bajo</p>
        <p className="text-sm text-gray-400 mt-1">Todos los productos tienen stock suficiente</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-yellow-500 rounded-full"></span>
          ⚠️ Alertas de stock bajo
        </h3>
        
        {products.length > 0 && (
          <div className="mb-5">
            <h4 className="text-sm font-medium text-gray-600 mb-3">📦 Productos sin variantes</h4>
            <div className="space-y-2">
              {products.map(product => (
                <div key={product._id} className="flex justify-between items-center p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                  <div>
                    <p className="font-medium text-gray-800">{product.name}</p>
                    <p className="text-sm text-gray-500">
                      Stock: <span className="font-bold text-yellow-700">{product.stock}</span> | 
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
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
                  >
                    Reponer
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {variants.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-3">🔄 Variantes con stock bajo</h4>
            <div className="space-y-2">
              {variants.map(variant => (
                <div key={`${variant.productId}-${variant.variantId}`} className="flex justify-between items-center p-3 bg-orange-50 rounded-xl border border-orange-100">
                  <div>
                    <p className="font-medium text-gray-800">{variant.productName}</p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">{variant.variantName}</span><br />
                      Stock: <span className="font-bold text-orange-700">{variant.stock}</span> | 
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
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                  >
                    Reponer
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">📦 Reponer stock</h3>
              <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-gray-600 transition">
                ✕
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Producto: <strong className="text-gray-800">{itemType === 'product' ? selectedItem.name : `${selectedItem.productName} - ${selectedItem.variantName}`}</strong><br />
              Stock actual: <strong className="text-yellow-600">{selectedItem.stock}</strong>
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad a agregar *</label>
                <input
                  type="number"
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(parseInt(e.target.value) || 0)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ej: 50"
                  autoFocus
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
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ej: 25.50"
                  />
                  <p className="text-xs text-gray-400 mt-1">💰 Se registrará automáticamente como gasto</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo / Proveedor</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ej: Compra a proveedor"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="primary" onClick={handleAdjustStock} className="flex-1 bg-gradient-to-r from-green-600 to-green-700">
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