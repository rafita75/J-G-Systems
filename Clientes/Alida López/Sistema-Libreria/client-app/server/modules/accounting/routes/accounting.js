// server/modules/accounting/routes/accounting.js
const express = require('express');
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const CustomerDebt = require('../models/CustomerDebt');
const BusinessDebt = require('../models/BusinessDebt');
const CashMovement = require('../models/CashMovement');
const auth = require('../../login/middleware/auth');
const SiteConfig = require('../../core/models/SiteConfig');

const router = express.Router();

// ============================================
// FUNCIONES DE VERIFICACIÓN DE PERMISOS
// ============================================
function canViewAccounting(req) {
  if (req.user.role === 'admin') return true;
  if (req.user.role === 'employee' && req.user.viewAccounting) return true;
  return false;
}

function canWriteAccounting(req) {
  if (req.user.role === 'admin') return true;
  return false;
}

function canPayDebts(req) {
  if (req.user.role === 'admin') return true;
  if (req.user.role === 'employee') return true; // Permitir a empleados pagar deudas
  return false;
}

// ============================================
// MIDDLEWARE PARA VERIFICAR MÓDULO DE CONTABILIDAD
// ============================================
async function checkAccountingModule(req, res, next) {
  try {
    const config = await SiteConfig.findOne();
    if (!config || !config.modules || config.modules.accounting !== true) {
      return res.status(403).json({ 
        error: 'Módulo de contabilidad no disponible. Contrata este módulo para acceder a reportes y dashboard.',
        code: 'MODULE_NOT_ACTIVE',
        canUpgrade: true
      });
    }
    next();
  } catch (error) {
    console.error('Error verificando módulo:', error);
    res.status(500).json({ error: 'Error al verificar módulo' });
  }
}

// ============================================
// RUTAS DE ESCRITURA (SOLO ADMIN)
// ============================================

async function getCurrentCashBalance() {
  const lastMovement = await CashMovement.findOne().sort({ fecha: -1 });
  return lastMovement ? lastMovement.saldoNuevo : 0;
}

async function updateCash(tipo, monto, descripcion, referenciaId) {
  const saldoAnterior = await getCurrentCashBalance();
  const saldoNuevo = tipo === 'ingreso' ? saldoAnterior + monto : saldoAnterior - monto;
  
  const movement = new CashMovement({
    tipo,
    monto,
    descripcion,
    referenciaId,
    saldoAnterior,
    saldoNuevo
  });
  
  await movement.save();
  return movement;
}

router.post('/sale', auth, async (req, res) => {
  try {
    if (!canWriteAccounting(req)) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const { monto, descripcion, metodo, clienteNombre, clienteTelefono, esDeuda, notas } = req.body;
    
    const income = new Income({
      tipo: 'venta_rapida',
      monto,
      descripcion,
      metodo: metodo || 'efectivo',
      clienteNombre: clienteNombre || '',
      clienteTelefono: clienteTelefono || '',
      esDeuda: esDeuda === true || esDeuda === 'true',
      notas: notas || '',
      creadoPor: req.user.id
    });
    
    await income.save();
    
    const isDebt = esDeuda === true || esDeuda === 'true';
    
    if (isDebt) {
      const debt = new CustomerDebt({
        clienteNombre: clienteNombre || 'Cliente sin nombre',
        clienteTelefono: clienteTelefono || '',
        monto,
        notas: `Venta: ${descripcion} - ${new Date().toLocaleDateString()}`
      });
      await debt.save();
    } else {
      await updateCash('ingreso', monto, `Venta: ${descripcion}`, income._id);
    }
    
    res.status(201).json(income);
  } catch (error) {
    console.error('Error al registrar venta:', error);
    res.status(500).json({ error: 'Error al registrar venta' });
  }
});

router.post('/expense', auth, async (req, res) => {
  try {
    if (!canWriteAccounting(req)) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const expense = new Expense({
      ...req.body,
      creadoPor: req.user.id
    });
    
    await expense.save();
    await updateCash('gasto', expense.monto, `Gasto: ${expense.descripcion}`, expense._id);
    
    res.status(201).json(expense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar gasto' });
  }
});

router.post('/customer-debt', auth, async (req, res) => {
  try {
    if (!canWriteAccounting(req)) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const debt = new CustomerDebt(req.body);
    await debt.save();
    res.status(201).json(debt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar deuda' });
  }
});

router.put('/customer-debt/:id/pay', auth, async (req, res) => {
  try {
    if (!canPayDebts(req)) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const debt = await CustomerDebt.findById(req.params.id);
    if (!debt) {
      return res.status(404).json({ error: 'Deuda no encontrada' });
    }
    
    if (debt.estado === 'pagado') {
      return res.status(400).json({ error: 'Esta deuda ya fue pagada' });
    }
    
    debt.estado = 'pagado';
    debt.fechaPago = Date.now();
    await debt.save();
    
    const income = new Income({
      tipo: 'manual',
      monto: debt.monto,
      descripcion: `Pago de deuda - ${debt.clienteNombre}`,
      metodo: req.body.metodo || 'efectivo',
      clienteNombre: debt.clienteNombre,
      esDeuda: false,
      notas: `Deuda pagada: ${debt._id}`
    });
    await income.save();
    
    await updateCash('ingreso', debt.monto, `Pago de deuda: ${debt.clienteNombre}`, income._id);
    
    res.json(debt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al pagar deuda' });
  }
});

router.post('/business-debt', auth, async (req, res) => {
  try {
    if (!canWriteAccounting(req)) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const debt = new BusinessDebt(req.body);
    await debt.save();
    res.status(201).json(debt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar deuda' });
  }
});

router.put('/business-debt/:id/pay', auth, async (req, res) => {
  try {
    if (!canWriteAccounting(req)) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const debt = await BusinessDebt.findById(req.params.id);
    if (!debt) {
      return res.status(404).json({ error: 'Deuda no encontrada' });
    }
    
    if (debt.estado === 'pagado') {
      return res.status(400).json({ error: 'Esta deuda ya fue pagada' });
    }
    
    debt.estado = 'pagado';
    debt.fechaPago = Date.now();
    await debt.save();
    
    const expense = new Expense({
      monto: debt.monto,
      categoria: 'insumos',
      descripcion: `Pago a proveedor: ${debt.proveedor}`,
      notas: `Deuda pagada: ${debt._id}`
    });
    await expense.save();
    
    await updateCash('gasto', debt.monto, `Pago a proveedor: ${debt.proveedor}`, expense._id);
    
    res.json(debt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al pagar deuda' });
  }
});

router.post('/sync-order/:orderId', auth, async (req, res) => {
  try {
    if (!canWriteAccounting(req)) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const Order = require('../../ecommerce/models/Order');
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    
    const existingIncome = await Income.findOne({ pedidoOnlineId: order._id });
    if (existingIncome) {
      return res.status(400).json({ error: 'Este pedido ya fue sincronizado' });
    }
    
    const income = new Income({
      tipo: 'pedido_online',
      monto: order.total,
      descripcion: `Pedido online #${order.orderNumber}`,
      metodo: order.paymentMethod || 'transferencia',
      clienteNombre: order.customer.name,
      pedidoOnlineId: order._id,
      esDeuda: false,
      notas: `Pedido ${order.orderNumber} - ${order.items.length} productos`,
      creadoPor: req.user.id
    });
    
    await income.save();
    await updateCash('ingreso', order.total, `Pedido online #${order.orderNumber}`, income._id);
    
    res.json({ message: 'Pedido sincronizado con contabilidad', income });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al sincronizar pedido' });
  }
});

// ============================================
// RUTAS DE LECTURA (con permisos)
// ============================================

router.get('/dashboard', auth, checkAccountingModule, async (req, res) => {
  try {
    if (!canViewAccounting(req)) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const semanaAtras = new Date();
    semanaAtras.setDate(semanaAtras.getDate() - 7);
    
    const mesAtras = new Date();
    mesAtras.setMonth(mesAtras.getMonth() - 1);
    
    const ventasHoy = await Income.find({ fecha: { $gte: hoy }, esDeuda: false });
    const ingresosHoy = ventasHoy.reduce((sum, i) => sum + i.monto, 0);
    
    const gastosHoy = await Expense.find({ fecha: { $gte: hoy } });
    const egresosHoy = gastosHoy.reduce((sum, g) => sum + g.monto, 0);
    
    const ventasSemana = await Income.find({ fecha: { $gte: semanaAtras }, esDeuda: false });
    const ingresosSemana = ventasSemana.reduce((sum, i) => sum + i.monto, 0);
    
    const gastosSemana = await Expense.find({ fecha: { $gte: semanaAtras } });
    const egresosSemana = gastosSemana.reduce((sum, g) => sum + g.monto, 0);
    
    const ventasMes = await Income.find({ fecha: { $gte: mesAtras }, esDeuda: false });
    const ingresosMes = ventasMes.reduce((sum, i) => sum + i.monto, 0);
    
    const gastosMes = await Expense.find({ fecha: { $gte: mesAtras } });
    const egresosMes = gastosMes.reduce((sum, g) => sum + g.monto, 0);
    
    const deudasClientes = await CustomerDebt.find({ estado: 'pendiente' });
    const totalDeudasClientes = deudasClientes.reduce((sum, d) => sum + d.monto, 0);
    
    const deudasNegocio = await BusinessDebt.find({ estado: 'pendiente' });
    const totalDeudasNegocio = deudasNegocio.reduce((sum, d) => sum + d.monto, 0);
    
    const ultimosMovimientos = await CashMovement.find().sort({ fecha: -1 }).limit(15);
    const saldoActual = await getCurrentCashBalance();
    
    res.json({
      hoy: {
        ingresos: ingresosHoy,
        gastos: egresosHoy,
        ganancia: ingresosHoy - egresosHoy
      },
      semana: {
        ingresos: ingresosSemana,
        gastos: egresosSemana,
        ganancia: ingresosSemana - egresosSemana
      },
      mes: {
        ingresos: ingresosMes,
        gastos: egresosMes,
        ganancia: ingresosMes - egresosMes
      },
      deudas: {
        clientes: { total: totalDeudasClientes, items: deudasClientes },
        negocio: { total: totalDeudasNegocio, items: deudasNegocio }
      },
      caja: {
        saldoActual,
        ultimosMovimientos
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener dashboard' });
  }
});

router.get('/incomes', auth, checkAccountingModule, async (req, res) => {
  try {
    if (!canViewAccounting(req)) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const { fechaInicio, fechaFin } = req.query;
    const query = {};
    
    if (fechaInicio) query.fecha = { $gte: new Date(fechaInicio) };
    if (fechaFin) query.fecha = { ...query.fecha, $lte: new Date(fechaFin) };
    
    const incomes = await Income.find(query).sort({ fecha: -1 });
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ingresos' });
  }
});

router.get('/expenses', auth, checkAccountingModule, async (req, res) => {
  try {
    if (!canViewAccounting(req)) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const { fechaInicio, fechaFin } = req.query;
    const query = {};
    
    if (fechaInicio) query.fecha = { $gte: new Date(fechaInicio) };
    if (fechaFin) query.fecha = { ...query.fecha, $lte: new Date(fechaFin) };
    
    const expenses = await Expense.find(query).sort({ fecha: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener gastos' });
  }
});

router.get('/report', auth, checkAccountingModule, async (req, res) => {
  try {
    if (!canViewAccounting(req)) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    let startDate, endDate;
    const { period, start, end } = req.query;
    
    if (period === 'week') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      endDate = new Date();
    } else if (period === 'month') {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      endDate = new Date();
    } else if (start && end) {
      startDate = new Date(start);
      endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      endDate = new Date();
    }
    
    const incomes = await Income.find({ fecha: { $gte: startDate, $lte: endDate }, esDeuda: false });
    const expenses = await Expense.find({ fecha: { $gte: startDate, $lte: endDate } });
    
    const dailyData = {};
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dailyData[dateStr] = { income: 0, expense: 0 };
    }
    
    incomes.forEach(i => {
      const dateStr = new Date(i.fecha).toISOString().split('T')[0];
      if (dailyData[dateStr]) dailyData[dateStr].income += i.monto;
    });
    
    expenses.forEach(e => {
      const dateStr = new Date(e.fecha).toISOString().split('T')[0];
      if (dailyData[dateStr]) dailyData[dateStr].expense += e.monto;
    });
    
    const dailyLabels = Object.keys(dailyData);
    const dailyIncomes = dailyLabels.map(d => dailyData[d].income);
    const dailyExpenses = dailyLabels.map(d => dailyData[d].expense);
    const dailyProfits = dailyLabels.map(d => dailyData[d].income - dailyData[d].expense);
    
    const expenseCategories = {};
    expenses.forEach(e => {
      if (!expenseCategories[e.categoria]) expenseCategories[e.categoria] = 0;
      expenseCategories[e.categoria] += e.monto;
    });
    
    const totalIncomes = incomes.reduce((sum, i) => sum + i.monto, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.monto, 0);
    
    const incomeTransactions = incomes.map(i => ({
      fecha: i.fecha,
      tipo: 'ingreso',
      descripcion: i.descripcion,
      monto: i.monto,
      metodo: i.metodo
    }));
    
    const expenseTransactions = expenses.map(e => ({
      fecha: e.fecha,
      tipo: 'gasto',
      descripcion: e.descripcion,
      monto: e.monto,
      metodo: '-'
    }));
    
    const allTransactions = [...incomeTransactions, ...expenseTransactions].sort((a, b) => b.fecha - a.fecha);
    
    res.json({
      totalIncomes,
      totalExpenses,
      netProfit: totalIncomes - totalExpenses,
      dailyLabels,
      dailyIncomes,
      dailyExpenses,
      dailyProfits,
      expenseCategories: Object.entries(expenseCategories).map(([categoria, total]) => ({ categoria, total })),
      transactions: allTransactions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar reporte' });
  }
});

router.get('/customer-debts', auth, async (req, res) => {
  try {
    if (!canViewAccounting(req)) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const debts = await CustomerDebt.find().sort({ fecha: -1 });
    res.json(debts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener deudas' });
  }
});

module.exports = router;