// ============================================
// CONFIGURACIÓN INICIAL
// ============================================
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const socketIo = require('socket.io');

const connectDB = require('./db');
const { generalLimiter } = require('./shared/middleware/rateLimit');

// ============================================
// INICIALIZACIÓN
// ============================================
const app = express();
connectDB();

const server = http.createServer(app);

// ============================================
// CONFIGURACIÓN DE SOCKET.IO (PRODUCCIÓN)
// ============================================
const io = socketIo(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.FRONTEND_URL // 👈 importante en producción
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// ============================================
// MIDDLEWARES DE SEGURIDAD
// ============================================
app.use(helmet());

// CORS dinámico
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.FRONTEND_URL
    ];

    // Permitir requests sin origin (Postman, mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('❌ CORS bloqueado para:', origin);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true
}));

// Parse JSON
app.use(express.json());

// Logs básicos (útil en producción)
app.use((req, res, next) => {
  console.log(`📌 ${req.method} ${req.url}`);
  next();
});

// Rate limiting
app.use('/api', generalLimiter);

// ============================================
// RUTAS
// ============================================
app.get('/api/test', (req, res) => {
  res.json({ message: 'Servidor funcionando 🚀' });
});

app.use('/api/auth', require('./modules/login/routes/auth'));
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

// ============================================
// SOCKET.IO - USUARIOS CONECTADOS
// ============================================
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('🔌 Cliente conectado:', socket.id);

  socket.on('register-user', (userId) => {
    if (userId) {
      connectedUsers.set(userId.toString(), socket.id);
      console.log(`✅ Usuario ${userId} conectado`);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Cliente desconectado:', socket.id);

    for (let [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`🧹 Usuario ${userId} eliminado`);
        break;
      }
    }
  });
});

// ============================================
// FUNCIÓN GLOBAL DE NOTIFICACIONES
// ============================================
const sendNotification = (userId, notification) => {
  const socketId = connectedUsers.get(userId);

  if (socketId) {
    io.to(socketId).emit('new-notification', notification);
    console.log(`📨 Notificación enviada a ${userId}`);
    return true;
  }

  console.log(`⚠️ Usuario ${userId} no conectado`);
  return false;
};

app.set('sendNotification', sendNotification);
app.set('io', io);

// ============================================
// MANEJO DE ERRORES GLOBAL (IMPORTANTE 🔥)
// ============================================
app.use((err, req, res, next) => {
  console.error('💥 Error:', err.message);
  res.status(500).json({
    error: 'Error interno del servidor'
  });
});

// ============================================
// SERVIDOR
// ============================================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});