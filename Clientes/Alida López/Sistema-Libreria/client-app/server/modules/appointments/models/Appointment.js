// server/models/Appointment.js
const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  professionalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professional',
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  clienteNombre: {
    type: String,
    required: true
  },
  clienteTelefono: {
    type: String,
    required: true
  },
  clienteEmail: {
    type: String,
    default: ''
  },
  fecha: {
    type: String,
    required: true
  },
  hora: {
    type: String,
    required: true
  },
  estado: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  cancelReason: {
    type: String,
    default: ''
  },
  notas: {
    type: String,
    default: ''
  },
  codigoConfirmacion: {
    type: String,
    unique: true,
    sparse: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generar código de confirmación - SIN next (versión async)
AppointmentSchema.pre('save', async function() {
  if (!this.codigoConfirmacion) {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.codigoConfirmacion = `${random}`;
  }
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Appointment', AppointmentSchema);