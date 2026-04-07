// server/modules/ecommerce/routes/products.js
const express = require('express');
const Product = require('../models/Product');
const auth = require('../../login/middleware/auth');
const User = require('../../login/models/User');

const router = express.Router();

// ============================================
// FUNCIONES DE VERIFICACIÓN DE PERMISOS
// ============================================
function canViewProducts(req) {
  if (req.user.role === 'admin') return true;
  if (req.user.role === 'employee' && req.user.viewProducts) return true;
  return false;
}

function canCreateProducts(req) {
  if (req.user.role === 'admin') return true;
  if (req.user.role === 'employee' && req.user.createProducts) return true;
  return false;
}

function canEditProducts(req) {
  if (req.user.role === 'admin') return true;
  if (req.user.role === 'employee' && req.user.editProducts) return true;
  return false;
}

function canDeleteProducts(req) {
  if (req.user.role === 'admin') return true;
  if (req.user.role === 'employee' && req.user.deleteProducts) return true;
  return false;
}

// ============================================
// RUTAS PÚBLICAS
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
// RUTAS ADMIN/EMPLEADOS
// ============================================
router.get('/admin/all', auth, async (req, res) => {
  try {
    if (!canViewProducts(req)) {
      return res.status(403).json({ error: 'No tienes permiso para ver productos' });
    }
    
    const products = await Product.find().sort({ createdAt: -1 }).populate('categoryId');
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    if (!canCreateProducts(req)) {
      return res.status(403).json({ error: 'No tienes permiso para crear productos' });
    }
    
    const productData = req.body;
    
    if (productData.sku === '' || !productData.sku) {
      delete productData.sku;
    }
    
    if (productData.slug === '' || !productData.slug) {
      delete productData.slug;
    }
    
    const product = new Product(productData);
    await product.save();
    
    if (product.purchasePrice && product.purchasePrice > 0 && product.stock > 0) {
      const Expense = require('../../accounting/models/Expense');
      const expense = new Expense({
        monto: product.purchasePrice * product.stock,
        categoria: 'insumos',
        descripcion: `Compra inicial de inventario - ${product.name}`,
        comprobante: '',
        recurrente: false,
        notas: `Producto nuevo. Cantidad: ${product.stock} x Q${product.purchasePrice} = Q${product.purchasePrice * product.stock}`,
        creadoPor: req.user.id
      });
      await expense.save();
    }
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error al crear producto: ' + error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    if (!canEditProducts(req)) {
      return res.status(403).json({ error: 'No tienes permiso para editar productos' });
    }
    
    const productData = { ...req.body };
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

router.delete('/:id', auth, async (req, res) => {
  try {
    if (!canDeleteProducts(req)) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar productos' });
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