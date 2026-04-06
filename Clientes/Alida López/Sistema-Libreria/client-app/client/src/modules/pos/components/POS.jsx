// client/src/modules/pos/components/POS.jsx
import { useState, useEffect, useRef } from 'react';
import { searchProducts, getProductByBarcode, getProductVariants, registerSale } from '../services/posService';
import Button from '../../core/components/UI/Button';

export default function POS({ onClose }) {
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [message, setMessage] = useState('');
  
  // Estados para el modal de variantes
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

  // Función para enviar el código de barras
  const submitBarcode = async (code) => {
    if (!code.trim()) return;

    try {
      const product = await getProductByBarcode(code);
      console.log('Producto encontrado:', product);
      
      // Si es una variante (viene de escanear código de barras de variante)
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
      // Si es producto con variantes (sin escanear variante específica)
      else if (product.hasVariants && product.variants && product.variants.length > 0) {
        setSelectedProduct(product);
        setVariants(product.variants);
        setShowVariantModal(true);
      } 
      // Producto normal sin variantes
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

  // Manejar cambio en el input de código de barras (auto-envío)
  const handleBarcodeChange = (e) => {
    const value = e.target.value;
    setBarcodeInput(value);
    
    // Limpiar timeout anterior
    if (barcodeTimeoutRef.current) {
      clearTimeout(barcodeTimeoutRef.current);
    }
    
    // Si hay texto, esperar 300ms para ver si dejaron de escribir
    if (value.trim()) {
      barcodeTimeoutRef.current = setTimeout(() => {
        submitBarcode(value);
      }, 300);
    }
  };

  // Envío manual con Enter o botón
  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    if (barcodeTimeoutRef.current) {
      clearTimeout(barcodeTimeoutRef.current);
    }
    submitBarcode(barcodeInput);
  };

  const handleProductSelect = async (product) => {
    // Si el producto tiene variantes, abrir modal
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
      // Producto sin variantes, agregar directamente
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
      // Crear un ID único para el item (considerando variante)
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
        paymentMethod,
        total: subtotal
      });

      setMessage(`✅ Venta realizada exitosamente. Total: Q${subtotal.toLocaleString()}`);
      setCart([]);
      setClienteNombre('');
      setClienteTelefono('');
      
      setTimeout(() => {
        setMessage('');
        onClose?.();
      }, 3000);
    } catch (error) {
      console.error('Error al procesar venta:', error);
      setMessage(error.response?.data?.error || '❌ Error al procesar la venta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-auto shadow-hard animate-scale-in">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">💰 Punto de Venta (POS)</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        {message && (
          <div className={`m-4 p-3 rounded-xl ${message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message}
          </div>
        )}

        <div className="p-4 grid lg:grid-cols-3 gap-6">
          {/* Panel izquierdo */}
          <div className="lg:col-span-2 space-y-4">
            <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
              <input
                ref={barcodeRef}
                type="text"
                placeholder="📷 Escanea o escribe código de barras..."
                value={barcodeInput}
                onChange={handleBarcodeChange}
                className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                autoFocus
              />
              <Button type="submit" variant="primary" size="sm">Agregar</Button>
            </form>

            <input
              type="text"
              placeholder="🔍 Buscar producto por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-auto">
              {products.map(product => (
                <div
                  key={product._id}
                  onClick={() => handleProductSelect(product)}
                  className="p-3 border rounded-xl cursor-pointer hover:bg-gray-50 hover:border-primary-300 transition"
                >
                  <div className="font-medium text-gray-900 truncate">
                    {product.name}
                    {product.hasVariants && <span className="ml-1 text-xs text-blue-500">🔄</span>}
                  </div>
                  <div className="text-primary-600 font-bold">${product.price}</div>
                  <div className="text-xs text-gray-400">Stock: {product.stock}</div>
                  {product.hasVariants && (
                    <div className="text-xs text-blue-500 mt-1">+ Variantes disponibles</div>
                  )}
                </div>
              ))}
              {products.length === 0 && searchTerm.length >= 2 && (
                <p className="text-gray-400 col-span-full text-center py-4">No se encontraron productos</p>
              )}
            </div>
          </div>

          {/* Panel derecho - Carrito */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-4">🛒 Carrito</h3>
            
            <div className="space-y-2 max-h-80 overflow-auto mb-4">
              {cart.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Carrito vacío</p>
              ) : (
                cart.map(item => (
                  <div key={item.itemKey} className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-primary-600">${item.price}</p>
                        {item.sku && <p className="text-xs text-gray-400">SKU: {item.sku}</p>}
                      </div>
                      <button onClick={() => removeFromCart(item.itemKey)} className="text-gray-400 hover:text-red-500">🗑️</button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(item.itemKey, item.quantity - 1)} className="w-7 h-7 bg-gray-100 rounded-lg hover:bg-gray-200">-</button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.itemKey, item.quantity + 1)} className="w-7 h-7 bg-gray-100 rounded-lg hover:bg-gray-200">+</button>
                      </div>
                      <span className="font-semibold">${(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t pt-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary-600">${subtotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <input
                type="text"
                placeholder="Nombre del cliente (opcional)"
                value={clienteNombre}
                onChange={(e) => setClienteNombre(e.target.value)}
                className="w-full p-2 border rounded-lg text-sm"
              />
              <input
                type="tel"
                placeholder="Teléfono (opcional)"
                value={clienteTelefono}
                onChange={(e) => setClienteTelefono(e.target.value)}
                className="w-full p-2 border rounded-lg text-sm"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Método de pago</label>
              <div className="grid grid-cols-3 gap-2">
                {['efectivo', 'transferencia', 'tarjeta'].map(met => (
                  <button
                    key={met}
                    onClick={() => setPaymentMethod(met)}
                    className={`p-2 rounded-lg text-sm font-medium transition ${
                      paymentMethod === met ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {met === 'efectivo' ? '💵 Efectivo' : met === 'transferencia' ? '🏦 Transferencia' : '💳 Tarjeta'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="success" onClick={handleCheckout} loading={loading} disabled={cart.length === 0} className="flex-1">💰 Cobrar</Button>
              <Button variant="danger" onClick={() => setCart([])} disabled={cart.length === 0}>🗑️ Vaciar</Button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL PARA SELECCIONAR VARIANTE */}
      {showVariantModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-auto shadow-hard animate-scale-in">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Selecciona una variante
              </h3>
              <button
                onClick={() => setShowVariantModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <p className="text-gray-600 mb-4">
                Producto: <span className="font-semibold">{selectedProduct.name}</span>
              </p>
              <div className="space-y-2">
                {variants.map((variant) => (
                  <div
                    key={variant._id}
                    onClick={() => addVariantToCart(variant)}
                    className="p-3 border rounded-xl cursor-pointer hover:bg-gray-50 hover:border-primary-300 transition flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{variant.name}</div>
                      <div className="text-xs text-gray-400">SKU: {variant.sku}</div>
                      <div className="text-xs text-gray-400">Stock: {variant.stock}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-primary-600 font-bold text-lg">${variant.price}</div>
                      <button className="mt-1 px-3 py-1 bg-primary-600 text-white text-xs rounded-lg">
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