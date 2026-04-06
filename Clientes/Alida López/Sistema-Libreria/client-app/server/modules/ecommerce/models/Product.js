// server/modules/ecommerce/models/Product.js
const mongoose = require('mongoose');

const VariantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, default: 0 },
  purchasePrice: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  sku: { type: String, default: '' },
  barcode: { type: String, default: '' },
  image: { type: String, default: '' }
});

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, lowercase: true, trim: true },
  description: { type: String, default: '' },
  purchasePrice: { type: Number, default: 0, min: 0 },
  price: { type: Number, required: true, min: 0 },
  sku: { type: String, default: '' },
  barcode: { type: String, trim: true },
  stock: { type: Number, default: 0, min: 0 },
  minStock: { type: Number, default: 5, min: 0 },
  brand: { type: String, default: '', trim: true },
  provider: { type: String, default: '', trim: true },
  expiryDate: { type: Date, default: null },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  hasVariants: { type: Boolean, default: false },
  variants: [VariantSchema],
  images: [{ url: String, alt: String, order: Number }],
  thumbnail: { type: String, default: '' },
  tags: [{ type: String, trim: true }],
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  // Deshabilitar índices automáticos
  autoIndex: false
});

function generateSlug(name) {
  let slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  slug = slug.replace(/-+/g, '-');
  return slug;
}

// ============================================
// MIDDLEWARE pre('save')
// ============================================
ProductSchema.pre('save', async function() {
  // Generar slug
  if (this.isNew || this.isModified('name')) {
    this.slug = generateSlug(this.name);
  }
  
  // Generar SKU solo si es nuevo producto
  if (this.isNew && !this.sku) {
    const Product = mongoose.model('Product');
    const count = await Product.countDocuments();
    const year = new Date().getFullYear();
    const nextNum = String(count + 1).padStart(5, '0');
    this.sku = `SKU-${year}-${nextNum}`;
  }
  
  // Generar SKU para variantes nuevas
  if (this.hasVariants && this.variants && this.variants.length > 0 && this.sku) {
    let variantIndex = 1;
    for (let i = 0; i < this.variants.length; i++) {
      const variant = this.variants[i];
      if (!variant.sku) {
        variant.sku = `${this.sku}-${String(variantIndex).padStart(2, '0')}`;
        variantIndex++;
      }
    }
  }
  
  this.updatedAt = Date.now();
});

// ELIMINAR los índices únicos existentes en la base de datos
// Ejecuta esto en MongoDB Compass o en la consola de MongoDB:
// db.products.dropIndex("sku_1")
// db.products.dropIndex("slug_1")

module.exports = mongoose.model('Product', ProductSchema);