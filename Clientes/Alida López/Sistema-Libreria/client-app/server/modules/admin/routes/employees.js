// server/modules/admin/routes/employees.js
const express = require('express');
const User = require('../../login/models/User');
const auth = require('../../login/middleware/auth');
const { requireAdmin } = require('../../../shared/middleware/permissions');

const router = express.Router();

// ============================================
// OBTENER TODOS LOS EMPLEADOS
// ============================================
router.get('/', auth, requireAdmin, async (req, res) => {
  try {
    const employees = await User.find({ 
      role: 'employee'
    }).select('-password').sort({ createdAt: -1 });
    
    res.json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener empleados' });
  }
});

// ============================================
// CREAR EMPLEADO
// ============================================
router.post('/', auth, requireAdmin, async (req, res) => {
  try {
    const { 
      name, email, password,
      viewProducts, createProducts, editProducts, deleteProducts,
      viewInventory, adjustStock,
      usePOS,
      viewAccounting,
      viewCustomers
    } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    
    const employee = new User({
      name,
      email,
      password,
      role: 'employee',
      isActive: true,
      // Productos
      viewProducts: viewProducts || false,
      createProducts: createProducts || false,
      editProducts: editProducts || false,
      deleteProducts: deleteProducts || false,
      // Inventario
      viewInventory: viewInventory || false,
      adjustStock: adjustStock || false,
      // POS
      usePOS: usePOS || false,
      // Contabilidad
      viewAccounting: viewAccounting || false,
      // Clientes
      viewCustomers: viewCustomers || false,
      createdBy: req.user.id
    });
    
    await employee.save();
    
    // Devolver el empleado creado
    const savedEmployee = await User.findById(employee._id).select('-password');
    res.status(201).json(savedEmployee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear empleado' });
  }
});

// ============================================
// ACTUALIZAR EMPLEADO
// ============================================
router.put('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const { 
      name, email, password, isActive,
      viewProducts, createProducts, editProducts, deleteProducts,
      viewInventory, adjustStock,
      usePOS,
      viewAccounting,
      viewCustomers
    } = req.body;
    
    const employee = await User.findOne({ _id: req.params.id, role: 'employee' });
    
    if (!employee) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    
    // Actualizar campos básicos
    if (name !== undefined) employee.name = name;
    if (email !== undefined) employee.email = email;
    if (isActive !== undefined) employee.isActive = isActive;
    if (password && password.trim()) employee.password = password;
    
    // Actualizar permisos de productos
    if (viewProducts !== undefined) employee.viewProducts = viewProducts;
    if (createProducts !== undefined) employee.createProducts = createProducts;
    if (editProducts !== undefined) employee.editProducts = editProducts;
    if (deleteProducts !== undefined) employee.deleteProducts = deleteProducts;
    
    // Actualizar permisos de inventario
    if (viewInventory !== undefined) employee.viewInventory = viewInventory;
    if (adjustStock !== undefined) employee.adjustStock = adjustStock;
    
    // Actualizar permisos de POS
    if (usePOS !== undefined) employee.usePOS = usePOS;
    
    // Actualizar permisos de contabilidad
    if (viewAccounting !== undefined) employee.viewAccounting = viewAccounting;
    
    // Actualizar permisos de clientes
    if (viewCustomers !== undefined) employee.viewCustomers = viewCustomers;
    
    await employee.save();
    
    // Devolver el empleado actualizado
    const updatedEmployee = await User.findById(employee._id).select('-password');
    res.json(updatedEmployee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar empleado' });
  }
});

// ============================================
// ELIMINAR EMPLEADO
// ============================================
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const employee = await User.findOneAndDelete({ 
      _id: req.params.id, 
      role: 'employee'
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