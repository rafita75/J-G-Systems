// server/modules/ecommerce/models/Product.js
const mongoose = require('mongoose');

const VariantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  sku: { type: String, default: '' }
});

const ProductSchema = new mongoose.Schema({
  // Información básica
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    sparse: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    default: ''
  },
  
  // Precios
  price: {
    type: Number,
    required: true,
    min: 0
  },
  comparePrice: {
    type: Number,
    default: 0
  },
  
  // Inventario
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  barcode: {                    // ← NUEVO CAMPO
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  minStock: {                   // ← NUEVO CAMPO (para alertas)
    type: Number,
    default: 5,
    min: 0
  },
  trackStock: {
    type: Boolean,
    default: true
  },
  
  // Imágenes
  images: [{
    url: String,
    alt: String,
    order: Number
  }],
  thumbnail: {
    type: String,
    default: ''
  },
  
  // Categoría
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  
  // Variantes
  hasVariants: {
    type: Boolean,
    default: false
  },
  variants: [VariantSchema],
  
  // Etiquetas
  tags: [{
    type: String,
    trim: true
  }],
  
  // Visibilidad
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Envío
  weight: {
    type: Number,
    default: 0
  },
  
  // SEO
  metaTitle: { type: String, default: '' },
  metaDescription: { type: String, default: '' },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Función para generar slug
function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Middleware usando async/await
ProductSchema.pre('save', async function() {
  if (this.isModified('name') && this.name) {
    this.slug = generateSlug(this.name);
  }
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Product', ProductSchema);