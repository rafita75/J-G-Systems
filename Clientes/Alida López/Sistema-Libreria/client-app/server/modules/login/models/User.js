// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'employee', 'superadmin'],
    default: 'user'
  },
  permissions: {
    // Productos
    viewProducts: { type: Boolean, default: false },
    createProducts: { type: Boolean, default: false },
    editProducts: { type: Boolean, default: false },
    deleteProducts: { type: Boolean, default: false },
    
    // Pedidos
    viewOrders: { type: Boolean, default: false },
    updateOrderStatus: { type: Boolean, default: false },
    
    // Reservas
    viewAppointments: { type: Boolean, default: false },
    createAppointments: { type: Boolean, default: false },
    updateAppointmentStatus: { type: Boolean, default: false },
    
    // POS / Ventas
    usePOS: { type: Boolean, default: false },
    
    // Contabilidad (solo lectura)
    viewAccounting: { type: Boolean, default: false },
    
    // Clientes
    viewCustomers: { type: Boolean, default: false },
    
    // Perfil propio
    editOwnProfile: { type: Boolean, default: true },
    
    // Empleados (solo admin puede)
    manageEmployees: { type: Boolean, default: false }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  // NUEVO: guardar dirección de envío
  shippingAddress: {
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    zipCode: { type: String, default: '' }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Usar función normal (no arrow function) y async/await
UserSchema.pre('save', async function() {
  const user = this;
  
  // Solo encriptar si la contraseña fue modificada
  if (!user.isModified('password')) return;
  
  // Encriptar contraseña
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
});

// Método para comparar contraseñas
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;