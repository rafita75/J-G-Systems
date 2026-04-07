// client/src/modules/pos/components/POS.jsx
import { useState, useEffect, useRef } from 'react';
import { searchProducts, getProductByBarcode, getProductVariants, registerSale } from '../services/posService';
import Button from '../../core/components/UI/Button';

export default function POS({ onClose, onSaleComplete }) {
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [isDebt, setIsDebt] = useState(false);
  const [message, setMessage] = useState('');
  
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  
  const barcodeRef = useRef(null);
  const barcodeTimeoutRef = useRef(null);

  useEffect(() => {
    if (barcodeRef.current) {
      barcodeRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const searchProductsDebounced = setTimeout(async () => {
      if (searchTerm.length >= 2) {
        try {
          const data = await searchProducts(searchTerm);
          setProducts(data);
        } catch (error) {
          console.error('Error buscando productos:', error);
        }
      } else {
        setProducts([]);
      }
    }, 300);

    return () => clearTimeout(searchProductsDebounced);
  }, [searchTerm]);

  const submitBarcode = async (code) => {
    if (!code.trim()) return;

    try {
      const product = await getProductByBarcode(code);
      
      if (product.isVariant) {
        addToCart({
          productId: product.parentProductId,
          name: product.name,
          price: product.price,
          stock: product.stock,
          variantId: product.variantId,
          variantName: product.name.split(' - ')[1] || product.name,
          sku: product.sku
        });
      } 
      else if (product.hasVariants && product.variants && product.variants.length > 0) {
        setSelectedProduct(product);
        setVariants(product.variants);
        setShowVariantModal(true);
      } 
      else {
        addToCart({
          productId: product._id,
          name: product.name,
          price: product.price,
          stock: product.stock,
          variantId: null,
          variantName: null
        });
      }
      
      setBarcodeInput('');
      if (barcodeRef.current) {
        barcodeRef.current.focus();
      }
    } catch (error) {
      if (error.response?.status === 404) {
        alert('Producto no encontrado');
      } else {
        alert('Error al buscar producto');
      }
      setBarcodeInput('');
      if (barcodeRef.current) {
        barcodeRef.current.focus();
      }
    }
  };

  const handleBarcodeChange = (e) => {
    const value = e.target.value;
    setBarcodeInput(value);
    
    if (barcodeTimeoutRef.current) {
      clearTimeout(barcodeTimeoutRef.current);
    }
    
    if (value.trim()) {
      barcodeTimeoutRef.current = setTimeout(() => {
        submitBarcode(value);
      }, 300);
    }
  };

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    if (barcodeTimeoutRef.current) {
      clearTimeout(barcodeTimeoutRef.current);
    }
    submitBarcode(barcodeInput);
  };

  const handleProductSelect = async (product) => {
    if (product.hasVariants) {
      try {
        const data = await getProductVariants(product._id);
        setSelectedProduct(data.product);
        setVariants(data.variants);
        setShowVariantModal(true);
      } catch (error) {
        console.error('Error al cargar variantes:', error);
        alert('Error al cargar las variantes');
      }
    } else {
      addToCart({
        productId: product._id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        variantId: null,
        variantName: null
      });
    }
  };

  const addVariantToCart = (variant) => {
    addToCart({
      productId: selectedProduct._id,
      name: `${selectedProduct.name} - ${variant.name}`,
      price: variant.price,
      stock: variant.stock,
      variantId: variant._id,
      variantName: variant.name,
      sku: variant.sku
    });
    setShowVariantModal(false);
    setSelectedProduct(null);
    setVariants([]);
  };

  const addToCart = (item) => {
    if (item.stock < 1) {
      alert(`⚠️ Stock insuficiente. No hay unidades disponibles.`);
      return;
    }

    setCart(prev => {
      const itemKey = item.variantId ? `${item.productId}-${item.variantId}` : item.productId;
      const existing = prev.find(i => i.itemKey === itemKey);
      
      if (existing) {
        if (existing.quantity + 1 > item.stock) {
          alert(`⚠️ Solo puedes agregar hasta ${item.stock} unidades.`);
          return prev;
        }
        return prev.map(i =>
          i.itemKey === itemKey
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, {
        itemKey,
        productId: item.productId,
        variantId: item.variantId,
        name: item.name,
        price: item.price,
        quantity: 1,
        stock: item.stock,
        sku: item.sku
      }];
    });
  };

  const removeFromCart = (itemKey) => {
    setCart(prev => prev.filter(item => item.itemKey !== itemKey));
  };

  const updateQuantity = (itemKey, quantity) => {
    const item = cart.find(i => i.itemKey === itemKey);
    if (quantity > item.stock) {
      alert(`⚠️ Solo hay ${item.stock} unidades disponibles.`);
      return;
    }
    if (quantity <= 0) {
      removeFromCart(itemKey);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.itemKey === itemKey ? { ...item, quantity } : item
      )
    );
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Agrega productos al carrito');
      return;
    }

    if (isDebt && !clienteNombre.trim()) {
      alert('⚠️ Para registrar una venta a crédito, debe ingresar el nombre del cliente');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await registerSale({
        items: cart.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          sku: item.sku
        })),
        clienteNombre,
        clienteTelefono,
        paymentMethod: isDebt ? 'efectivo' : paymentMethod,
        total: subtotal,
        esDeuda: isDebt
      });

      setMessage(`✅ Venta ${isDebt ? 'a crédito' : 'realizada'} exitosamente. Total: Q${subtotal.toLocaleString()}`);
      setCart([]);
      setClienteNombre('');
      setClienteTelefono('');
      setIsDebt(false);
      setPaymentMethod('efectivo');
      
      if (onSaleComplete) {
        onSaleComplete();
      }
      
      setTimeout(() => {
        setMessage('');
        if (typeof onClose === 'function') {
          onClose();
        }
      }, 2000);
    } catch (error) {
      console.error('Error al procesar venta:', error);
      setMessage(error.response?.data?.error || '❌ Error al procesar la venta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-auto shadow-xl animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="w-1 h-5 bg-green-600 rounded-full"></span>
            💰 Punto de Venta
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition p-2 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {message && (
          <div className={`m-4 p-3 rounded-xl ${message.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message}
          </div>
        )}

        <div className="p-6 grid lg:grid-cols-3 gap-6">
          {/* Panel izquierdo */}
          <div className="lg:col-span-2 space-y-4">
            <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
              <input
                ref={barcodeRef}
                type="text"
                placeholder="📷 Escanea o escribe código de barras..."
                value={barcodeInput}
                onChange={handleBarcodeChange}
                className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 font-mono"
                autoFocus
              />
              <Button type="submit" variant="primary" size="sm" className="bg-gradient-to-r from-green-600 to-green-700">
                Agregar
              </Button>
            </form>

            <input
              type="text"
              placeholder="🔍 Buscar producto por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-auto">
              {products.map(product => (
                <div
                  key={product._id}
                  onClick={() => handleProductSelect(product)}
                  className="p-4 border border-gray-100 rounded-xl cursor-pointer hover:border-green-300 hover:shadow-md transition-all"
                >
                  <div className="font-medium text-gray-800 truncate flex items-center justify-between">
                    {product.name}
                    {product.hasVariants && <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">🔄</span>}
                  </div>
                  <div className="text-green-600 font-bold mt-1">${product.price}</div>
                  <div className="text-xs text-gray-400 mt-1">Stock: {product.stock}</div>
                  {product.hasVariants && (
                    <div className="text-xs text-green-500 mt-2">+ Variantes disponibles</div>
                  )}
                </div>
              ))}
              {products.length === 0 && searchTerm.length >= 2 && (
                <p className="text-gray-400 col-span-full text-center py-8">No se encontraron productos</p>
              )}
            </div>
          </div>

          {/* Panel derecho - Carrito */}
          <div className="bg-gray-50 rounded-2xl p-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-green-500 rounded-full"></span>
              🛒 Carrito
            </h3>
            
            <div className="space-y-2 max-h-80 overflow-auto mb-4">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-5xl mb-3">🛒</div>
                  <p>Carrito vacío</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.itemKey} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-sm text-green-600">${item.price}</p>
                        {item.sku && <p className="text-xs text-gray-400">SKU: {item.sku}</p>}
                      </div>
                      <button onClick={() => removeFromCart(item.itemKey)} className="text-gray-400 hover:text-red-500 transition p-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(item.itemKey, item.quantity - 1)} className="w-7 h-7 bg-gray-100 rounded-lg hover:bg-gray-200 transition">-</button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.itemKey, item.quantity + 1)} className="w-7 h-7 bg-gray-100 rounded-lg hover:bg-gray-200 transition">+</button>
                      </div>
                      <span className="font-semibold text-gray-800">${(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-600">Total</span>
                <span className="text-green-600">${subtotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <input
                type="text"
                placeholder="Nombre del cliente (requerido para crédito)"
                value={clienteNombre}
                onChange={(e) => setClienteNombre(e.target.value)}
                className={`w-full p-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${isDebt ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}`}
              />
              <input
                type="tel"
                placeholder="Teléfono (opcional)"
                value={clienteTelefono}
                onChange={(e) => setClienteTelefono(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de venta</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setIsDebt(false);
                    setPaymentMethod('efectivo');
                  }}
                  className={`py-3 rounded-xl text-sm font-medium transition-all ${
                    !isDebt ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  💵 Efectivo
                </button>
                <button
                  onClick={() => setIsDebt(true)}
                  className={`py-3 rounded-xl text-sm font-medium transition-all ${
                    isDebt ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  📝 Crédito
                </button>
              </div>
            </div>

            {isDebt && (
              <div className="mt-3 p-3 bg-yellow-50 rounded-xl text-xs text-yellow-700 text-center border border-yellow-200">
                ⚠️ Esta venta se registrará como deuda de cliente. No afecta la caja.
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <Button 
                variant="success" 
                onClick={handleCheckout} 
                loading={loading} 
                disabled={cart.length === 0} 
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700"
              >
                {isDebt ? '📝 Registrar Crédito' : '💰 Cobrar'}
              </Button>
              <Button variant="danger" onClick={() => setCart([])} disabled={cart.length === 0} className="bg-red-500 hover:bg-red-600">
                🗑️ Vaciar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL PARA SELECCIONAR VARIANTE */}
      {showVariantModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-auto shadow-xl animate-scale-in">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <span className="w-1 h-4 bg-green-500 rounded-full"></span>
                Selecciona una variante
              </h3>
              <button onClick={() => setShowVariantModal(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <div className="p-5">
              <p className="text-gray-600 mb-4">
                Producto: <span className="font-semibold text-gray-800">{selectedProduct.name}</span>
              </p>
              <div className="space-y-3">
                {variants.map((variant) => (
                  <div
                    key={variant._id}
                    onClick={() => addVariantToCart(variant)}
                    className="p-4 border border-gray-100 rounded-xl cursor-pointer hover:border-green-300 hover:shadow-md transition-all flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium text-gray-800">{variant.name}</div>
                      <div className="text-xs text-gray-400 mt-1">SKU: {variant.sku}</div>
                      <div className="text-xs text-gray-400">Stock: {variant.stock}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-600 font-bold text-lg">${variant.price}</div>
                      <button className="mt-2 px-4 py-1.5 bg-gradient-to-r from-green-600 to-green-700 text-white text-xs rounded-lg">
                        Agregar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}