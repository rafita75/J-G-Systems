// client/src/pages/Admin/EmployeesManager.jsx
import { useState, useEffect } from 'react';
import api from '../../../shared/services/api';
import Button from '../../core/components/UI/Button';
import Card from '../../core/components/UI/Card';
import Input from '../../core/components/UI/Input';

export default function EmployeesManager() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    isActive: true,
    viewProducts: false,
    createProducts: false,
    editProducts: false,
    deleteProducts: false,
    viewInventory: false,
    adjustStock: false,
    usePOS: false,
    viewAccounting: false,
    viewCustomers: false
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const { data } = await api.get('/employees');
      setEmployees(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/employees/${editing._id}`, formData);
        setMessage('✅ Empleado actualizado');
      } else {
        await api.post('/employees', formData);
        setMessage('✅ Empleado creado');
      }
      setShowForm(false);
      setEditing(null);
      resetForm();
      loadEmployees();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error:', error);
      setMessage(error.response?.data?.error || '❌ Error al guardar');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      isActive: true,
      viewProducts: false,
      createProducts: false,
      editProducts: false,
      deleteProducts: false,
      viewInventory: false,
      adjustStock: false,
      usePOS: false,
      viewAccounting: false,
      viewCustomers: false
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este empleado?')) return;
    try {
      await api.delete(`/employees/${id}`);
      setMessage('✅ Empleado eliminado');
      loadEmployees();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error al eliminar');
    }
  };

  const handleEdit = (emp) => {
    setEditing(emp);
    setFormData({
      name: emp.name || '',
      email: emp.email || '',
      password: '',
      isActive: emp.isActive !== false,
      viewProducts: emp.viewProducts || false,
      createProducts: emp.createProducts || false,
      editProducts: emp.editProducts || false,
      deleteProducts: emp.deleteProducts || false,
      viewInventory: emp.viewInventory || false,
      adjustStock: emp.adjustStock || false,
      usePOS: emp.usePOS || false,
      viewAccounting: emp.viewAccounting || false,
      viewCustomers: emp.viewCustomers || false
    });
    setShowForm(true);
  };

  const togglePermission = (perm) => {
    setFormData(prev => ({
      ...prev,
      [perm]: !prev[perm]
    }));
  };

  const permissionGroups = [
    { 
      title: '📦 Productos', 
      icon: '📦',
      perms: [
        { key: 'viewProducts', label: 'Ver productos' },
        { key: 'createProducts', label: 'Crear productos' },
        { key: 'editProducts', label: 'Editar productos' },
        { key: 'deleteProducts', label: 'Eliminar productos' }
      ]
    },
    { 
      title: '📊 Inventario', 
      icon: '📊',
      perms: [
        { key: 'viewInventory', label: 'Ver inventario' },
        { key: 'adjustStock', label: 'Ajustar stock' }
      ]
    },
    { 
      title: '💰 POS / Ventas', 
      icon: '💰',
      perms: [
        { key: 'usePOS', label: 'Usar punto de venta' }
      ]
    },
    { 
      title: '📊 Contabilidad', 
      icon: '📊',
      perms: [
        { key: 'viewAccounting', label: 'Ver contabilidad' }
      ]
    },
    { 
      title: '👥 Clientes', 
      icon: '👥',
      perms: [
        { key: 'viewCustomers', label: 'Ver clientes' }
      ]
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="w-1 h-6 bg-green-600 rounded-full"></span>
            👥 Empleados
          </h2>
          <p className="text-gray-500 text-sm mt-1">Gestiona los empleados y sus permisos de acceso</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => {
            setEditing(null);
            resetForm();
            setShowForm(true);
          }} 
          className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nuevo empleado
        </Button>
      </div>

      {/* Mensaje */}
      {message && (
        <div className={`p-4 rounded-xl ${message.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message}
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-green-600 rounded-full"></span>
            {editing ? '✏️ Editar Empleado' : '➕ Nuevo Empleado'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre completo"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="Correo electrónico"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              {!editing && (
                <Input
                  label="Contraseña"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              )}
              {editing && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700 cursor-pointer">
                    Usuario activo
                  </label>
                </div>
              )}
            </div>

            {/* Permisos */}
            <div className="border-t border-gray-100 pt-4">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>🔐</span> Permisos de acceso
              </h4>
              <div className="space-y-3">
                {permissionGroups.map(group => (
                  <div key={group.title} className="bg-gray-50 rounded-xl p-4">
                    <p className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <span className="text-lg">{group.icon}</span> {group.title}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {group.perms.map(perm => (
                        <label key={perm.key} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white p-1 rounded transition">
                          <input
                            type="checkbox"
                            checked={formData[perm.key] || false}
                            onChange={() => togglePermission(perm.key)}
                            className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                          />
                          <span className="text-gray-600">{perm.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" variant="primary" className="flex-1 bg-gradient-to-r from-green-600 to-green-700">
                {editing ? 'Actualizar Empleado' : 'Crear Empleado'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de empleados */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Empleado</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Email</th>
                <th className="p-4 text-center text-sm font-semibold text-gray-600">Estado</th>
                <th className="p-4 text-center text-sm font-semibold text-gray-600">POS</th>
                <th className="p-4 text-center text-sm font-semibold text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No hay empleados registrados
                  </td>
                </tr>
              ) : (
                employees.map(emp => (
                  <tr key={emp._id} className="hover:bg-gray-50 transition">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{emp.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">ID: {emp._id.slice(-6)}</div>
                    </td>
                    <td className="p-4 text-gray-600">{emp.email}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${emp.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {emp.isActive !== false ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {emp.usePOS ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          ✅ Habilitado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                          ❌ No
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(emp)}
                          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(emp._id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Eliminar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}