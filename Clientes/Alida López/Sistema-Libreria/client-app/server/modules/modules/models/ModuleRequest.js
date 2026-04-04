// server/models/ModuleRequest.js
const mongoose = require('mongoose');

const ModuleRequestSchema = new mongoose.Schema({
  moduleKey: {
    type: String,
    required: true,
  enum: ['login', 'landingCustomization', 'ecommerce', 'accounting', 'appointments', 'inventory', 'pos']
  },
  moduleName: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  clientName: {
    type: String,
    required: true
  },
  clientEmail: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: {
    type: Date
  }
});

module.exports = mongoose.model('ModuleRequest', ModuleRequestSchema);