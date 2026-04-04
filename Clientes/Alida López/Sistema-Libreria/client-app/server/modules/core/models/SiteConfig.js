// server/models/SiteConfig.js
const mongoose = require('mongoose');

const SiteConfigSchema = new mongoose.Schema({
  // Módulos activos/desactivados
  // server/models/SiteConfig.js
  modules: {
    login: { type: Boolean, default: false },
    landingCustomization: { type: Boolean, default: false },
    ecommerce: { type: Boolean, default: false },
    accounting: { type: Boolean, default: false },
    appointments: { type: Boolean, default: false },
    inventory: { type: Boolean, default: false },
    pos: { type: Boolean, default: false }
  },
  
  // Configuración general
  siteName: { type: String, default: 'Mi Tienda' },
  primaryColor: { type: String, default: '#3b82f6' },
  
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SiteConfig', SiteConfigSchema);