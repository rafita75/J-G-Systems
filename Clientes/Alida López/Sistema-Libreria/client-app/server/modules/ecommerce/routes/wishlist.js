// server/routes/wishlist.js
const express = require('express');
const Wishlist = require('../models/Wishlist');
const auth = require('../../login/middleware/auth');

const router = express.Router();

// ============================================
// OBTENER LISTA DE DESEOS DEL USUARIO
// ============================================
router.get('/', auth, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user.id })
      .populate('products.productId');
    
    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.user.id, products: [] });
      await wishlist.save();
    }
    
    res.json(wishlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener lista de deseos' });
  }
});

// ============================================
// AGREGAR PRODUCTO A LISTA DE DESEOS
// ============================================
router.post('/add', auth, async (req, res) => {
  try {
    const { productId } = req.body;
    
    let wishlist = await Wishlist.findOne({ userId: req.user.id });
    
    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.user.id, products: [] });
    }
    
    // Verificar si ya existe
    const exists = wishlist.products.some(p => p.productId.toString() === productId);
    
    if (!exists) {
      wishlist.products.push({ productId, addedAt: Date.now() });
      wishlist.updatedAt = Date.now();
      await wishlist.save();
    }
    
    res.json(wishlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al agregar a lista de deseos' });
  }
});

// ============================================
// ELIMINAR PRODUCTO DE LISTA DE DESEOS
// ============================================
router.delete('/remove/:productId', auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user.id });
    
    if (wishlist) {
      wishlist.products = wishlist.products.filter(
        p => p.productId.toString() !== req.params.productId
      );
      wishlist.updatedAt = Date.now();
      await wishlist.save();
    }
    
    res.json(wishlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar de lista de deseos' });
  }
});

module.exports = router;