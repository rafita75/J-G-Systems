// server/routes/sections.js
const express = require('express');
const Section = require('../models/Section');
const auth = require('../../login/middleware/auth');

const router = express.Router();

// ============================================
// 1. OBTENER TODAS LAS SECCIONES ACTIVAS (público)
// ============================================
router.get('/', async (req, res) => {
  try {
    const sections = await Section.find({ isActive: true }).sort({ order: 1 });
    res.json(sections);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener secciones' });
  }
});

// ============================================
// 2. OBTENER TODAS LAS SECCIONES (admin - incluye inactivas)
// ============================================
router.get('/admin', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    const sections = await Section.find().sort({ order: 1 });
    res.json(sections);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener secciones' });
  }
});

// ============================================
// 3. CREAR NUEVA SECCIÓN (admin)
// ============================================
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const { type, title, content, styles, isPremium, moduleRequired } = req.body;
    
    // Obtener el último orden
    const count = await Section.countDocuments();
    
    const section = new Section({
      type,
      title: title || '',
      content: content || {},
      styles: styles || {},
      isPremium: isPremium || false,
      moduleRequired: moduleRequired || null,
      order: count
    });
    
    await section.save();
    res.status(201).json(section);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear sección' });
  }
});

// ============================================
// 4. ACTUALIZAR SECCIÓN (admin)
// ============================================
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const section = await Section.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!section) {
      return res.status(404).json({ error: 'Sección no encontrada' });
    }
    
    res.json(section);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar sección' });
  }
});

// ============================================
// 5. ELIMINAR SECCIÓN (admin)
// ============================================
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const section = await Section.findByIdAndDelete(req.params.id);
    if (!section) {
      return res.status(404).json({ error: 'Sección no encontrada' });
    }
    
    res.json({ message: 'Sección eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar sección' });
  }
});

// ============================================
// 6. REORDENAR SECCIONES (admin)
// ============================================
router.post('/reorder', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const { sections } = req.body; // [{ id, order }]
    
    for (const item of sections) {
      await Section.findByIdAndUpdate(item.id, { order: item.order });
    }
    
    res.json({ message: 'Orden actualizado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al reordenar secciones' });
  }
});

module.exports = router;