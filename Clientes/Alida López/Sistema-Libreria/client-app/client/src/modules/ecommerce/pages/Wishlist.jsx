// client/src/pages/Wishlist.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import MainHeader from '../../core/components/Layout/MainHeader';
import Button from '../../core/components/UI/Button';
import Card from '../../core/components/UI/Card';
import api from '../../../shared/services/api';

export default function Wishlist() {
  const { wishlist, removeFromWishlist, refresh } = useWishlist();
  const { addToCart } = useCart();
  const [message, setMessage] = useState('');

  useEffect(() => {
    refresh();
  }, []);

  const handleAddToCart = (product) => {
    addToCart({
      _id: product._id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      thumbnail: product.thumbnail
    }, 1);
    setMessage('✅ Producto agregado al carrito');
    setTimeout(() => setMessage(''), 3000);
  };

  const products = wishlist.products?.filter(p => p.productId).map(p => p.productId) || [];

  if (!wishlist) return null;

  return (
    <>
      <MainHeader />
      <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8 animate-slide-up">
            <h1 className="text-3xl font-bold text-gray-900">❤️ Mi lista de deseos</h1>
            <p className="text-gray-500 mt-2">Productos que te han gustado</p>
          </div>
          
          {message && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 animate-fade-in">
              {message}
            </div>
          )}
          
          {products.length === 0 ? (
            <Card className="text-center py-12 max-w-md mx-auto">
              <div className="text-7xl mb-4">❤️</div>
              <p className="text-gray-500 mb-4">No tienes productos guardados</p>
              <Link to="/catalogo">
                <Button variant="primary">Explorar productos</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card key={product._id} className="overflow-hidden hover:shadow-medium transition-all duration-300">
                  <Link to={`/producto/${product.slug}`}>
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                      {product.thumbnail ? (
                        <img
                          src={product.thumbnail}
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="text-5xl">📦</div>
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link to={`/producto/${product.slug}`}>
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 hover:text-primary-600 transition">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-primary-600 font-bold text-lg mt-1">${product.price.toLocaleString()}</p>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleAddToCart(product)}
                        className="flex-1"
                      >
                        🛒 Carrito
                      </Button>
                      <button
                        onClick={() => removeFromWishlist(product._id)}
                        className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition"
                        title="Eliminar de lista"
                      >
                        ❤️
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}