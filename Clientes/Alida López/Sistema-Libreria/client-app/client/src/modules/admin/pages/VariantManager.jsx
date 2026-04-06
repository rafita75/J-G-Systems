// client/src/pages/Admin/VariantManager.jsx
import { useState } from 'react';
import Button from '../../core/components/UI/Button';
import Input from '../../core/components/UI/Input';
import MultiImageUpload from '../../../shared/components/upload/MultiImageUpload';

export default function VariantManager({ variants, onChange, parentSku }) {
  const [expandedVariant, setExpandedVariant] = useState(null);

  const toggleExpand = (variantId) => {
    setExpandedVariant(expandedVariant === variantId ? null : variantId);
  };

  const addVariant = () => {
    const newId = Date.now();
    const newSku = parentSku ? `${parentSku}-${String(variants.length + 1).padStart(2, '0')}` : '';
    
    const newVariant = {
      id: newId,
      name: '',
      sku: newSku,
      price: 0,
      purchasePrice: 0,
      stock: 0,
      barcode: '',
      image: '',
      images: [],
      attributes: {}
    };
    onChange([...variants, newVariant]);
    setExpandedVariant(newId);
  };

  const updateVariant = (id, field, value) => {
    const updatedVariants = variants.map(variant =>
      variant.id === id ? { ...variant, [field]: value } : variant
    );
    onChange(updatedVariants);
  };

  const updateVariantImage = (id, images) => {
    const updatedVariants = variants.map(variant =>
      variant.id === id ? { ...variant, images: images, image: images[0]?.url || '' } : variant
    );
    onChange(updatedVariants);
  };

  const removeVariant = (id) => {
    if (confirm('¿Eliminar esta variante?')) {
      onChange(variants.filter(variant => variant.id !== id));
    }
  };

  if (variants.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">No hay variantes agregadas</p>
        <Button variant="outline" onClick={addVariant}>
          + Agregar Primera Variante
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-gray-900">Variantes del producto</h4>
        <Button variant="outline" size="sm" onClick={addVariant}>
          + Agregar Variante
        </Button>
      </div>

      <div className="space-y-3">
        {variants.map((variant) => (
          <div key={variant.id} className="border border-gray-200 rounded-xl overflow-hidden">
            <div
              onClick={() => toggleExpand(variant.id)}
              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex justify-between items-center cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {variant.image ? (
                  <img src={variant.image} alt={variant.name} className="w-8 h-8 object-cover rounded" />
                ) : (
                  <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-sm">🎨</div>
                )}
                <span className="font-medium text-gray-900">
                  {variant.name || 'Nueva variante'}
                </span>
                {variant.sku && <span className="text-xs text-gray-400">SKU: {variant.sku}</span>}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-primary-600 font-semibold">${variant.price || 0}</span>
                <span className="text-xs text-gray-500">Stock: {variant.stock || 0}</span>
                <svg className={`w-5 h-5 text-gray-400 transform transition ${expandedVariant === variant.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {expandedVariant === variant.id && (
              <div className="p-4 space-y-3 border-t border-gray-200">
                <Input
                  label="Nombre de la variante"
                  value={variant.name}
                  onChange={(e) => updateVariant(variant.id, 'name', e.target.value)}
                  placeholder="Ej: Rojo, Talla M, 64GB"
                  icon="🎨"
                />
                
                <Input
                  label="SKU"
                  value={variant.sku}
                  onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                  placeholder="Código único"
                  icon="🔢"
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Precio"
                    type="number"
                    value={variant.price}
                    onChange={(e) => updateVariant(variant.id, 'price', parseFloat(e.target.value))}
                    placeholder="0.00"
                    icon="💰"
                  />
                  
                  <Input
                    label="Stock"
                    type="number"
                    value={variant.stock}
                    onChange={(e) => updateVariant(variant.id, 'stock', parseInt(e.target.value))}
                    placeholder="0"
                    icon="📊"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Precio de compra"
                    type="number"
                    value={variant.purchasePrice}
                    onChange={(e) => updateVariant(variant.id, 'purchasePrice', parseFloat(e.target.value))}
                    placeholder="0.00"
                    icon="📥"
                  />
                  
                  <Input
                    label="Código de barras"
                    value={variant.barcode}
                    onChange={(e) => updateVariant(variant.id, 'barcode', e.target.value)}
                    placeholder="Código de barras"
                    icon="📷"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imagen de la variante
                  </label>
                  <MultiImageUpload
                    onImagesChange={(images) => updateVariantImage(variant.id, images)}
                    initialImages={variant.images || (variant.image ? [{ url: variant.image, file: null }] : [])}
                    label="Subir imagen"
                    maxImages={1}
                  />
                </div>
                
                <div className="flex justify-end pt-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => removeVariant(variant.id)}
                  >
                    Eliminar variante
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}