// client/src/pages/Admin/ProductsManager.jsx
import { useState, useEffect } from 'react';
import { getAdminProducts, deleteProduct } from '../../../shared/services/productService';
import { getCategories } from '../../../shared/services/categoryService';
import ProductForm from './ProductForm';
import Button from '../../core/components/UI/Button';
import Card from '../../core/components/UI/Card';

export default function ProductsManager() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        getAdminProducts(),
        getCategories()
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await deleteProduct(id);
      setMessage('✅ Producto eliminado');
      loadData();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error al eliminar');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span>📦</span> Productos
        </h2>
        <Button variant="primary" onClick={() => {
          setEditingProduct(null);
          setShowForm(true);
        }}>
          + Nuevo Producto
        </Button>
      </div>

      {message && (
        <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 animate-fade-in">
          {message}
        </div>
      )}

      {showForm && (
        <div className="animate-fade-in">
          <ProductForm
            product={editingProduct}
            categories={categories}
            onSuccess={() => {
              setShowForm(false);
              setEditingProduct(null);
              loadData();
            }}
            onCancel={() => {
              setShowForm(false);
              setEditingProduct(null);
            }}
          />
        </div>
      )}

      {/* Lista de productos - Tarjetas en móvil, tabla en desktop */}
      <div className="block lg:hidden space-y-3">
        {products.map((product) => (
          <Card key={product._id} className="p-4">
            <div className="flex gap-4">
              <div className="w-20 h-20 flex-shrink-0">
                {product.thumbnail ? (
                  <img 
                    src={product.thumbnail} 
                    alt={product.name} 
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                    📦
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-xs text-gray-400">SKU: {product.sku || '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary-600">${product.price.toLocaleString()}</p>
                    <span className={`badge ${product.stock > 0 ? 'badge-success' : 'badge-danger'} text-xs`}>
                      {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.categoryId && (
                    <span className="badge badge-neutral text-xs">{product.categoryId.name}</span>
                  )}
                  {product.isFeatured && (
                    <span className="badge badge-warning text-xs">⭐ Destacado</span>
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingProduct(product);
                      setShowForm(true);
                    }}
                    className="flex-1"
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(product._id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabla desktop */}
      <div className="hidden lg:block bg-white rounded-xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Imagen</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Producto</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Categoría</th>
                <th className="p-4 text-right text-sm font-semibold text-gray-600">Precio</th>
                <th className="p-4 text-center text-sm font-semibold text-gray-600">Stock</th>
                <th className="p-4 text-center text-sm font-semibold text-gray-600">Acciones</th>
               </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition">
                    <td className="p-4">
                      {product.thumbnail ? (
                        <img 
                          src={product.thumbnail} 
                          alt={product.name} 
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                          📦
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">SKU: {product.sku || '—'}</div>
                      {product.isFeatured && (
                        <span className="badge badge-warning text-xs mt-1">⭐ Destacado</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="badge badge-neutral">
                        {product.categoryId?.name || 'Sin categoría'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-semibold text-primary-600">${product.price.toLocaleString()}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`badge ${product.stock > 0 ? 'badge-success' : 'badge-danger'}`}>
                        {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setShowForm(true);
                          }}
                          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Eliminar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {products.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No hay productos creados. Haz clic en "Nuevo Producto" para comenzar.
            </div>
          )}
        </div>
      </div>
  );
}