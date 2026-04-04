// client/src/pages/Catalog.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../../../shared/services/productService';
import { getCategories } from '../../../shared/services/categoryService';
import MainHeader from '../../core/components/Layout/MainHeader';
import Card from '../../core/components/UI/Card';
import Button from '../../core/components/UI/Button';
import Input from '../../core/components/UI/Input';

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadData();
  }, [selectedCategory, searchTerm, currentPage]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        getProducts({
          category: selectedCategory,
          search: searchTerm,
          page: currentPage,
          limit: 12
        }),
        getCategories()
      ]);
      setProducts(productsData.products);
      setTotalPages(productsData.pagination?.pages || 1);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error cargando catálogo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadData();
  };

  if (loading) {
    return (
      <>
        <MainHeader />
        <div className="pt-20 min-h-screen flex items-center justify-center">
          <div className="text-xl text-gray-500 animate-pulse">Cargando productos...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <MainHeader />
      
      <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8 animate-slide-up">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Nuestros Productos</h1>
            <p className="text-gray-500">Descubre lo que tenemos para ti</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar - Filtros */}
            <aside className="w-full lg:w-72 flex-shrink-0">
              <Card>
                <Card.Header>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <span>🏷️</span> Categorías
                  </h3>
                </Card.Header>
                <Card.Body className="p-2">
                  <button
                    onClick={() => handleCategoryChange('')}
                    className={`w-full text-left px-4 py-2.5 rounded-xl transition-all duration-200 mb-1 ${
                      selectedCategory === '' 
                        ? 'bg-primary-600 text-white shadow-soft' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    📦 Todos los productos
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => handleCategoryChange(cat._id)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl transition-all duration-200 mb-1 ${
                        selectedCategory === cat._id 
                          ? 'bg-primary-600 text-white shadow-soft' 
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </Card.Body>
              </Card>
            </aside>

            {/* Main content */}
            <div className="flex-1">
              {/* Barra de búsqueda */}
              <form onSubmit={handleSearch} className="mb-8">
                <div className="flex gap-3">
                  <Input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                    icon="🔍"
                  />
                  <Button type="submit" variant="primary">
                    Buscar
                  </Button>
                </div>
              </form>

              {/* Grid de productos */}
              {products.length === 0 ? (
                <Card className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-gray-500 text-lg">No se encontraron productos</p>
                  <Button variant="outline" className="mt-4" onClick={() => setSearchTerm('')}>
                    Limpiar búsqueda
                  </Button>
                </Card>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <Link
                        key={product._id}
                        to={`/producto/${product.slug}`}
                        className="group"
                      >
                        <Card className="overflow-hidden hover:shadow-hard transition-all duration-300 h-full">
                          <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                            {product.thumbnail ? (
                              <img
                                src={product.thumbnail}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-6xl">
                                📦
                              </div>
                            )}
                            {product.comparePrice > product.price && (
                              <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                -{Math.round((product.comparePrice - product.price) / product.comparePrice * 100)}%
                              </span>
                            )}
                            {product.stock === 0 && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="bg-white text-red-600 px-3 py-1 rounded-full text-sm font-bold">
                                  Agotado
                                </span>
                              </div>
                            )}
                          </div>
                          <Card.Body>
                            {product.categoryId && (
                              <p className="text-xs text-primary-500 mb-1">{product.categoryId.name}</p>
                            )}
                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-primary-600 transition">
                              {product.name}
                            </h3>
                            <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                              {product.shortDescription || product.description?.substring(0, 80)}
                            </p>
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-2xl font-bold text-primary-600">
                                  ${product.price.toLocaleString()}
                                </span>
                                {product.comparePrice > product.price && (
                                  <span className="text-sm text-gray-400 line-through ml-2">
                                    ${product.comparePrice.toLocaleString()}
                                  </span>
                                )}
                              </div>
                              <Button size="sm" variant="primary" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                Ver más
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Link>
                    ))}
                  </div>

                  {/* Paginación */}
                  {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-10">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        ← Anterior
                      </Button>
                      <div className="flex items-center gap-1">
                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-10 h-10 rounded-xl font-medium transition ${
                                currentPage === pageNum
                                  ? 'bg-primary-600 text-white shadow-soft'
                                  : 'bg-white text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Siguiente →
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}