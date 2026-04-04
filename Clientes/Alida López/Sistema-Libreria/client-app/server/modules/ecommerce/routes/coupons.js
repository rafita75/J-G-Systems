// server/routes/coupons.js
const express = require('express');
const Coupon = require('../models/Coupon');
const auth = require('../../login/middleware/auth');

const router = express.Router();

// ============================================
// VALIDAR CUPÓN (público)
// ============================================
router.post('/validate', async (req, res) => {
  try {
    const { code, subtotal, userId } = req.body;
    
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    
    if (!coupon) {
      return res.status(404).json({ error: 'Cupón no válido' });
    }
    
    if (!coupon.isValid(userId, subtotal)) {
      return res.status(400).json({ error: 'Cupón expirado o no disponible' });
    }
    
    const discount = coupon.calculateDiscount(subtotal);
    
    res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        name: coupon.name,
        type: coupon.type,
        value: coupon.value,
        discount: discount
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al validar cupón' });
  }
});

// ============================================
// APLICAR CUPÓN (registrar uso)
// ============================================
router.post('/apply', auth, async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    
    if (!coupon) {
      return res.status(404).json({ error: 'Cupón no válido' });
    }
    
    if (!coupon.isValid(req.user.id)) {
      return res.status(400).json({ error: 'Cupón expirado o no disponible' });
    }
    
    if (subtotal < coupon.minPurchase) {
      return res.status(400).json({ 
        error: `El pedido debe ser mayor a $${coupon.minPurchase.toLocaleString()}` 
      });
    }
    
    const discount = coupon.calculateDiscount(subtotal);
    
    // Registrar uso del cupón por el usuario
    coupon.userUsage.push({ userId: req.user.id });
    coupon.usedCount += 1;
    await coupon.save();
    
    res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        name: coupon.name,
        type: coupon.type,
        value: coupon.value,
        discount
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al aplicar cupón' });
  }
});

// ============================================
// OBTENER TODOS LOS CUPONES (admin)
// ============================================
router.get('/admin', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener cupones' });
  }
});

// ============================================
// CREAR CUPÓN (admin)
// ============================================
router.post('/admin', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const coupon = new Coupon(req.body);
    coupon.code = coupon.code.toUpperCase();
    await coupon.save();
    res.status(201).json(coupon);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'El código de cupón ya existe' });
    }
    console.error(error);
    res.status(500).json({ error: 'Error al crear cupón' });
  }
});

// ============================================
// ACTUALIZAR CUPÓN (admin)
// ============================================
router.put('/admin/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!coupon) {
      return res.status(404).json({ error: 'Cupón no encontrado' });
    }
    
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar cupón' });
  }
});

// ============================================
// ELIMINAR CUPÓN (admin)
// ============================================
router.delete('/admin/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Cupón eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar cupón' });
  }
});

module.exports = router;