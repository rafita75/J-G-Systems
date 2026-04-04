// server/routes/professionals.js
const express = require('express');
const Professional = require('../models/Professional');
const auth = require('../../login/middleware/auth');

const router = express.Router();

// ============================================
// OBTENER PROFESIONALES ACTIVOS (público)
// ============================================
router.get('/', async (req, res) => {
  try {
    const professionals = await Professional.find({ isActive: true }).sort({ order: 1 });
    // Agregar opción "Cualquier profesional"
    res.json([
      { _id: null, name: "Cualquier profesional", isDefault: false, specialty: "Disponibilidad flexible" },
      ...professionals
    ]);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener profesionales' });
  }
});

// ============================================
// OBTENER TODOS LOS PROFESIONALES (admin)
// ============================================
router.get('/admin/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    const professionals = await Professional.find().sort({ order: 1 });
    res.json(professionals);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener profesionales' });
  }
});

// ============================================
// CREAR PROFESIONAL (admin)
// ============================================
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const professional = new Professional(req.body);
    await professional.save();
    res.status(201).json(professional);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear profesional' });
  }
});

// ============================================
// ACTUALIZAR PROFESIONAL (admin)
// ============================================
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const professional = await Professional.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!professional) {
      return res.status(404).json({ error: 'Profesional no encontrado' });
    }
    res.json(professional);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar profesional' });
  }
});

// ============================================
// ELIMINAR PROFESIONAL (admin)
// ============================================
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const professional = await Professional.findByIdAndDelete(req.params.id);
    if (!professional) {
      return res.status(404).json({ error: 'Profesional no encontrado' });
    }
    res.json({ message: 'Profesional eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar profesional' });
  }
});

module.exports = router;