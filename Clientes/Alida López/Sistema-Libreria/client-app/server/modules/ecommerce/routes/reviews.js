// server/routes/reviews.js
const express = require('express');
const Review = require('../models/Review');
const Order = require('../models/Order');
const auth = require('../../login/middleware/auth');

const router = express.Router();

// ============================================
// OBTENER RESEÑAS DE UN PRODUCTO
// ============================================
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .sort({ createdAt: -1 });
    
    // Calcular promedio de calificaciones
    const total = reviews.length;
    const avgRating = total > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / total 
      : 0;
    
    res.json({
      reviews,
      stats: {
        total,
        averageRating: avgRating.toFixed(1),
        distribution: {
          5: reviews.filter(r => r.rating === 5).length,
          4: reviews.filter(r => r.rating === 4).length,
          3: reviews.filter(r => r.rating === 3).length,
          2: reviews.filter(r => r.rating === 2).length,
          1: reviews.filter(r => r.rating === 1).length
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener reseñas' });
  }
});

// ============================================
// CREAR RESEÑA (solo usuarios que compraron)
// ============================================
router.post('/', auth, async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;
    
    // Verificar si el usuario ya dejó reseña
    const existingReview = await Review.findOne({
      productId,
      userId: req.user.id
    });
    
    if (existingReview) {
      return res.status(400).json({ error: 'Ya dejaste una reseña para este producto' });
    }
    
    // Verificar si el usuario compró el producto
    const hasPurchased = await Order.findOne({
      userId: req.user.id,
      'items.productId': productId,
      status: { $in: ['delivered', 'shipped'] }
    });
    
    const review = new Review({
      productId,
      userId: req.user.id,
      userName: req.user.name,
      rating,
      title: title || '',
      comment,
      isVerified: !!hasPurchased
    });
    
    await review.save();
    res.status(201).json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear reseña' });
  }
});

// ============================================
// ACTUALIZAR RESEÑA (solo el autor)
// ============================================
router.put('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ error: 'Reseña no encontrada' });
    }
    
    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const { rating, title, comment } = req.body;
    review.rating = rating || review.rating;
    review.title = title || review.title;
    review.comment = comment || review.comment;
    review.updatedAt = Date.now();
    
    await review.save();
    res.json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar reseña' });
  }
});

// ============================================
// ELIMINAR RESEÑA (admin o autor)
// ============================================
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ error: 'Reseña no encontrada' });
    }
    
    if (review.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    await review.deleteOne();
    res.json({ message: 'Reseña eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar reseña' });
  }
});

module.exports = router;