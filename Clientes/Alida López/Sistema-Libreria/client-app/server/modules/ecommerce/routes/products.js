// server/modules/ecommerce/routes/products.js
const express = require('express');
const Product = require('../models/Product');
const auth = require('../../login/middleware/auth');
const User = require('../../login/models/User');

const router = express.Router();

// ============================================
// OBTENER TODOS LOS PRODUCTOS (público)
// ============================================
router.get('/', async (req, res) => {
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
    if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      const products = await Product.find().sort({ createdAt: -1 }).populate('categoryId');
      return res.json(products);
    }
    
    if (req.user.role === 'employee') {
      const user = await User.findById(req.user.id);
      if (user?.permissions?.viewProducts === true) {
        const products = await Product.find().sort({ createdAt: -1 }).populate('categoryId');
        return res.json(products);
      }
      return res.status(403).json({ error: 'No tienes permiso' });
    }
    
    return res.status(403).json({ error: 'No autorizado' });
  } catch (error) {
    console.error(error);
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
    
    // Limpiar datos antes de guardar
    const productData = { ...req.body };
    
    // Eliminar SKU si viene vacío (dejar que el middleware lo genere)
    if (productData.sku === '' || !productData.sku) {
      delete productData.sku;
    }
    
    // Eliminar slug si viene (dejar que el middleware lo genere)
    if (productData.slug === '' || !productData.slug) {
      delete productData.slug;
    }
    
    const product = new Product(productData);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error al crear producto: ' + error.message });
  }
});

// ============================================
// ACTUALIZAR PRODUCTO (solo admin)
// ============================================
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const productData = { ...req.body };
    
    // No permitir modificar SKU si ya existe
    delete productData.sku;
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...productData, updatedAt: Date.now() },
      { new: true, runValidators: false }
    );
    
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// ============================================
// ELIMINAR PRODUCTO (solo admin)
// ============================================
router.delete('/:id', auth, async (req, res) => {
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
    
    const related = await Product.find({
      _id: { $ne: product._id },
      isActive: true,
      categoryId: product.categoryId
    })
    .limit(4)
    .populate('categoryId');
    
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

module.exports = router;