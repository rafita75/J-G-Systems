// server/modules/admin/routes/employees.js
const express = require('express');
const User = require('../../login/models/User');
const auth = require('../../login/middleware/auth');
const { requireAdmin } = require('../../../shared/middleware/permissions');

const router = express.Router();

// ============================================
// OBTENER TODOS LOS EMPLEADOS (solo admin)
// ============================================
router.get('/', auth, requireAdmin, async (req, res) => {
  try {
    const employees = await User.find({ 
      role: 'employee',
      createdBy: req.user.id 
    }).select('-password').sort({ createdAt: -1 });
    
    res.json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener empleados' });
  }
});

// ============================================
// CREAR EMPLEADO (solo admin)
// ============================================
router.post('/', auth, requireAdmin, async (req, res) => {
  try {
    const { name, email, password, permissions } = req.body;
    
    // Verificar si ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    
    const employee = new User({
      name,
      email,
      password,
      role: 'employee',
      permissions: permissions || {
        viewProducts: false,
        createProducts: false,
        editProducts: false,
        deleteProducts: false,
        viewOrders: false,
        updateOrderStatus: false,
        viewAppointments: false,
        createAppointments: false,
        updateAppointmentStatus: false,
        usePOS: false,
        viewAccounting: false,
        viewCustomers: false,
        editOwnProfile: true,
        manageEmployees: false
      },
      createdBy: req.user.id
    });
    
    await employee.save();
    
    res.status(201).json({
      id: employee._id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      permissions: employee.permissions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear empleado' });
  }
});

// ============================================
// ACTUALIZAR EMPLEADO (solo admin)
// ============================================
router.put('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const { name, email, password, permissions, isActive } = req.body;
    const employee = await User.findOne({ _id: req.params.id, role: 'employee', createdBy: req.user.id });
    
    if (!employee) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    
    if (name) employee.name = name;
    if (email) employee.email = email;
    if (permissions) employee.permissions = permissions;
    if (isActive !== undefined) employee.isActive = isActive;
    if (password) employee.password = password;
    
    await employee.save();
    
    res.json({
      id: employee._id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      permissions: employee.permissions,
      isActive: employee.isActive
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar empleado' });
  }
});

// ============================================
// ELIMINAR EMPLEADO (solo admin)
// ============================================
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const employee = await User.findOneAndDelete({ 
      _id: req.params.id, 
      role: 'employee',
      createdBy: req.user.id 
    });
    
    if (!employee) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    
    res.json({ message: 'Empleado eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar empleado' });
  }
});

module.exports = router;