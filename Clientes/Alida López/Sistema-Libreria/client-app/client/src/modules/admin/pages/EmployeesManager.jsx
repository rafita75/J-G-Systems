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
    permissions: {
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
    }
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
      console.error('Error cargando empleados:', error);
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
      setFormData({
        name: '',
        email: '',
        password: '',
        permissions: {
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
        }
      });
      loadEmployees();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error al guardar');
    }
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

  const togglePermission = (perm) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [perm]: !prev.permissions[perm]
      }
    }));
  };

  const permissionGroups = [
    { title: '📦 Productos', perms: ['viewProducts', 'createProducts', 'editProducts', 'deleteProducts'] },
    { title: '📋 Pedidos', perms: ['viewOrders', 'updateOrderStatus'] },
    { title: '📅 Reservas', perms: ['viewAppointments', 'createAppointments', 'updateAppointmentStatus'] },
    { title: '💰 POS / Ventas', perms: ['usePOS'] },
    { title: '📊 Contabilidad', perms: ['viewAccounting'] },
    { title: '👥 Clientes', perms: ['viewCustomers'] }
  ];

  if (loading) {
    return <div className="p-8 text-center">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">👥 Empleados</h2>
          <p className="text-gray-500 text-sm">Gestiona los empleados y sus permisos</p>
        </div>
        <Button variant="primary" onClick={() => {
          setEditing(null);
          setFormData({
            name: '',
            email: '',
            password: '',
            permissions: {
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
            }
          });
          setShowForm(true);
        }}>
          + Nuevo empleado
        </Button>
      </div>

      {message && (
        <div className="p-4 bg-green-50 text-green-700 rounded-xl">
          {message}
        </div>
      )}

      {showForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editing ? '✏️ Editar Empleado' : '➕ Nuevo Empleado'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="Email"
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
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Permisos</h4>
              <div className="space-y-4">
                {permissionGroups.map(group => (
                  <div key={group.title}>
                    <p className="font-medium text-sm text-gray-700 mb-2">{group.title}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {group.perms.map(perm => (
                        <label key={perm} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={formData.permissions[perm]}
                            onChange={() => togglePermission(perm)}
                            className="w-4 h-4 text-primary-600 rounded"
                          />
                          <span className="capitalize">
                            {perm.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" variant="primary">
                {editing ? 'Actualizar' : 'Crear'} Empleado
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-left">Nombre</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Estado</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp._id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{emp.name}</td>
                <td className="p-4 text-gray-600">{emp.email}</td>
                <td className="p-4">
                  <span className={`badge ${emp.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {emp.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => {
                      setEditing(emp);
                      setFormData({
                        name: emp.name,
                        email: emp.email,
                        password: '',
                        permissions: emp.permissions
                      });
                      setShowForm(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 mr-3"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(emp._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}