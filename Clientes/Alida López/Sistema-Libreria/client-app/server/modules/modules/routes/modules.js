// server/routes/modules.js
const express = require('express');
const ModuleRequest = require('../models/ModuleRequest');
const SiteConfig = require('../../core/models/SiteConfig');
const auth = require('../../login/middleware/auth');

const router = express.Router();

// ============================================
// OBTENER MÓDULOS DISPONIBLES PARA CONTRATAR
// ============================================
router.get('/available', auth, async (req, res) => {
  try {
    // Verificar que es admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    // Obtener configuración actual
    const config = await SiteConfig.findOne();
    const activeModules = config?.modules || {};
    
    // Lista de módulos que se pueden contratar
    const availableModules = [
      { 
        key: 'login', 
        name: 'Login / Registro', 
        icon: '🔐', 
        description: 'Sistema de autenticación de usuarios', 
        price: 100 
      },
      { 
        key: 'landingCustomization', 
        name: 'Personalización del Landing Page', 
        icon: '🎨', 
        description: 'Edita todas las secciones de tu página principal', 
        price: 200 
      },
      { 
        key: 'ecommerce', 
        name: 'Ecommerce Completo', 
        icon: '🛍️', 
        description: 'Tienda online: productos, carrito, pedidos', 
        price: 500 
      },
      { 
        key: 'accounting', 
        name: 'Contabilidad y Control de Dinero', 
        icon: '💰', 
        description: 'Controla ingresos, gastos, deudas y genera reportes', 
        price: 79 
      },
      { 
        key: 'appointments', 
        name: 'Reservas / Citas', 
        icon: '📅', 
        description: 'Sistema de reservas', 
        price: 79 
      },
      { 
        key: 'inventory', 
        name: 'Inventario', 
        icon: '📦', 
        description: 'Sistema de inventario', 
        price: 100 
      },
      { 
        key: 'pos', 
        name: 'POS', 
        icon: '💳', 
        description: 'Sistema de POS', 
        price: 100 
      }
    ];
    
    // Marcar cuáles ya están activos
    const modulesWithStatus = availableModules.map(module => ({
      ...module,
      isActive: activeModules[module.key] === true,
      isAvailable: !activeModules[module.key]
    }));
    
    res.json(modulesWithStatus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener módulos' });
  }
});

// ============================================
// SOLICITAR CONTRATACIÓN DE MÓDULO
// ============================================
// server/routes/modules.js

// SOLICITAR CONTRATACIÓN DE MÓDULO
// server/routes/modules.js
router.post('/request', auth, async (req, res) => {
  try {
    // Verificar que es admin
    console.log('=== SOLICITUD DE MÓDULO ===');
    console.log('req.user:', req.user);
    console.log('req.body:', req.body);
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const { moduleKey, moduleName, price, notes } = req.body;
    
    // Verificar que el módulo no esté ya activo
    const config = await SiteConfig.findOne();
    if (config?.modules[moduleKey]) {
      return res.status(400).json({ error: 'Este módulo ya está activo' });
    }
    
    // Crear solicitud usando los datos del usuario autenticado
    const request = new ModuleRequest({
      moduleKey,
      moduleName,
      price,
      clientName: req.user.name,
      clientEmail: req.user.email,
      notes: notes || ''
    });
    
    await request.save();
    
    res.status(201).json({ 
      message: 'Solicitud enviada. Te contactaremos para completar el pago.',
      requestId: request._id
    });
  } catch (error) {
    console.error('Error al crear solicitud:', error);
    res.status(500).json({ error: 'Error al crear solicitud' });
  }
});

// ============================================
// OBTENER HISTORIAL DE SOLICITUDES (admin)
// ============================================
router.get('/requests', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const requests = await ModuleRequest.find({ clientEmail: req.user.email })
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener solicitudes' });
  }
});

module.exports = router;