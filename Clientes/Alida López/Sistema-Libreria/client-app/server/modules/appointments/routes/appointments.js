// server/routes/appointments.js
const express = require('express');
const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const auth = require('../../login/middleware/auth');

const router = express.Router();

// ============================================
// CREAR RESERVA
// ============================================
router.post('/', auth, async (req, res) => {
  try {
    const { serviceId, professionalId, fecha, hora, telefono, notas } = req.body;
    
    // Verificar que el servicio existe
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }
    
    // Verificar que no hay conflicto de horario
    const existingAppointment = await Appointment.findOne({
      fecha,
      hora,
      professionalId: professionalId || null,
      estado: { $nin: ['cancelled'] }
    });
    
    if (existingAppointment) {
      return res.status(400).json({ error: 'Horario no disponible' });
    }
    
    const appointment = new Appointment({
      serviceId,
      professionalId: professionalId || null,
      userId: req.user.id,
      clienteNombre: req.user.name,
      clienteTelefono: telefono,
      clienteEmail: req.user.email,
      fecha,
      hora,
      notas: notas || '',
      estado: 'pending'
    });
    
    await appointment.save();
    
    res.status(201).json(appointment);
  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({ error: 'Error al crear reserva' });
  }
});

// ============================================
// OBTENER MIS RESERVAS
// ============================================
router.get('/my', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user.id })
      .populate('serviceId', 'name duration price')
      .populate('professionalId', 'name')
      .sort({ fecha: -1, hora: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
});

// ============================================
// CANCELAR RESERVA (usuario)
// ============================================
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!appointment) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }
    
    if (appointment.estado === 'cancelled') {
      return res.status(400).json({ error: 'Esta reserva ya fue cancelada' });
    }
    
    appointment.estado = 'cancelled';
    appointment.cancelReason = reason || 'Cancelado por el cliente';
    appointment.updatedAt = Date.now();
    await appointment.save();
    
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: 'Error al cancelar reserva' });
  }
});

// ============================================
// OBTENER TODAS LAS RESERVAS (admin)
// ============================================
router.get('/admin', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const appointments = await Appointment.find()
      .populate('serviceId', 'name duration price')
      .populate('professionalId', 'name')
      .sort({ fecha: -1, hora: -1 });
    
    res.json(appointments);
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
});

// ============================================
// ACTUALIZAR ESTADO DE RESERVA (admin)
// ============================================
router.put('/admin/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const { status, cancelReason } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }
    
    appointment.estado = status;
    if (status === 'cancelled' && cancelReason) {
      appointment.cancelReason = cancelReason;
    }
    appointment.updatedAt = Date.now();
    await appointment.save();
    
    res.json(appointment);
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
});

// ============================================
// CREAR RESERVA MANUAL (admin)
// ============================================
router.post('/admin/create', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const { serviceId, professionalId, fecha, hora, clienteNombre, clienteTelefono, clienteEmail, notas } = req.body;
    
    // Verificar que el servicio existe
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }
    
    // Verificar que no hay conflicto de horario
    const existingAppointment = await Appointment.findOne({
      fecha,
      hora,
      professionalId: professionalId || null,
      estado: { $nin: ['cancelled'] }
    });
    
    if (existingAppointment) {
      return res.status(400).json({ error: 'Horario no disponible' });
    }
    
    const appointment = new Appointment({
      serviceId,
      professionalId: professionalId || null,
      userId: null,
      clienteNombre,
      clienteTelefono,
      clienteEmail: clienteEmail || '',
      fecha,
      hora,
      notas: notas || '',
      estado: 'confirmed' // Las reservas manuales se confirman automáticamente
    });
    
    await appointment.save();
    
    res.status(201).json(appointment);
  } catch (error) {
    console.error('Error al crear reserva manual:', error);
    res.status(500).json({ error: 'Error al crear reserva' });
  }
});

module.exports = router;