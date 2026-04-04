// client/src/pages/Cart.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../../login/contexts/AuthContext';
import { useModules } from '../../core/contexts/ModuleContext';
import MainHeader from '../../core/components/Layout/MainHeader';
import Card from '../../core/components/UI/Card';
import Button from '../../core/components/UI/Button';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, getItemCount } = useCart();
  const { user } = useAuth();
  const { hasModule } = useModules();
  const navigate = useNavigate();
  const loginEnabled = hasModule('login');
  const hasEcommerce = hasModule('ecommerce');

  const handleCheckout = () => {
    if (loginEnabled && !user) {
      if (confirm('Debes iniciar sesión para continuar. ¿Ir al login?')) {
        navigate('/login');
      }
      return;
    }
    navigate('/checkout');
  };

  if (!hasEcommerce) {
    return (
      <>
        <MainHeader />
        <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="container mx-auto px-4 py-8">
            <Card className="text-center p-8">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Módulo no disponible</h2>
              <p className="text-gray-500">El ecommerce no está activo en este sitio.</p>
            </Card>
          </div>
        </div>
      </>
    );
  }

  if (cart.items.length === 0) {
    return (
      <>
        <MainHeader />
        <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="container mx-auto px-4 py-8">
            <Card className="text-center p-12 animate-fade-in">
              <div className="text-7xl mb-4">🛒</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Tu carrito está vacío</h2>
              <p className="text-gray-500 mb-6">¡Agrega algunos productos para comenzar!</p>
              <Link to="/catalogo">
                <Button variant="primary" size="lg">
                  🛍️ Ver productos
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </>
    );
  }

  const subtotal = cart.total;
  const shipping = 0;
  const total = subtotal + shipping;

  return (
    <>
      <MainHeader />
      
      <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8 animate-slide-up">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Mi Carrito</h1>
            <p className="text-gray-500">{getItemCount()} {getItemCount() === 1 ? 'producto' : 'productos'} agregados</p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Lista de productos */}
            <div className="flex-1">
              <Card className="overflow-hidden">
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-100 text-sm font-medium text-gray-600">
                  <div className="col-span-6">Producto</div>
                  <div className="col-span-2 text-center">Precio</div>
                  <div className="col-span-2 text-center">Cantidad</div>
                  <div className="col-span-1 text-center">Subtotal</div>
                  <div className="col-span-1 text-center"></div>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {cart.items.map((item, idx) => (
                    <div key={idx} className="p-4 md:p-6 hover:bg-gray-50 transition">
                      <div className="flex flex-col md:grid md:grid-cols-12 gap-4 items-center">
                        {/* Producto */}
                        <div className="flex gap-4 items-center md:col-span-6 w-full">
                          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-3xl">📦</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <Link to={`/producto/${item.slug}`} className="font-semibold text-gray-900 hover:text-primary-600 transition line-clamp-2">
                              {item.name}
                            </Link>
                            {item.variant && (
                              <p className="text-sm text-gray-500 mt-1">Variante: {item.variant}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">Stock disponible: {item.stock}</p>
                          </div>
                        </div>
                        
                        {/* Precio */}
                        <div className="md:col-span-2 text-center">
                          <span className="font-medium text-gray-900">${item.price.toLocaleString()}</span>
                        </div>
                        
                        {/* Cantidad */}
                        <div className="md:col-span-2">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variant)}
                              className="w-8 h-8 bg-gray-100 rounded-lg hover:bg-gray-200 transition flex items-center justify-center text-lg font-medium"
                            >
                              -
                            </button>
                            <span className="w-12 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => {
                                if (item.quantity >= item.stock) {
                                  alert(`⚠️ Solo hay ${item.stock} unidades disponibles de "${item.name}"`);
                                  return;
                                }
                                updateQuantity(item.productId, item.quantity + 1, item.variant);
                              }}
                              className="w-8 h-8 bg-gray-100 rounded-lg hover:bg-gray-200 transition flex items-center justify-center text-lg font-medium"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        
                        {/* Subtotal */}
                        <div className="md:col-span-1 text-center">
                          <span className="font-semibold text-primary-600">
                            ${(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                        
                        {/* Eliminar */}
                        <div className="md:col-span-1 text-center">
                          <button
                            onClick={() => removeFromCart(item.productId, item.variant)}
                            className="text-gray-400 hover:text-red-500 transition p-2"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Resumen del pedido */}
            <div className="w-full lg:w-96">
              <Card className="sticky top-24">
                <Card.Header>
                  <h3 className="text-lg font-semibold text-gray-900">📋 Resumen del pedido</h3>
                </Card.Header>
                <Card.Body className="space-y-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium">${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Envío</span>
                    <span className="text-green-600">Por calcular</span>
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary-600">${total.toLocaleString()}</span>
                    </div>
                  </div>
                </Card.Body>
                <Card.Footer>
                  <Button
                    variant="success"
                    size="lg"
                    onClick={handleCheckout}
                    className="w-full"
                  >
                    ✅ Proceder al pago
                  </Button>
                  <Link to="/catalogo" className="block text-center text-primary-600 hover:text-primary-700 text-sm mt-4">
                    ← Seguir comprando
                  </Link>
                </Card.Footer>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}