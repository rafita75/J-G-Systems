// server/models/Income.js
const mongoose = require('mongoose');

const IncomeSchema = new mongoose.Schema({
  tipo: {
    type: String,
    enum: ['venta_rapida', 'manual', 'pedido_online'],
    default: 'venta_rapida'  // ← AGREGAR DEFAULT
  },
  monto: {
    type: Number,
    required: true,
    min: 0
  },
  descripcion: {
    type: String,
    required: true
  },
  metodo: {
    type: String,
    enum: ['efectivo', 'transferencia', 'tarjeta'],
    default: 'efectivo'
  },
  clienteNombre: {
    type: String,
    default: ''
  },
  clienteTelefono: {
    type: String,
    default: ''
  },
  esDeuda: {
    type: Boolean,
    default: false
  },
  pedidoOnlineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  notas: {
    type: String,
    default: ''
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  creadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('Income', IncomeSchema);