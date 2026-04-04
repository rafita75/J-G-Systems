// server/modules/ecommerce/routes/products.js
const express = require('express');
const Product = require('../models/Product');
const auth = require('../../login/middleware/auth');
const { requirePermission } = require('../../../shared/middleware/permissions');  

const router = express.Router();

// ============================================
// OBTENER TODOS LOS PRODUCTOS (público)
// ============================================
router.get('/', auth, requirePermission('viewProducts'), async (req, res) => {
  try {
    const { category, search, limit = 12, page = 1 } = req.query;
    const query = { isActive: true };
    
    if (category) {
      query.categoryId = category;
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('categoryId');
    
    const total = await Product.countDocuments(query);
    
    res.json({
      products,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// ============================================
// OBTENER PRODUCTOS DESTACADOS (público)
// ============================================
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true, isFeatured: true })
      .limit(6)
      .populate('categoryId');
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos destacados' });
  }
});

// ============================================
// OBTENER PRODUCTO POR SLUG (público)
// ============================================
router.get('/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate('categoryId');
    
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

// ============================================
// OBTENER TODOS LOS PRODUCTOS (admin)
// ============================================
router.get('/admin/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const products = await Product.find().sort({ createdAt: -1 }).populate('categoryId');
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// ============================================
// CREAR PRODUCTO (solo admin)
// ============================================
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const productData = req.body;
    
    // Generar slug si no viene
    if (!productData.slug && productData.name) {
      productData.slug = productData.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }
    
    const product = new Product(productData);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'El slug o SKU ya existe' });
    }
    console.error(error);
    res.status(500).json({ error: 'Error al crear producto: ' + error.message });
  }
});

// ============================================
// ACTUALIZAR PRODUCTO (solo admin)
// ============================================
router.put('/:id', auth, requirePermission('editProducts'), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// ============================================
// ELIMINAR PRODUCTO (solo admin)
// ============================================
router.delete('/:id', auth, requirePermission('deleteProducts'), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

// ============================================
// OBTENER PRODUCTOS RELACIONADOS
// ============================================
router.get('/related/:productId', async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    // Buscar productos de la misma categoría, excluyendo el actual
    const related = await Product.find({
      _id: { $ne: product._id },
      isActive: true,
      categoryId: product.categoryId
    })
    .limit(4)
    .populate('categoryId');
    
    // Si no hay suficientes de la misma categoría, buscar destacados
    if (related.length < 4) {
      const featured = await Product.find({
        _id: { $ne: product._id },
        isActive: true,
        isFeatured: true,
        categoryId: { $ne: product.categoryId }
      })
      .limit(4 - related.length)
      .populate('categoryId');
      
      related.push(...featured);
    }
    
    res.json(related);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener productos relacionados' });
  }
});

module.exports = router;

// ============================================
// OBTENER PRODUCTO POR CÓDIGO DE BARRAS
// ============================================
router.get('/barcode/:code', async (req, res) => {
  try {
    const product = await Product.findOne({ 
      barcode: req.params.code,
      isActive: true 
    }).populate('categoryId');
    
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al buscar por código de barras' });
  }
});