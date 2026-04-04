// server/routes/categories.js
const express = require('express');
const Category = require('../models/Category');
const auth = require('../../login/middleware/auth');

const router = express.Router();

// ============================================
// OBTENER TODAS LAS CATEGORÍAS (público)
// ============================================
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ order: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

// ============================================
// OBTENER UNA CATEGORÍA POR SLUG (público)
// ============================================
router.get('/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug, isActive: true });
    if (!category) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categoría' });
  }
});

// ============================================
// CREAR CATEGORÍA (solo admin)
// ============================================
router.post('/', auth, async (req, res) => {
  try {
    console.log('=== CREANDO CATEGORÍA ===');
    console.log('Usuario:', req.user);
    console.log('Body recibido:', req.body);
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const { name, description, image, parentId, order } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }
    
    const category = new Category({
      name,
      description: description || '',
      image: image || '',
      parentId: parentId || null,
      order: order || 0,
      isActive: true
    });
    
    await category.save();
    console.log('✅ Categoría creada:', category);
    res.status(201).json(category);
  } catch (error) {
    console.error('❌ Error en POST /categories:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'El slug ya existe' });
    }
    res.status(500).json({ error: 'Error al crear categoría: ' + error.message });
  }
});

// ============================================
// ACTUALIZAR CATEGORÍA (solo admin)
// ============================================
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!category) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
});

// ============================================
// ELIMINAR CATEGORÍA (solo admin)
// ============================================
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    
    res.json({ message: 'Categoría eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
});

module.exports = router;