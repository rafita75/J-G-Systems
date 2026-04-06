// server/modules/pos/routes/pos.js
const express = require("express");
const mongoose = require('mongoose');
const Product = mongoose.model('Product');
const StockMovement = require("../../inventory/models/StockMovement");
const auth = require("../../login/middleware/auth");
const Sale = require('../models/Sale');

const router = express.Router();

// Obtener la función sendNotification desde la app
const getSendNotification = (req) => {
  return req.app.get('sendNotification');
};

// ============================================
// BUSCAR PRODUCTO POR CÓDIGO DE BARRAS (incluye variantes)
// ============================================
router.get("/product/barcode/:code", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "employee") {
      return res.status(403).json({ error: "No autorizado" });
    }

    const barcode = req.params.code;
    
    let product = await Product.findOne({
      barcode: barcode,
      isActive: true,
    }).populate("categoryId");

    if (!product) {
      product = await Product.findOne({
        "variants.barcode": barcode,
        isActive: true,
      }).populate("categoryId");
      
      if (product) {
        const variant = product.variants.find(v => v.barcode === barcode);
        
        if (variant) {
          return res.json({
            _id: product._id,
            name: `${product.name} - ${variant.name}`,
            price: variant.price,
            stock: variant.stock,
            sku: variant.sku,
            barcode: variant.barcode,
            hasVariants: true,
            isVariant: true,
            variantId: variant._id,
            parentProductId: product._id,
            parentProductName: product.name
          });
        }
      }
    }

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json({
      _id: product._id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      sku: product.sku,
      barcode: product.barcode,
      hasVariants: product.hasVariants || false,
      variants: product.variants || [],
      isVariant: false
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al buscar producto" });
  }
});

// ============================================
// BUSCAR PRODUCTOS POR NOMBRE
// ============================================
router.get("/products/search", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "employee") {
      return res.status(403).json({ error: "No autorizado" });
    }

    const { q, limit = 20 } = req.query;
    const query = { isActive: true };

    if (q) {
      query.name = { $regex: q, $options: "i" };
    }

    const products = await Product.find(query)
      .limit(parseInt(limit))
      .sort({ name: 1 });

    const productsWithVariants = products.map(product => ({
      _id: product._id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      sku: product.sku,
      barcode: product.barcode,
      hasVariants: product.hasVariants || false,
      variantsCount: product.variants?.length || 0,
      variants: product.variants || []
    }));

    res.json(productsWithVariants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al buscar productos" });
  }
});

// ============================================
// OBTENER VARIANTES DE UN PRODUCTO
// ============================================
router.get("/product/:productId/variants", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "employee") {
      return res.status(403).json({ error: "No autorizado" });
    }

    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    if (!product.hasVariants || !product.variants || product.variants.length === 0) {
      return res.json({
        hasVariants: false,
        product: {
          _id: product._id,
          name: product.name,
          price: product.price,
          stock: product.stock,
          sku: product.sku
        },
        variants: []
      });
    }

    res.json({
      hasVariants: true,
      product: {
        _id: product._id,
        name: product.name,
        sku: product.sku
      },
      variants: product.variants.map(v => ({
        _id: v._id,
        name: v.name,
        price: v.price || product.price,
        stock: v.stock,
        sku: v.sku,
        image: v.image
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener variantes" });
  }
});

// ============================================
// REGISTRAR VENTA POS (con notificaciones)
// ============================================
router.post("/sale", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "employee") {
      return res.status(403).json({ error: "No autorizado" });
    }

    const { items, clienteNombre, clienteTelefono, paymentMethod, total } = req.body;
    const subtotal = total;

    // Validar stock antes de procesar
    for (const item of items) {
      if (item.variantId) {
        const product = await Product.findById(item.productId);
        const variant = product.variants.id(item.variantId);
        if (!variant) {
          return res.status(404).json({ error: `Variante no encontrada: ${item.name}` });
        }
        if (variant.stock < item.quantity) {
          return res.status(400).json({
            error: `Stock insuficiente para "${item.name}". Disponible: ${variant.stock}`,
          });
        }
      } else {
        const product = await Product.findById(item.productId);
        if (!product) {
          return res.status(404).json({ error: `Producto no encontrado: ${item.name}` });
        }
        if (product.stock < item.quantity) {
          return res.status(400).json({
            error: `Stock insuficiente para "${product.name}". Disponible: ${product.stock}`,
          });
        }
      }
    }

    // Procesar venta y actualizar stock
    const movements = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (item.variantId) {
        const variant = product.variants.id(item.variantId);
        const previousStock = variant.stock;
        const newStock = previousStock - item.quantity;
        variant.stock = newStock;
        
        const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
        product.stock = totalStock;
        
        await product.save();

        const movement = new StockMovement({
          productId: product._id,
          productName: `${product.name} - ${variant.name}`,
          type: "sale",
          quantity: -item.quantity,
          previousStock,
          newStock,
          reason: `Venta POS - ${clienteNombre || "Mostrador"}`,
          userId: req.user.id
        });
        await movement.save();
        movements.push(movement);
      } else {
        const previousStock = product.stock;
        const newStock = previousStock - item.quantity;
        product.stock = newStock;
        await product.save();

        const movement = new StockMovement({
          productId: product._id,
          productName: product.name,
          type: "sale",
          quantity: -item.quantity,
          previousStock,
          newStock,
          reason: `Venta POS - ${clienteNombre || "Mostrador"}`,
          userId: req.user.id
        });
        await movement.save();
        movements.push(movement);
      }
    }

    // Registrar la venta en el modelo Sale
    const sale = new Sale({
      items: items.map(item => ({
        productId: item.productId,
        variantId: item.variantId || null,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        sku: item.sku || ''
      })),
      subtotal,
      total,
      paymentMethod,
      clienteNombre: clienteNombre || "Mostrador",
      clienteTelefono: clienteTelefono || "",
      createdBy: req.user.id
    });
    
    await sale.save();

    // Actualizar movimientos con saleId
    for (const movement of movements) {
      movement.saleId = sale._id;
      await movement.save();
    }

    // Registrar en contabilidad
    const Income = require("../../accounting/models/Income");
    const income = new Income({
      tipo: "venta_rapida",
      monto: total,
      descripcion: `Venta POS - ${items.length} productos`,
      metodo: paymentMethod,
      clienteNombre: clienteNombre || "Cliente mostrador",
      clienteTelefono: clienteTelefono || "",
      esDeuda: false,
      notas: `Venta #${sale.saleNumber}: ${items.map(i => `${i.name} x${i.quantity}`).join(", ")}`,
      creadoPor: req.user.id
    });
    await income.save();

    // ============================================
    // ENVIAR NOTIFICACIÓN A ADMINISTRADORES
    // ============================================
    const sendNotification = req.app.get('sendNotification');
    const User = mongoose.model('User');
    
    const admins = await User.find({ role: 'admin' });
    
    const notification = {
      id: sale._id,
      type: 'sale',
      title: '💰 Nueva venta registrada',
      body: `${sale.clienteNombre || 'Mostrador'} - Total: Q${sale.total.toLocaleString()}`,
      data: {
        saleNumber: sale.saleNumber,
        total: sale.total,
        items: sale.items.length,
        url: '/inventario'
      },
      timestamp: new Date()
    };
    
    for (const admin of admins) {
      sendNotification(admin._id.toString(), notification);
    }
    
    console.log(`Notificaciones enviadas a ${admins.length} administradores`);

    res.json({
      success: true,
      message: "Venta registrada correctamente",
      saleNumber: sale.saleNumber,
      movements,
      total,
    });
  } catch (error) {
    console.error("Error al registrar venta POS:", error);
    res.status(500).json({ error: "Error al registrar venta" });
  }
});

module.exports = router;