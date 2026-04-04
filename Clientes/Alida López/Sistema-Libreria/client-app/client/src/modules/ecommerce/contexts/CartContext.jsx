// client/src/contexts/CartContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../../login/contexts/AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem('cart');
        console.log('🔄 Cargando carrito desde localStorage:', savedCart);
        
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          setCart(parsedCart);
          calculateTotal(parsedCart.items);
        }
      } catch (error) {
        console.error('Error cargando carrito:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCart();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      console.log('💾 Guardando carrito en localStorage:', cart);
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart.items, isLoading]);

  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setCart(prev => ({ ...prev, total }));
    return total;
  };

  const addToCart = (product, quantity = 1, variant = null) => {
    console.log('➕ Agregando al carrito:', { product, quantity, variant });
    
    setCart(prev => {
      const existingItemIndex = prev.items.findIndex(
        item => item.productId === product._id && item.variant === variant
      );
      
      let newItems;
      
      if (existingItemIndex !== -1) {
        const existingItem = prev.items[existingItemIndex];
        const newQuantity = existingItem.quantity + quantity;
        
        // Validar que no exceda el stock
        if (newQuantity > product.stock) {
          alert(`⚠️ Solo puedes agregar hasta ${product.stock} unidades de "${product.name}". Ya tienes ${existingItem.quantity} en el carrito.`);
          return prev;
        }
        
        newItems = [...prev.items];
        newItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity
        };
      } else {
        if (quantity > product.stock) {
          alert(`⚠️ Solo hay ${product.stock} unidades disponibles de "${product.name}"`);
          return prev;
        }
        
        newItems = [...prev.items, {
          productId: product._id,
          name: product.name,
          slug: product.slug,
          price: variant?.price || product.price,
          quantity: quantity,
          image: product.thumbnail,
          variant: variant || null,
          stock: product.stock
        }];
      }
      
      const newTotal = calculateTotal(newItems);
      
      return {
        items: newItems,
        total: newTotal
      };
    });
  };

  const removeFromCart = (productId, variant = null) => {
    console.log('🗑️ Removiendo del carrito:', { productId, variant });
    
    setCart(prev => {
      const newItems = prev.items.filter(
        item => !(item.productId === productId && item.variant === variant)
      );
      const newTotal = calculateTotal(newItems);
      
      return {
        items: newItems,
        total: newTotal
      };
    });
  };

  const updateQuantity = (productId, quantity, variant = null) => {
    if (quantity <= 0) {
      removeFromCart(productId, variant);
      return;
    }
    
    console.log('📝 Actualizando cantidad:', { productId, quantity, variant });
    
    setCart(prev => {
      const item = prev.items.find(i => i.productId === productId && i.variant === variant);
      
      // Validar que no exceda el stock
      if (item && quantity > item.stock) {
        alert(`⚠️ Solo hay ${item.stock} unidades disponibles de "${item.name}"`);
        return prev;
      }
      
      const newItems = prev.items.map(item =>
        item.productId === productId && item.variant === variant
          ? { ...item, quantity }
          : item
      );
      const newTotal = calculateTotal(newItems);
      
      return {
        items: newItems,
        total: newTotal
      };
    });
  };

  const clearCart = () => {
    console.log('🧹 Vaciar carrito');
    setCart({ items: [], total: 0 });
  };

  const getItemCount = () => {
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const syncCartWithUser = () => {
    return cart;
  };

  return (
    <CartContext.Provider value={{
      cart,
      isLoading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getItemCount,
      calculateTotal,
      syncCartWithUser
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}