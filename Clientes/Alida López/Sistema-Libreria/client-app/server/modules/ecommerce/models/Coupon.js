// server/models/Coupon.js
const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  minPurchase: {
    type: Number,
    default: 0
  },
  maxDiscount: {
    type: Number,
    default: 0  // 0 = sin límite
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: null
  },
  usageLimit: {
    type: Number,
    default: null  // null = ilimitado
  },
  usedCount: {
    type: Number,
    default: 0
  },
  perUserLimit: {
    type: Number,
    default: 1
  },
  userUsage: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    usedAt: { type: Date, default: Date.now }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],  // vacío = todos los productos
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],  // vacío = todas las categorías
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Método para verificar si el cupón es válido
CouponSchema.methods.isValid = function(userId = null, subtotal = null) {
  if (!this.isActive) return false;
  
  const now = new Date();
  if (now < this.startDate) return false;
  if (this.endDate && now > this.endDate) return false;
  
  if (this.usageLimit && this.usedCount >= this.usageLimit) return false;
  
  if (userId && this.perUserLimit) {
    const userUsage = this.userUsage.filter(u => u.userId.toString() === userId);
    if (userUsage.length >= this.perUserLimit) return false;
  }
  
  // Verificar compra mínima (en dólares)
  if (subtotal !== null && this.minPurchase > 0 && subtotal < this.minPurchase) {
    return false;
  }
  
  return true;
};

// Método para calcular descuento
CouponSchema.methods.calculateDiscount = function(subtotal) {
  // subtotal viene en dólares, convertimos a centavos para cálculos precisos
  const subtotalCents = subtotal * 100;
  
  if (subtotalCents < this.minPurchase) return 0;
  
  let discountCents = 0;
  if (this.type === 'percentage') {
    discountCents = subtotalCents * (this.value / 100);
    if (this.maxDiscount > 0 && discountCents > this.maxDiscount) {
      discountCents = this.maxDiscount;
    }
  } else {
    discountCents = Math.min(this.value, subtotalCents);
  }
  
  // Devolver descuento en dólares (convertir de centavos)
  return discountCents / 100;
};

module.exports = mongoose.model('Coupon', CouponSchema);