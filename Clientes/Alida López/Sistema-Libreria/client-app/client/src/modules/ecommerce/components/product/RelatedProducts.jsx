// client/src/components/RelatedProducts.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../../shared/services/api';
import Card from '../../../core/components/UI/Card';

export default function RelatedProducts({ productId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productId) {
      loadRelated();
    }
  }, [productId]);

  const loadRelated = async () => {
    try {
      const { data } = await api.get(`/products/related/${productId}`);
      setProducts(data);
    } catch (error) {
      console.error('Error cargando productos relacionados:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="border-t border-gray-100 pt-8 mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">✨ Productos relacionados</h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-gray-100 pt-8 mt-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <span>✨</span> Productos relacionados
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <Link
            key={product._id}
            to={`/producto/${product.slug}`}
            className="group"
          >
            <Card className="overflow-hidden hover:shadow-medium transition-all duration-300 h-full">
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                {product.thumbnail || (product.images?.[0]?.url) ? (
                  <img
                    src={product.thumbnail || product.images?.[0]?.url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="text-4xl">📦</div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm text-gray-900 line-clamp-1 group-hover:text-primary-600 transition">
                  {product.name}
                </h3>
                <p className="text-primary-600 font-bold text-sm mt-1">
                  ${product.price.toLocaleString()}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}