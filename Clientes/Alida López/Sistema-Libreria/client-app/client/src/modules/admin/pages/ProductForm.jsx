// client/src/pages/Admin/ProductForm.jsx
import { useState, useEffect } from 'react';
import { createProduct, updateProduct } from '../../../shared/services/productService';
import Button from '../../core/components/UI/Button';
import Input from '../../core/components/UI/Input';
import MultiImageUpload from '../../../shared/components/upload/MultiImageUpload';
import VariantManager from './VariantManager';

export default function ProductForm({ product, categories, onSuccess, onCancel }) {
  // ============================================
  // ESTADOS GENERALES
  // ============================================
  const [hasVariants, setHasVariants] = useState(product?.hasVariants || false);
  const [variants, setVariants] = useState(product?.variants || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // ============================================
  // CAMPOS GENERALES
  // ============================================
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    brand: product?.brand || '',
    provider: product?.provider || '',
    expiryDate: product?.expiryDate ? product.expiryDate.split('T')[0] : '',
    categoryId: product?.categoryId?._id || '',
    isFeatured: product?.isFeatured || false,
    images: product?.images || [],
    sku: product?.sku || '',
    barcode: product?.barcode || '',
    price: product?.price || '',
    purchasePrice: product?.purchasePrice || '',
    stock: product?.stock || '',
    minStock: product?.minStock || 5,
    comparePrice: product?.comparePrice || 0
  });

  // ============================================
  // CALCULAR STOCK TOTAL Y RANGO DE PRECIOS
  // ============================================
  useEffect(() => {
    if (hasVariants && variants.length > 0) {
      const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
      const prices = variants.map(v => v.price || 0).filter(p => p > 0);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
      
      setFormData(prev => ({
        ...prev,
        stock: totalStock,
        price: minPrice,
        comparePrice: maxPrice > minPrice ? maxPrice : 0,
        images: variants[0]?.image ? [{ url: variants[0].image, file: null }] : prev.images
      }));
    }
  }, [variants, hasVariants]);

  const handleImagesChange = (images) => {
    setFormData(prev => ({ ...prev, images: images }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const submitData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      purchasePrice: parseFloat(formData.purchasePrice) || 0,
      stock: parseInt(formData.stock) || 0,
      minStock: parseInt(formData.minStock) || 5,
      comparePrice: parseFloat(formData.comparePrice) || 0,
      thumbnail: formData.images[0]?.url || '',
      images: formData.images,
      hasVariants: hasVariants,
      variants: hasVariants ? variants : []
    };
    
    if (!product) {
      delete submitData.sku;
    }
    
    if (hasVariants) {
      submitData.purchasePrice = 0;
      submitData.barcode = '';
    }
    
    try {
      let result;
      if (product) {
        result = await updateProduct(product._id, submitData);
      } else {
        result = await createProduct(submitData);
      }
      
      if (result && result.sku) {
        setFormData(prev => ({ ...prev, sku: result.sku }));
      }
      
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-h-[90vh] overflow-auto">
      <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <span className="w-1 h-6 bg-green-600 rounded-full"></span>
        {product ? '✏️ Editar Producto' : '➕ Nuevo Producto'}
      </h3>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ¿TIENE VARIANTES? */}
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasVariants}
              onChange={(e) => setHasVariants(e.target.checked)}
              className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
            />
            <span className="font-medium text-gray-800">
              Este producto tiene variantes (tallas, colores, versiones)
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-2 ml-8">
            Si activas esta opción, podrás agregar múltiples variantes con diferentes precios, stock y códigos de barras.
          </p>
        </div>

        {/* CAMPOS GENERALES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre del producto *"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ej: Camiseta Premium"
            required
            icon="📦"
          />
          
          <Input
            label="SKU general"
            name="sku"
            type="text"
            value={formData.sku}
            onChange={handleChange}
            placeholder="Se genera automáticamente al guardar"
            icon="🔢"
            disabled={true}
            className="bg-gray-50"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Marca"
            name="brand"
            type="text"
            value={formData.brand}
            onChange={handleChange}
            placeholder="Ej: Nike, Adidas"
            icon="🏷️"
          />
          
          <Input
            label="Proveedor"
            name="provider"
            type="text"
            value={formData.provider}
            onChange={handleChange}
            placeholder="Ej: Distribuidora XYZ"
            icon="🚚"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Fecha de vencimiento"
            name="expiryDate"
            type="date"
            value={formData.expiryDate}
            onChange={handleChange}
            icon="📅"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            >
              <option value="">Sin categoría</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* SECCIÓN SIN VARIANTES */}
        {!hasVariants && (
          <div className="border-t border-gray-100 pt-4">
            <h4 className="font-medium text-gray-800 mb-3">Información de inventario</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Precio de compra"
                name="purchasePrice"
                type="number"
                value={formData.purchasePrice}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                icon="📥"
              />
              
              <Input
                label="Precio de venta *"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                required={!hasVariants}
                step="0.01"
                icon="💰"
              />
              
              <Input
                label="Código de barras"
                name="barcode"
                type="text"
                value={formData.barcode}
                onChange={handleChange}
                placeholder="Ej: 7501000012345"
                icon="📷"
              />
              
              <Input
                label="Stock"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                required={!hasVariants}
                icon="📊"
                disabled={true}
                className="bg-gray-50 cursor-not-allowed"
              />
              
              {product && (
                <p className="text-xs text-gray-400 mt-1 col-span-2">
                  ⚠️ El stock no se puede editar aquí. Usa el módulo de <strong className="text-green-600">Inventario</strong> para ajustar el stock.
                </p>
              )}
              
              <Input
                label="Stock mínimo (alerta)"
                name="minStock"
                type="number"
                value={formData.minStock}
                onChange={handleChange}
                placeholder="5"
                icon="⚠️"
              />
            </div>
          </div>
        )}

        {/* SECCIÓN DE VARIANTES */}
        {hasVariants && (
          <div className="border-t border-gray-100 pt-4">
            <VariantManager
              variants={variants}
              onChange={setVariants}
              parentSku={formData.sku}
            />
          </div>
        )}

        {/* DESCRIPCIÓN E IMÁGENES */}
        {!hasVariants && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="4"
                placeholder="Describe el producto..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imágenes del producto
              </label>
              <MultiImageUpload
                onImagesChange={handleImagesChange}
                initialImages={formData.images}
                label="Subir imágenes"
              />
            </div>
          </>
        )}
        
        {/* Destacado */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          <input
            type="checkbox"
            name="isFeatured"
            id="isFeatured"
            checked={formData.isFeatured}
            onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
            className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
          />
          <label htmlFor="isFeatured" className="text-sm text-gray-700 cursor-pointer">
            ⭐ Producto destacado
          </label>
        </div>
        
        {/* Botones */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700"
          >
            {product ? 'Actualizar Producto' : 'Crear Producto'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}