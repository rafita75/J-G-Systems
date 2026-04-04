// server/routes/availability.js
const express = require('express');
const Appointment = require('../models/Appointment');
const Schedule = require('../models/Schedule');
const Professional = require('../models/Professional');

const router = express.Router();

// ============================================
// OBTENER HORARIOS DISPONIBLES
// ============================================
router.get('/', async (req, res) => {
  try {
    const { professionalId, serviceId, fecha } = req.query;
    
    if (!fecha) {
      return res.status(400).json({ error: 'Fecha requerida' });
    }
    
    // Obtener duración del servicio
    const Service = require('../models/Service');
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }
    
    const duration = service.duration;
    const date = new Date(fecha);
    const dayOfWeek = date.getDay();
    
    // Obtener horarios disponibles según profesional
    let schedules = [];
    
    if (professionalId && professionalId !== 'null') {
      // Buscar horario de profesional específico
      schedules = await Schedule.find({ 
        professionalId, 
        dayOfWeek, 
        isActive: true 
      });
    } else {
      // Buscar horarios de todos los profesionales activos
      const professionals = await Professional.find({ isActive: true });
      schedules = await Schedule.find({ 
        professionalId: { $in: professionals.map(p => p._id) }, 
        dayOfWeek, 
        isActive: true 
      });
    }
    
    if (schedules.length === 0) {
      return res.json([]);
    }
    
    // Generar slots de tiempo
    const slots = [];
    const appointments = await Appointment.find({
      fecha,
      estado: { $nin: ['cancelled'] }
    });
    
    for (const schedule of schedules) {
      const startHour = parseInt(schedule.startTime.split(':')[0]);
      const startMinute = parseInt(schedule.startTime.split(':')[1]);
      const endHour = parseInt(schedule.endTime.split(':')[0]);
      const endMinute = parseInt(schedule.endTime.split(':')[1]);
      
      let currentHour = startHour;
      let currentMinute = startMinute;
      
      while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
        const timeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
        const endTime = new Date(date);
        endTime.setHours(currentHour, currentMinute + duration, 0);
        
        // Verificar si el slot está ocupado
        const isBooked = appointments.some(apt => 
          apt.hora === timeStr && 
          (apt.professionalId?.toString() === schedule.professionalId?.toString() || !apt.professionalId)
        );
        
        if (!isBooked) {
          slots.push({
            time: timeStr,
            professionalId: schedule.professionalId,
            professional: await Professional.findById(schedule.professionalId)
          });
        }
        
        // Avanzar según duración del servicio
        currentMinute += duration;
        if (currentMinute >= 60) {
          currentHour += Math.floor(currentMinute / 60);
          currentMinute = currentMinute % 60;
        }
      }
    }
    
    // Eliminar duplicados por horario
    const uniqueSlots = [];
    const seenTimes = new Set();
    for (const slot of slots) {
      if (!seenTimes.has(slot.time)) {
        seenTimes.add(slot.time);
        uniqueSlots.push(slot);
      }
    }
    
    res.json(uniqueSlots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener disponibilidad' });
  }
});

module.exports = router;