// src/pages/Admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../login/contexts/AuthContext';
import { useModules } from '../../core/contexts/ModuleContext';
import { usePermissions } from '../../core/hooks/usePermissions';
import api from '../../../shared/services/api';
import ProductsManager from './ProductsManager';
import CategoriesManager from './CategoriesManager';
import OrdersManager from './OrdersManager';
import CouponsManager from './CouponsManager';
import AccountingDashboard from '../../accounting/pages/AccountingDashboard';
import BookingsManager from './BookinsManager';
import ServicesManager from './ServicesManager';
import SectionsManager from '../../landing/pages/SectionManager';
import InventoryManager from '../../inventory/pages/InventoryManager';
import POSDashboard from '../../pos/pages/POSDashboard';
import EmployeesManager from './EmployeesManager';

export default function AdminDashboard() {
  const { user, logout } = useAuth(); 
  const { modules, hasModule } = useModules();
  const { permissions, isAdmin, isEmployee } = usePermissions();
  const [availableModules, setAvailableModules] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(null);
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const hasAccounting = hasModule('accounting');
  const hasAppointments = hasModule('appointments');
  const hasEcommerce = hasModule('ecommerce');
  const hasLandingCustomization = hasModule('landingCustomization');
  const hasPOS = hasModule('pos');
  const hasInventory = hasModule('inventory');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [modulesRes, requestsRes] = await Promise.all([
        api.get('/modules/available'),
        api.get('/modules/requests')
      ]);
      setAvailableModules(modulesRes.data);
      setRequests(requestsRes.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const handleRequestModule = async (module) => {
    try {
      await api.post('/modules/request', {
        moduleKey: module.key,
        moduleName: module.name,
        price: module.price,
        notes: notes
      });
      
      setMessage(`✅ Solicitud enviada para ${module.name}. Te contactaremos pronto.`);
      setShowModal(null);
      setNotes('');
      loadData();
      
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      setMessage(`❌ Error: ${error.response?.data?.error || 'No se pudo enviar la solicitud'}`);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Cargando...</div>;
  }

  // ============================================
  // CONSTRUIR MENÚ SEGÚN PERMISOS
  // ============================================
  const menuItems = [];

  // Dashboard - siempre visible
  menuItems.push({ id: 'dashboard', label: 'Dashboard', icon: '📊' });

  // Módulos - solo admin
  if (isAdmin) {
    menuItems.push({ id: 'modules', label: 'Módulos', icon: '🔌' });
  }

  // Empleados - solo admin
  if (isAdmin) {
    menuItems.push({ id: 'employees', label: 'Empleados', icon: '👥' });
  }

  // Ecommerce / Productos
  if ((hasEcommerce || hasInventory) && (isAdmin || permissions.canViewProducts)) {
    menuItems.push({ id: 'products', label: 'Productos', icon: '📦' });
    menuItems.push({ id: 'categories', label: 'Categorías', icon: '🏷️' });
  }

  // Pedidos
  if (hasEcommerce && (isAdmin || permissions.canViewOrders)) {
    menuItems.push({ id: 'orders', label: 'Pedidos', icon: '📋' });
  }

  // Cupones - solo admin
  if (hasEcommerce && isAdmin) {
    menuItems.push({ id: 'coupons', label: 'Cupones', icon: '🏷️' });
  }

  // Contabilidad
  if (hasAccounting && (isAdmin || permissions.canViewAccounting)) {
    menuItems.push({ id: 'accounting', label: 'Contabilidad', icon: '💰' });
  }

  // Reservas
  if (hasAppointments && (isAdmin || permissions.canViewAppointments)) {
    menuItems.push({ id: 'services', label: 'Servicios', icon: '✂️' });
    menuItems.push({ id: 'bookings', label: 'Reservas', icon: '📅' });
  }

  // Inventario
  if (hasInventory && (isAdmin || permissions.canViewInventory)) {
    menuItems.push({ id: 'inventory', label: 'Inventario', icon: '📦' });
  }

  // POS
  if (hasPOS && (isAdmin || permissions.canUsePOS)) {
    menuItems.push({ id: 'pos', label: 'Punto de Venta', icon: '💳' });
  }

  // Landing Page - solo admin
  if (hasLandingCustomization && isAdmin) {
    menuItems.push({ id: 'landing', label: 'Landing Page', icon: '🎨' });
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header móvil */}
      <div className="lg:hidden bg-gray-800 text-white p-4 fixed top-0 left-0 right-0 z-50 flex justify-between items-center">
        <h2 className="text-lg font-bold">Panel Admin</h2>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Menú móvil */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed top-14 left-0 right-0 bg-gray-800 text-white z-40 max-h-[calc(100vh-56px)] overflow-y-auto">
          <div className="p-4 border-b border-gray-700">
            <p className="text-sm text-gray-400">{user?.name}</p>
            {isEmployee && <p className="text-xs text-yellow-400 mt-1">⚠️ Rol: Empleado</p>}
          </div>
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition text-left ${
                  activeTab === item.id ? 'bg-blue-600' : 'hover:bg-gray-700'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
            <div className="border-t border-gray-700 my-3"></div>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition text-left bg-red-600 hover:bg-red-700">
              <span>🚪</span>
              <span>Cerrar Sesión</span>
            </button>
          </nav>
        </div>
      )}

      {/* Sidebar desktop */}
      <aside className="hidden lg:block fixed top-0 left-0 w-64 h-full bg-gray-800 text-white overflow-y-auto">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">Panel Admin</h2>
          <p className="text-sm text-gray-400 mt-1">{user?.name}</p>
          {isEmployee && <p className="text-xs text-yellow-400 mt-1">⚠️ Rol: Empleado</p>}
        </div>
        
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition text-left ${
                activeTab === item.id ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
          
          <div className="border-t border-gray-700 my-3"></div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition text-left bg-red-600 hover:bg-red-700">
            <span>🚪</span>
            <span>Cerrar Sesión</span>
          </button>
        </nav>
      </aside>

      {/* Contenido principal */}
      <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen transition-all duration-300">
        <div className="p-4 md:p-6">
          {message && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {message}
            </div>
          )}

          {/* Dashboard Home */}
          {activeTab === 'dashboard' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Bienvenido, {user?.name}</h2>
              <p className="text-gray-600">
                {isAdmin 
                  ? 'Tienes acceso completo a todos los módulos.' 
                  : 'Tienes acceso limitado según los permisos asignados por el administrador.'}
              </p>
            </div>
          )}

          {/* Módulos (solo admin) */}
          {activeTab === 'modules' && isAdmin && (
            <>
              <div className="bg-white rounded-lg shadow mb-8">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold">Módulos Activos</h2>
                  <p className="text-gray-600 text-sm">Estos módulos ya están disponibles en tu sitio</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(modules || {}).map(([key, active]) => {
                      if (!active) return null;
                      const moduleInfo = availableModules.find(m => m.key === key);
                      return (
                        <div key={key} className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{moduleInfo?.icon || '✅'}</span>
                            <div>
                              <h3 className="font-semibold text-green-800">{moduleInfo?.name || key}</h3>
                              <p className="text-sm text-green-600">Activo</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow mb-8">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold">Módulos Disponibles</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableModules.map(module => (
                      <div key={module.key} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
                        <div className="p-6">
                          <div className="text-4xl mb-3">{module.icon}</div>
                          <h3 className="text-xl font-semibold mb-2">{module.name}</h3>
                          <p className="text-gray-600 text-sm mb-4">{module.description}</p>
                          <div className="text-2xl font-bold text-blue-600 mb-4">
                            ${module.price}
                          </div>
                          {module.isActive ? (
                            <button disabled className="w-full bg-gray-300 text-gray-500 py-2 rounded cursor-not-allowed">
                              Ya activo
                            </button>
                          ) : (
                            <button onClick={() => setShowModal(module)} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                              Contratar
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Empleados (solo admin) */}
          {activeTab === 'employees' && isAdmin && <EmployeesManager />}

          {/* Productos */}
          {activeTab === 'products' && (hasEcommerce || hasInventory) && <ProductsManager />}

          {/* Categorías */}
          {activeTab === 'categories' && (hasEcommerce || hasInventory) && <CategoriesManager />}

          {/* Pedidos */}
          {activeTab === 'orders' && hasEcommerce && <OrdersManager />}

          {/* Cupones */}
          {activeTab === 'coupons' && hasEcommerce && <CouponsManager />}

          {/* Contabilidad */}
          {activeTab === 'accounting' && hasAccounting && <AccountingDashboard />}

          {/* Servicios */}
          {activeTab === 'services' && hasAppointments && <ServicesManager />}

          {/* Reservas */}
          {activeTab === 'bookings' && hasAppointments && <BookingsManager />}

          {/* Landing Page */}
          {activeTab === 'landing' && hasLandingCustomization && isAdmin && <SectionsManager />}

          {/* Inventario */}
          {activeTab === 'inventory' && hasInventory && <InventoryManager />}

          {/* POS */}
          {activeTab === 'pos' && hasPOS && <POSDashboard />}
        </div>
      </main>

      {/* Modal de contratación */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Contratar {showModal.name}</h3>
            <p className="text-gray-600 mb-4">Precio: <span className="font-bold text-blue-600">${showModal.price}</span></p>
            <textarea
              placeholder="¿Alguna nota adicional?"
              className="w-full p-2 border rounded mb-4"
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="flex gap-3">
              <button onClick={() => handleRequestModule(showModal)} className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                Solicitar
              </button>
              <button onClick={() => setShowModal(null)} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}