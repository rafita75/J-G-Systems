// server/modules/inventory/routes/inventory.js
const express = require('express');
const mongoose = require('mongoose');
const StockMovement = require('../models/StockMovement');
const auth = require('../../login/middleware/auth');
const Sale = require('../../pos/models/Sale');
const Product = mongoose.model('Product');

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
    
    // Calcular total de variantes
    const productsWithVariants = await Product.find({ hasVariants: true });
    const totalVariants = productsWithVariants.reduce((sum, p) => sum + (p.variants?.length || 0), 0);
    
    const lowStockProducts = await Product.countDocuments({
      $expr: { $lt: ['$stock', { $ifNull: ['$minStock', 5] }] }
    });
    const outOfStock = await Product.countDocuments({ stock: 0 });
    
    const totalValue = await Product.aggregate([
      { $group: { _id: null, total: { $sum: { $multiply: ['$price', '$stock'] } } } }
    ]);
    
    res.json({
      totalProducts,
      totalVariants,
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

// server/modules/inventory/routes/inventory.js - Agrega al final

// ============================================
// OBTENER VENTAS AGRUPADAS (para historial)
// ============================================
router.get('/sales', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const { limit = 20, startDate, endDate } = req.query;
    const query = {};
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const sales = await Sale.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('createdBy', 'name');
    
    res.json(sales);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener ventas' });
  }
});

// ============================================
// OBTENER MOVIMIENTOS CON FILTROS
// ============================================
router.get('/movements/filtered', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const { startDate, endDate, type, productId, limit = 50 } = req.query;
    const query = {};
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    if (type) query.type = type;
    if (productId) query.productId = productId;
    
    const movements = await StockMovement.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('userId', 'name')
      .populate('saleId', 'saleNumber');
    
    res.json(movements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener movimientos' });
  }
});

// ============================================
// OBTENER PRODUCTOS CON STOCK BAJO (incluye variantes)
// ============================================
router.get('/low-stock-variants', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const products = await Product.find({ hasVariants: true });
    const lowStockVariants = [];
    
    for (const product of products) {
      for (const variant of product.variants) {
        const minStock = variant.minStock || product.minStock || 5;
        if (variant.stock <= minStock) {
          lowStockVariants.push({
            productId: product._id,
            productName: product.name,
            variantId: variant._id,
            variantName: variant.name,
            stock: variant.stock,
            minStock: minStock,
            sku: variant.sku
          });
        }
      }
    }
    
    res.json(lowStockVariants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener variantes con stock bajo' });
  }
});

// ============================================
// AJUSTAR STOCK DE UNA VARIANTE
// ============================================
router.put('/variants/:productId/:variantId/stock', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const { quantity, reason, purchasePrice } = req.body;
    const product = await Product.findById(req.params.productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    const variant = product.variants.id(req.params.variantId);
    if (!variant) {
      return res.status(404).json({ error: 'Variante no encontrada' });
    }
    
    const previousStock = variant.stock;
    const newStock = previousStock + quantity;
    
    if (newStock < 0) {
      return res.status(400).json({ error: 'No se puede reducir el stock por debajo de 0' });
    }
    
    variant.stock = newStock;
    
    // Actualizar stock total del producto
    const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
    product.stock = totalStock;
    
    await product.save();
    
    const movement = new StockMovement({
      productId: product._id,
      productName: `${product.name} - ${variant.name}`,
      type: 'adjustment',
      quantity,
      previousStock,
      newStock,
      reason: reason || `Ajuste manual: ${quantity > 0 ? '+' : ''}${quantity}`,
      userId: req.user.id
    });
    await movement.save();
    
    // Si es una compra, registrar gasto
    if (quantity > 0 && purchasePrice) {
      const Expense = require("../../accounting/models/Expense");
      const expense = new Expense({
        tipo: "compra_inventario",
        monto: quantity * purchasePrice,
        descripcion: `Compra de inventario - ${product.name} - ${variant.name}`,
        metodo: "transferencia",
        proveedor: reason || "Proveedor",
        notas: `Cantidad: ${quantity} x Q${purchasePrice} = Q${quantity * purchasePrice}`,
        creadoPor: req.user.id
      });
      await expense.save();
    }
    
    res.json({ product, variant, movement });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al ajustar stock de variante' });
  }
});

// ============================================
// OBTENER ESTADÍSTICAS PARA GRÁFICA
// ============================================
router.get('/stats/movements', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const movements = await StockMovement.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        sales: { $sum: { $cond: [{ $eq: ["$type", "sale"] }, { $abs: "$quantity" }, 0] } },
        purchases: { $sum: { $cond: [{ $eq: ["$type", "purchase"] }, "$quantity", 0] } },
        adjustments: { $sum: { $cond: [{ $eq: ["$type", "adjustment"] }, "$quantity", 0] } }
      } },
      { $sort: { _id: 1 } }
    ]);
    
    res.json(movements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

module.exports = router;