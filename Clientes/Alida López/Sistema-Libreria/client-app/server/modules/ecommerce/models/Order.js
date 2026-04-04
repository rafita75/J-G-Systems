// server/models/Order.js
const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String, default: '' },
  variant: { type: String, default: null }
});

const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    zipCode: { type: String, required: true },
    notes: { type: String, default: '' }
  },
  
  items: [OrderItemSchema],
  
  subtotal: { type: Number, required: true },
  shipping: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  
  status: {
    type: String,
    enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  
  paymentMethod: {
    type: String,
    enum: ['cash', 'transfer', 'card'],
    default: 'cash'
  },
  
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },
  
  couponCode: { type: String, default: null },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Generar número de orden
async function generateOrderNumber() {
  const year = new Date().getFullYear();
  const count = await mongoose.model('Order').countDocuments();
  return `ORD-${year}-${(count + 1).toString().padStart(5, '0')}`;
}

OrderSchema.pre('save', async function() {
  if (!this.orderNumber) {
    this.orderNumber = await generateOrderNumber();
  }
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Order', OrderSchema);