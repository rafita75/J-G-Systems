// server/modules/inventory/routes/inventory.js
const express = require('express');
const Product = require('../../ecommerce/models/Product');
const StockMovement = require('../models/StockMovement');
const auth = require('../../login/middleware/auth');

const router = express.Router();

// ============================================
// OBTENER PRODUCTOS CON STOCK BAJO
// ============================================
router.get('/low-stock', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const products = await Product.find({
      $expr: { $lt: ['$stock', { $ifNull: ['$minStock', 5] }] }
    }).populate('categoryId');
    
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener productos con stock bajo' });
  }
});

// ============================================
// OBTENER RESUMEN DE INVENTARIO
// ============================================
router.get('/summary', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const totalProducts = await Product.countDocuments();
    const lowStockProducts = await Product.countDocuments({
      $expr: { $lt: ['$stock', { $ifNull: ['$minStock', 5] }] }
    });
    const outOfStock = await Product.countDocuments({ stock: 0 });
    
    const totalValue = await Product.aggregate([
      { $group: { _id: null, total: { $sum: { $multiply: ['$price', '$stock'] } } } }
    ]);
    
    res.json({
      totalProducts,
      lowStockProducts,
      outOfStock,
      totalValue: totalValue[0]?.total || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener resumen' });
  }
});

// ============================================
// AJUSTAR STOCK DE UN PRODUCTO
// ============================================
router.put('/products/:id/stock', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const { quantity, reason, type = 'adjustment' } = req.body;
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    const previousStock = product.stock;
    const newStock = previousStock + quantity;
    
    if (newStock < 0) {
      return res.status(400).json({ error: 'No se puede reducir el stock por debajo de 0' });
    }
    
    product.stock = newStock;
    await product.save();
    
    const movement = new StockMovement({
      productId: product._id,
      productName: product.name,
      type,
      quantity,
      previousStock,
      newStock,
      reason: reason || `Ajuste manual: ${quantity > 0 ? '+' : ''}${quantity}`,
      userId: req.user.id
    });
    await movement.save();
    
    res.json({ product, movement });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al ajustar stock' });
  }
});

// ============================================
// OBTENER HISTORIAL DE MOVIMIENTOS
// ============================================
router.get('/movements', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const { limit = 50, productId } = req.query;
    const query = {};
    
    if (productId) query.productId = productId;
    
    const movements = await StockMovement.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('userId', 'name');
    
    res.json(movements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

// ============================================
// ACTUALIZAR STOCK MÍNIMO
// ============================================
router.put('/products/:id/min-stock', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const { minStock } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { minStock },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar stock mínimo' });
  }
});

module.exports = router;