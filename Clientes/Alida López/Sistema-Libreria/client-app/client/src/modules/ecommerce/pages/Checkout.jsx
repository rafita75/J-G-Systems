// client/src/pages/Checkout.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../../login/contexts/AuthContext';
import MainHeader from '../../core/components/Layout/MainHeader';
import Card from '../../core/components/UI/Card';
import Button from '../../core/components/UI/Button';
import Input from '../../core/components/UI/Input';
import api from '../../../shared/services/api';

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  
  // Estado de envío
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [shippingCost, setShippingCost] = useState(5000);
  
  // Estado de método de pago
  const [paymentMethod, setPaymentMethod] = useState('cash');
  
  const shippingOptions = [
    { id: 'standard', name: 'Envío estándar (3-5 días)', price: 25, icon: '🚚' },
    { id: 'express', name: 'Envío express (1 días)', price: 50, icon: '⚡' },
    { id: 'pickup', name: 'Retiro en tienda', price: 0, icon: '🏪' }
  ];
  
  // Estado de cupón
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  
  // Calcular totales
  const subtotal = cart.total;
  const finalTotal = subtotal - discount + shippingCost;

  // Cargar dirección guardada del usuario
  useEffect(() => {
    const loadUserAddress = async () => {
      if (user) {
        try {
          const { data } = await api.get('/auth/profile');
          if (data.shippingAddress) {
            setFormData(prev => ({
              ...prev,
              phone: data.shippingAddress.phone || '',
              address: data.shippingAddress.address || '',
              city: data.shippingAddress.city || '',
              zipCode: data.shippingAddress.zipCode || ''
            }));
          }
        } catch (error) {
          console.error('Error cargando dirección:', error);
        }
      }
    };
    loadUserAddress();
  }, [user]);

  // Si el carrito está vacío, redirigir
  useEffect(() => {
    if (cart.items.length === 0) {
      navigate('/catalogo');
    }
  }, [cart.items, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateStock = () => {
    for (const item of cart.items) {
      if (item.quantity > item.stock) {
        alert(`Stock insuficiente para "${item.name}". Solo hay ${item.stock} disponibles.`);
        return false;
      }
    }
    return true;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Nombre requerido';
    if (!formData.email.trim()) newErrors.email = 'Email requerido';
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.phone.trim()) newErrors.phone = 'Teléfono requerido';
    if (!formData.address.trim()) newErrors.address = 'Dirección requerida';
    if (!formData.city.trim()) newErrors.city = 'Ciudad requerida';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'Código postal requerido';
    return newErrors;
  };

  // Validar cupón
  const validateCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setCouponLoading(true);
    setCouponError('');
    
    try {
      const { data } = await api.post('/coupons/validate', {
        code: couponCode,
        subtotal: subtotal,
        userId: user?._id
      });
      
      if (data.valid) {
        setAppliedCoupon(data.coupon);
        setDiscount(data.coupon.discount);
        setCouponError('');
      }
    } catch (err) {
      setCouponError(err.response?.data?.error || 'Cupón inválido');
      setAppliedCoupon(null);
      setDiscount(0);
    } finally {
      setCouponLoading(false);
    }
  };

  // Quitar cupón
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setDiscount(0);
    setCouponError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!validateStock()) {
      return;
    }
    
    if (paymentMethod === 'transfer') {
      if (!validateTransfer()) {
        alert('❌ Error al procesar el pedido. Intenta nuevamente.');
        return;
      }
    }
    setLoading(true);
    
    try {
      // Guardar dirección si el usuario lo solicita
      if (user && saveAddress) {
        await api.put('/auth/profile', {
          shippingAddress: {
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            zipCode: formData.zipCode
          }
        });
      }
      
      // Registrar uso del cupón si se aplicó
      let finalCouponCode = null;
      let finalDiscount = 0;
      
      if (appliedCoupon) {
        try {
          const couponResponse = await api.post('/coupons/apply', {
            code: couponCode,
            subtotal: subtotal
          });
          finalCouponCode = couponResponse.data.coupon?.code || couponCode;
          finalDiscount = discount;
        } catch (err) {
          console.error('Error al registrar cupón:', err.response?.data);
          finalCouponCode = couponCode;
          finalDiscount = discount;
        }
      }
      
      const orderData = {
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode,
          notes: formData.notes
        },
        items: cart.items.map(item => ({
          productId: item.productId,
          name: item.name,
          slug: item.slug,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          variant: item.variant
        })),
        subtotal: subtotal,
        shipping: shippingCost,
        discount: finalDiscount,
        total: subtotal - finalDiscount + shippingCost,
        userId: user?._id || null,
        couponCode: finalCouponCode,
        paymentMethod: paymentMethod,
        paymentStatus: 'pending',
        status: 'pending'
      };
      
      const { data } = await api.post('/orders', orderData);
      
      clearCart();
      
      if (paymentMethod === 'transfer') {
        alert('✅ Pedido realizado. Te enviaremos los datos para la transferencia por email.');
      } else {
        alert('✅ Pedido realizado. El pago se confirmará al recibir el producto.');
      }
      
      navigate(`/pedido/confirmacion/${data.orderNumber}`);
    } catch (error) {
      console.error('Error al crear orden:', error);
      alert('❌ Error al procesar el pedido. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0) {
    return null;
  }

  return (
    <>
      <MainHeader />
      
      <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8 animate-slide-up">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Finalizar Compra</h1>
            <p className="text-gray-500">Completa tus datos para confirmar el pedido</p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Formulario */}
            <div className="flex-1">
              <Card>
                <Card.Header>
                  <h2 className="text-lg font-semibold text-gray-900">📝 Datos de envío</h2>
                </Card.Header>
                <Card.Body>
                  <form className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        label="Nombre completo"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        error={errors.name}
                        placeholder="Juan Pérez"
                        required
                      />
                      <Input
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email}
                        placeholder="juan@ejemplo.com"
                        required
                      />
                      <Input
                        label="Teléfono"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        error={errors.phone}
                        placeholder="1234-5678"
                        required
                      />
                      <Input
                        label="Código postal"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        error={errors.zipCode}
                        placeholder="01001"
                        required
                      />
                      <div className="md:col-span-2">
                        <Input
                          label="Dirección"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          error={errors.address}
                          placeholder="Calle, número, colonia"
                          required
                        />
                      </div>
                      <Input
                        label="Ciudad"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        error={errors.city}
                        placeholder="Ciudad"
                        required
                      />
                    </div>
                    
                    {user && (
                      <div className="mt-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={saveAddress}
                            onChange={(e) => setSaveAddress(e.target.checked)}
                            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-600">Guardar esta dirección para futuros pedidos</span>
                        </label>
                      </div>
                    )}
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notas adicionales</label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                        rows="3"
                        placeholder="Instrucciones de entrega, etc."
                      />
                    </div>
                  </form>
                </Card.Body>
              </Card>
            </div>
            
            {/* Resumen del pedido */}
            <div className="w-full lg:w-96">
              <Card className="sticky top-24">
                <Card.Header>
                  <h2 className="text-lg font-semibold text-gray-900">📦 Resumen del pedido</h2>
                </Card.Header>
                <Card.Body className="space-y-4">
                  {/* Productos */}
                  <div className="space-y-3 max-h-64 overflow-auto">
                    {cart.items.map((item, idx) => (
                      <div key={idx} className="flex gap-3 text-sm">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>📦</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 line-clamp-1">{item.name}</p>
                          <p className="text-gray-500 text-xs">Cantidad: {item.quantity}</p>
                        </div>
                        <p className="font-medium text-gray-800">${(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Envío */}
                  <div className="border-t border-gray-100 pt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Método de envío</label>
                    <div className="space-y-2">
                      {shippingOptions.map(opt => (
                        <label
                          key={opt.id}
                          className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition ${
                            shippingMethod === opt.id
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="shipping"
                              value={opt.id}
                              checked={shippingMethod === opt.id}
                              onChange={(e) => {
                                const option = shippingOptions.find(o => o.id === e.target.value);
                                setShippingMethod(e.target.value);
                                setShippingCost(option?.price || 0);
                              }}
                              className="text-primary-600 focus:ring-primary-500"
                            />
                            <div>
                              <p className="font-medium text-gray-800">{opt.name}</p>
                              <p className="text-xs text-gray-500">{opt.icon} Entrega estimada</p>
                            </div>
                          </div>
                          <span className="font-medium text-gray-800">${opt.price.toLocaleString()}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Método de pago */}
                  <div className="pt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Método de pago</label>
                    <div className="space-y-2">
                      <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition ${
                        paymentMethod === 'cash'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cash"
                          checked={paymentMethod === 'cash'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-primary-600 focus:ring-primary-500"
                        />
                        <div>
                          <p className="font-medium text-gray-800">💵 Efectivo contra entrega</p>
                          <p className="text-xs text-gray-500">Pagas al recibir el producto</p>
                        </div>
                      </label>
                      <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition ${
                        paymentMethod === 'transfer'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="transfer"
                          checked={paymentMethod === 'transfer'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-primary-600 focus:ring-primary-500"
                        />
                        <div>
                          <p className="font-medium text-gray-800">🏦 Transferencia bancaria</p>
                          <p className="text-xs text-gray-500">Recibirás los datos para transferir</p>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  {/* Cupón */}
                  <div className="pt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">🎟️ Cupón de descuento</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Código de cupón"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        disabled={!!appliedCoupon}
                        className="flex-1 p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      {!appliedCoupon ? (
                        <Button
                          variant="outline"
                          onClick={validateCoupon}
                          disabled={couponLoading || !couponCode}
                          className="px-4"
                        >
                          {couponLoading ? '...' : 'Aplicar'}
                        </Button>
                      ) : (
                        <Button
                          variant="danger"
                          onClick={removeCoupon}
                          className="px-4"
                        >
                          Quitar
                        </Button>
                      )}
                    </div>
                    {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
                    {appliedCoupon && (
                      <p className="text-green-600 text-xs mt-1">
                        Cupón aplicado: {appliedCoupon.name || appliedCoupon.code} - 
                        {appliedCoupon.type === 'percentage' 
                          ? `${appliedCoupon.value}% de descuento` 
                          : `$${appliedCoupon.value.toLocaleString()} de descuento`}
                      </p>
                    )}
                  </div>
                  
                  {/* Totales */}
                  <div className="border-t border-gray-100 pt-3 space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>${subtotal.toLocaleString()}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Descuento</span>
                        <span>-${discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-600">
                      <span>Envío</span>
                      <span>${shippingCost.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-gray-100 pt-2 flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary-600">${finalTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </Card.Body>
                <Card.Footer>
                  <Button
                    variant="success"
                    size="lg"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Procesando...' : '✅ Confirmar pedido'}
                  </Button>
                  <p className="text-xs text-gray-400 text-center mt-4">
                    Al confirmar, aceptas nuestros términos y condiciones.
                  </p>
                </Card.Footer>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}