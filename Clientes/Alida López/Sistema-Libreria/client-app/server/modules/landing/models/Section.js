// server/models/Section.js
const mongoose = require('mongoose');

const SectionSchema = new mongoose.Schema({
  // ============================================
  // IDENTIFICACIÓN
  // ============================================
  type: {
    type: String,
    required: true,
    enum: [
      // Gratis
      'hero', 'text', 'image', 'features', 'testimonials', 'cta', 'divider', 'stats',
      // Premium
      'carousel', 'featuredProducts', 'contactForm', 'gallery', 'video',
      'pricing', 'faq', 'services', 'portfolio', 'appointments', 'events',
      'map', 'social', 'promo', 'ctaAdvanced'
    ]
  },
  title: { type: String, default: '' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isPremium: { type: Boolean, default: false },
  moduleRequired: { type: String, default: null }, // catalog, blog, appointments, etc.
  
  // ============================================
  // CONTENIDO (estructura según tipo)
  // ============================================
  content: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // ============================================
  // ESTILOS VISUALES
  // ============================================
  styles: {
    textColor: { type: String, default: '#1f2937' },
    backgroundColor: { type: String, default: '#ffffff' },
    paddingTop: { type: String, default: '4rem' },
    paddingBottom: { type: String, default: '4rem' },
    textAlign: { type: String, enum: ['left', 'center', 'right'], default: 'center' },
    animation: {
      type: String,
      enum: ['fadeIn', 'slideUp', 'slideLeft', 'zoomIn', 'bounce', 'none'],
      default: 'none'
    }
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Section', SectionSchema);