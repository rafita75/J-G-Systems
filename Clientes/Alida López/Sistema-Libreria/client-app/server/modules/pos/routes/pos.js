// server/modules/pos/routes/pos.js
const express = require("express");
const Product = require("../../ecommerce/models/Product");
const StockMovement = require("../../inventory/models/StockMovement");
const auth = require("../../login/middleware/auth");

const router = express.Router();

// ============================================
// BUSCAR PRODUCTO POR CÓDIGO DE BARRAS
// ============================================
router.get("/product/barcode/:code", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "No autorizado" });
    }

    const product = await Product.findOne({
      barcode: req.params.code,
      isActive: true,
    }).populate("categoryId");

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(product);
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
    if (req.user.role !== "admin") {
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

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al buscar productos" });
  }
});

// ============================================
// REGISTRAR VENTA POS
// ============================================
router.post("/sale", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "No autorizado" });
    }

    const { items, clienteNombre, clienteTelefono, paymentMethod, total } =
      req.body;

    // Validar stock antes de procesar
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res
          .status(404)
          .json({ error: `Producto no encontrado: ${item.name}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: `Stock insuficiente para "${product.name}". Disponible: ${product.stock}`,
        });
      }
    }

    // Procesar venta y actualizar stock
    const movements = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
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
        userId: req.user.id,
      });
      await movement.save();
      movements.push(movement);
    }

    // ============================================
    // SIEMPRE REGISTRAR EN CONTABILIDAD
    // ============================================
    const Income = require("../../accounting/models/Income");

    const income = new Income({
      tipo: "venta_rapida",
      monto: total,
      descripcion: `Venta POS - ${items.length} productos`,
      metodo: paymentMethod,
      clienteNombre: clienteNombre || "Cliente mostrador",
      clienteTelefono: clienteTelefono || "",
      esDeuda: false,
      notas: `Venta POS: ${items
        .map((i) => `${i.name} x${i.quantity}`)
        .join(", ")}`,
      creadoPor: req.user.id,
    });
    await income.save();

    res.json({
      success: true,
      message: "Venta registrada correctamente",
      movements,
      total,
    });
  } catch (error) {
    console.error("Error al registrar venta POS:", error);
    res.status(500).json({ error: "Error al registrar venta" });
  }
});

module.exports = router;
