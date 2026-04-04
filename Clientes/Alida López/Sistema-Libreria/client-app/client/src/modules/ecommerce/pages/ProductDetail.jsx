// client/src/pages/ProductDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductBySlug } from '../../../shared/services/productService';
import { useAuth } from '../../login/contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useModules } from '../../core/contexts/ModuleContext';
import MainHeader from '../../core/components/Layout/MainHeader';
import Card from '../../core/components/UI/Card';
import Button from '../../core/components/UI/Button';
import Reviews from '../components/product/Reviews';
import RelatedProducts from '../components/product/RelatedProducts';
import { useWishlist } from '../contexts/WishlistContext';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { hasModule } = useModules();
  const loginEnabled = hasModule('login');
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [mainImage, setMainImage] = useState('');

  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const inWishlist = isInWishlist(product?._id);

  const handleWishlist = async () => {
    if (!user) {
      if (confirm('Inicia sesión para guardar productos en tu lista de deseos')) {
        navigate('/login');
      }
      return;
    }
    
    if (inWishlist) {
      await removeFromWishlist(product._id);
    } else {
      await addToWishlist(product._id);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [slug]);

  const loadProduct = async () => {
    try {
      const data = await getProductBySlug(slug);
      setProduct(data);
      if (data.thumbnail) {
        setMainImage(data.thumbnail);
      } else if (data.images && data.images.length > 0) {
        setMainImage(data.images[0].url);
      }
      if (data.variants?.length > 0) {
        setSelectedVariant(data.variants[0]);
      }
    } catch (error) {
      setError('Producto no encontrado');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (loginEnabled && !user) {
      if (confirm('Debes iniciar sesión para agregar productos al carrito. ¿Ir al login?')) {
        navigate('/login');
      }
      return;
    }
    
    // Validar que la cantidad no exceda el stock
    const maxStock = selectedVariant?.stock || product.stock;
    if (quantity > maxStock) {
      alert(`⚠️ Solo hay ${maxStock} unidades disponibles de "${product.name}"`);
      return;
    }
    
    const productToAdd = {
      _id: product._id,
      name: product.name,
      slug: product.slug,
      price: selectedVariant?.price || product.price,
      thumbnail: mainImage || product.thumbnail,
      stock: maxStock
    };
    
    addToCart(productToAdd, quantity, selectedVariant?.name);
    alert('✅ Producto agregado al carrito');
  };

  const handleQuantityChange = (value) => {
    const maxStock = selectedVariant?.stock || product.stock;
    const newQuantity = Math.min(maxStock, Math.max(1, value));
    setQuantity(newQuantity);
  };

  if (loading) {
    return (
      <>
        <MainHeader />
        <div className="pt-20 min-h-screen flex items-center justify-center">
          <div className="text-xl text-gray-500 animate-pulse">Cargando producto...</div>
        </div>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <MainHeader />
        <div className="pt-20 min-h-screen flex items-center justify-center">
          <Card className="text-center p-8 max-w-md">
            <div className="text-6xl mb-4">😕</div>
            <p className="text-xl text-red-600 mb-4">{error || 'Producto no encontrado'}</p>
            <Link to="/catalogo">
              <Button variant="primary">Volver al catálogo</Button>
            </Link>
          </Card>
        </div>
      </>
    );
  }

  const allImages = [];
  if (product.thumbnail) allImages.push({ url: product.thumbnail, type: 'thumbnail' });
  if (product.images && product.images.length > 0) {
    product.images.forEach(img => {
      if (!allImages.some(i => i.url === img.url)) {
        allImages.push({ url: img.url, type: 'gallery' });
      }
    });
  }

  const maxStock = selectedVariant?.stock || product.stock;

  return (
    <>
      <MainHeader />
      
      <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Link to="/catalogo" className="text-primary-600 hover:text-primary-700 flex items-center gap-1">
              <span>←</span> Volver al catálogo
            </Link>
          </div>

          <Card className="overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8 p-6">
              <div>
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center overflow-hidden mb-4">
                  {mainImage ? (
                    <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-8xl">📦</div>
                  )}
                </div>
                
                {allImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {allImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setMainImage(img.url)}
                        className={`w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition ${
                          mainImage === img.url 
                            ? 'border-primary-500 ring-2 ring-primary-200' 
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <img src={img.url} alt={`${product.name} - imagen ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                {product.categoryId && (
                  <p className="text-sm text-primary-500 mb-2">{product.categoryId.name}</p>
                )}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
                
                <div className="mb-4">
                  {product.comparePrice > product.price ? (
                    <>
                      <span className="text-3xl font-bold text-primary-600">${product.price.toLocaleString()}</span>
                      <span className="text-lg text-gray-400 line-through ml-2">${product.comparePrice.toLocaleString()}</span>
                      <span className="ml-2 inline-block bg-green-100 text-green-700 text-sm px-2 py-1 rounded-full">
                        Ahorra ${(product.comparePrice - product.price).toLocaleString()}
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-primary-600">${product.price.toLocaleString()}</span>
                  )}
                </div>

                <div className="mb-4">
                  {maxStock > 0 ? (
                    <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">
                      ✓ En stock ({maxStock} disponibles)
                    </span>
                  ) : (
                    <span className="text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm">✗ Agotado</span>
                  )}
                </div>

                {product.hasVariants && product.variants?.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Variante</label>
                    <select
                      value={selectedVariant?.name || ''}
                      onChange={(e) => {
                        const variant = product.variants.find(v => v.name === e.target.value);
                        setSelectedVariant(variant);
                        setQuantity(1);
                      }}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {product.variants.map((variant) => (
                        <option key={variant.name} value={variant.name}>
                          {variant.name} - ${(variant.price || product.price).toLocaleString()} {variant.stock !== undefined && `(${variant.stock} disponibles)`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {maxStock > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleQuantityChange(quantity - 1)}
                        className="w-10 h-10 bg-gray-100 rounded-xl hover:bg-gray-200 transition text-lg font-medium"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={maxStock}
                        value={quantity}
                        onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                        className="w-20 p-3 border border-gray-300 rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <button
                        onClick={() => handleQuantityChange(quantity + 1)}
                        className="w-10 h-10 bg-gray-100 rounded-xl hover:bg-gray-200 transition text-lg font-medium"
                      >
                        +
                      </button>
                      <span className="text-sm text-gray-500">máx. {maxStock}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  {maxStock > 0 ? (
                    <Button variant="primary" size="lg" onClick={handleAddToCart} className="flex-1">
                      🛒 Agregar al carrito
                    </Button>
                  ) : (
                    <Button variant="danger" size="lg" disabled className="flex-1">Agotado</Button>
                  )}
                  <button
                    onClick={handleWishlist}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                      inWishlist 
                        ? 'bg-red-500 text-white border-red-500 shadow-soft' 
                        : 'bg-white text-gray-400 border-gray-200 hover:border-red-300 hover:text-red-500'
                    }`}
                  >
                    <svg className="w-6 h-6" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {product.description && (
              <div className="border-t border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">📖 Descripción del producto</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">{product.description}</p>
                </div>
              </div>
            )}
          </Card>
          
          <Reviews productId={product._id} />
          <RelatedProducts productId={product._id} />
        </div>
      </div>
    </>
  );
}