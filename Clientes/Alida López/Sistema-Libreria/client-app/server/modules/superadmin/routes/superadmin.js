// server/routes/superadmin.js
const express = require('express');
const jwt = require('jsonwebtoken');
const SuperAdmin = require('../models/SuperAdmin');
const SiteConfig = require('../../core/models/SiteConfig');
const ModuleRequest = require('../../modules/models/ModuleRequest');
const { verifySuperAdmin } = require('../../../shared/middleware/superAdminAuth');

const router = express.Router();

// ============================================
// LOGIN DEL SUPERADMIN
// ============================================
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const superadmin = await SuperAdmin.findOne({ username });
    if (!superadmin) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    
    const isValid = await superadmin.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    
    // IMPORTANTE: el role debe ser 'superadmin'
    const token = jwt.sign(
      { id: superadmin._id, username: superadmin.username, role: 'superadmin' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el login' });
  }
});

// ============================================
// OBTENER CONFIGURACIÓN (módulos activos)
// ============================================
router.get('/config', verifySuperAdmin, async (req, res) => {
  try {
    let config = await SiteConfig.findOne();
    if (!config) {
      config = await SiteConfig.create({});
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
});

// ============================================
// ACTUALIZAR MÓDULOS
// ============================================
router.put('/modules', verifySuperAdmin, async (req, res) => {
  try {
    let config = await SiteConfig.findOne();
    if (!config) {
      config = new SiteConfig();
    }
    
    const { modules } = req.body;
    config.modules = { ...config.modules, ...modules };
    config.updatedAt = Date.now();
    await config.save();
    
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar módulos' });
  }
});

// ============================================
// CREAR PRIMER SUPERADMIN (solo si no existe)
// ============================================
router.post('/setup', async (req, res) => {
  try {
    const count = await SuperAdmin.countDocuments();
    if (count > 0) {
      return res.status(403).json({ error: 'Ya existe un superadmin' });
    }
    
    const { username, password } = req.body;
    const superadmin = new SuperAdmin({ username, password });
    await superadmin.save();
    
    res.json({ message: 'Superadmin creado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear superadmin' });
  }
});

// server/routes/superadmin.js

// ============================================
// RUTA PÚBLICA - Obtener módulos activos (sin autenticación)
// ============================================
router.get('/public/modules', async (req, res) => {
  try {
    let config = await SiteConfig.findOne();
    if (!config) {
      config = await SiteConfig.create({});
    }
    
    // Devolver solo los módulos (información pública)
    res.json({
      modules: config.modules,
      siteName: config.siteName,
      primaryColor: config.primaryColor
    });
  } catch (error) {
    console.error('Error al obtener módulos públicos:', error);
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
});


// ============================================
// OBTENER SOLICITUDES PENDIENTES (superadmin)
// ============================================
router.get('/requests/pending', verifySuperAdmin, async (req, res) => {
  try {
    console.log('=== SOLICITUDES PENDIENTES ===');
    const requests = await ModuleRequest.find({ status: 'pending' }).sort({ createdAt: -1 });
    console.log('Solicitudes encontradas:', requests.length);
    res.json(requests);
  } catch (error) {
    console.error('Error en /requests/pending:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// APROBAR SOLICITUD DE MÓDULO (superadmin)
// ============================================
router.post('/requests/:id/approve', verifySuperAdmin, async (req, res) => {
  try {
    const request = await ModuleRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }
    
    // Actualizar estado de la solicitud
    request.status = 'approved';
    request.approvedAt = Date.now();
    await request.save();
    
    // Activar el módulo en SiteConfig
    let config = await SiteConfig.findOne();
    if (!config) {
      config = new SiteConfig();
    }
    
    config.modules[request.moduleKey] = true;
    config.updatedAt = Date.now();
    await config.save();
    
    res.json({ message: 'Módulo activado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al aprobar solicitud' });
  }
});

// ============================================
// RECHAZAR SOLICITUD DE MÓDULO (superadmin)
// ============================================
router.post('/requests/:id/reject', verifySuperAdmin, async (req, res) => {
  try {
    const request = await ModuleRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }
    
    request.status = 'rejected';
    await request.save();
    
    res.json({ message: 'Solicitud rechazada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al rechazar solicitud' });
  }
});


module.exports = router;