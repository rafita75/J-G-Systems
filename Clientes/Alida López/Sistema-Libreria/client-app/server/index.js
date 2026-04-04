// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');

const { generalLimiter } = require('./shared/middleware/rateLimit');

// Cargar variables de entorno desde .env
dotenv.config();

// Crear la aplicación de Express
const app = express();

// ============================================
// MIDDLEWARES DE SEGURIDAD
// ============================================

// Helmet protege cabeceras HTTP
app.use(helmet());

// CORS configurado (solo permite el frontend)
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// Parsear JSON
app.use(express.json());

// Rate limiting global (protege toda la API)
app.use('/api', generalLimiter);

// ============================================
// RUTAS DE LA API
// ============================================

// Ruta de prueba para verificar que el servidor funciona
app.get('/api/test', (req, res) => {
  res.json({ message: 'El servidor funciona correctamente!' });
});

// Rutas de autenticación
app.use('/api/auth', require('./modules/login/routes/auth'));

// Configuración de colores
app.use('/api/config', require('./modules/core/routes/config'));

app.use('/api/superadmin', require('./modules/superadmin/routes/superadmin'));

app.use('/api/modules', require('./modules/modules/routes/modules'));

app.use('/api/sections', require('./modules/landing/routes/sections'));

app.use('/api/categories', require('./modules/ecommerce/routes/categories'));
app.use('/api/products', require('./modules/ecommerce/routes/products'));

app.use('/api/orders', require('./modules/ecommerce/routes/orders'));

app.use('/api/reviews', require('./modules/ecommerce/routes/reviews'));

app.use('/api/wishlist', require('./modules/ecommerce/routes/wishlist'));

app.use('/api/coupons', require('./modules/ecommerce/routes/coupons'));

app.use('/api/accounting', require('./modules/accounting/routes/accounting'));

app.use('/api/services', require('./modules/appointments/routes/services'));
app.use('/api/professionals', require('./modules/appointments/routes/professionals'));
app.use('/api/availability', require('./modules/appointments/routes/availability'));
app.use('/api/appointments', require('./modules/appointments/routes/appointments'));

app.use('/api/inventory', require('./modules/inventory/routes/inventory'));

app.use('/api/pos', require('./modules/pos/routes/pos'));

app.use('/api/employees', require('./modules/admin/routes/employees'));
// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mi-app')
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error conectando a MongoDB:', err));

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});