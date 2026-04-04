// src/pages/Admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../login/contexts/AuthContext';
import { useModules } from '../../core/contexts/ModuleContext';
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
  const [availableModules, setAvailableModules] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(null);
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('modules');
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

  // Menú items para móvil
  const menuItems = [
    { id: 'modules', label: 'Módulos', icon: '🔌', show: true },
    ...(hasEcommerce ? [
      { id: 'products', label: 'Productos', icon: '📦', group: 'ECOMMERCE' },
      { id: 'categories', label: 'Categorías', icon: '🏷️', group: 'ECOMMERCE' },
      { id: 'orders', label: 'Pedidos', icon: '📋', group: 'ECOMMERCE' },
      { id: 'coupons', label: 'Cupones', icon: '🏷️', group: 'ECOMMERCE' }
    ] : []),
    ...(hasAccounting ? [
      { id: 'accounting', label: 'Contabilidad', icon: '💰', group: 'CONTABILIDAD' }
    ] : []),
    ...(hasAppointments ? [
      { id: 'services', label: 'Servicios', icon: '✂️', group: 'RESERVAS' },
      { id: 'bookings', label: 'Reservas', icon: '📅', group: 'RESERVAS' }
    ] : []),
    ...(hasLandingCustomization ? [
      { id: 'landing', label: 'Landing Page', icon: '🎨', group: 'PERSONALIZACIÓN' }
    ] : [])
  ];

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

      {/* Menú móvil desplegable */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed top-14 left-0 right-0 bg-gray-800 text-white z-40 max-h-[calc(100vh-56px)] overflow-y-auto">
          <div className="p-4 border-b border-gray-700">
            <p className="text-sm text-gray-400">{user?.name}</p>
          </div>
          <nav className="p-4 space-y-2">
            {menuItems.map((item, idx) => {
              const prevItem = menuItems[idx - 1];
              const showGroup = item.group && (!prevItem || prevItem.group !== item.group);
              return (
                <div key={item.id}>
                  {showGroup && (
                    <p className="text-xs text-gray-400 px-4 py-2 mt-2">{item.group}</p>
                  )}
                  <button
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition text-left ${
                      activeTab === item.id 
                        ? 'bg-blue-600' 
                        : 'hover:bg-gray-700'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                </div>
              );
            })}
            <div className="border-t border-gray-700 my-3"></div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition text-left bg-red-600 hover:bg-red-700"
            >
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
        </div>
        
        <nav className="p-4 space-y-2">
          {/* Módulos */}
          <button
            onClick={() => setActiveTab('modules')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition text-left ${
              activeTab === 'modules' 
                ? 'bg-blue-600' 
                : 'hover:bg-gray-700'
            }`}
          >
            <span>🔌</span>
            <span>Módulos</span>
          </button>
          {user?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('employees')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition text-left ${
                activeTab === 'employees' ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              <span>👥</span>
              <span>Empleados</span>
            </button>
          )}
          {/* Ecommerce */}
          {hasEcommerce && (
            <>
              <div className="border-t border-gray-700 my-3"></div>
              <p className="text-xs text-gray-400 px-4 py-1">🛍️ ECOMMERCE</p>
              <button
                onClick={() => setActiveTab('products')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition text-left ${
                  activeTab === 'products' 
                    ? 'bg-blue-600' 
                    : 'hover:bg-gray-700'
                }`}
              >
                <span>📦</span>
                <span>Productos</span>
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition text-left ${
                  activeTab === 'categories' 
                    ? 'bg-blue-600' 
                    : 'hover:bg-gray-700'
                }`}
              >
                <span>🏷️</span>
                <span>Categorías</span>
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition text-left ${
                  activeTab === 'orders' 
                    ? 'bg-blue-600' 
                    : 'hover:bg-gray-700'
                }`}
              >
                <span>📋</span>
                <span>Pedidos</span>
              </button>
              <button
                onClick={() => setActiveTab('coupons')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition text-left ${
                  activeTab === 'coupons' 
                    ? 'bg-blue-600' 
                    : 'hover:bg-gray-700'
                }`}
              >
                <span>🏷️</span>
                <span>Cupones</span>
              </button>
            </>
          )}

          {/* Contabilidad */}
          {hasAccounting && (
            <>
              <div className="border-t border-gray-700 my-3"></div>
              <p className="text-xs text-gray-400 px-4 py-1">💰 CONTABILIDAD</p>
              <button
                onClick={() => setActiveTab('accounting')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition text-left ${
                  activeTab === 'accounting' 
                    ? 'bg-blue-600' 
                    : 'hover:bg-gray-700'
                }`}
              >
                <span>💰</span>
                <span>Contabilidad</span>
              </button>
            </>
          )}

          {/* Reservas */}
          {hasAppointments && (
            <>
              <div className="border-t border-gray-700 my-3"></div>
              <p className="text-xs text-gray-400 px-4 py-1">📅 RESERVAS</p>
              <button
                onClick={() => setActiveTab('services')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition text-left ${
                  activeTab === 'services' ? 'bg-blue-600' : 'hover:bg-gray-700'
                }`}
              >
                <span>✂️</span>
                <span>Servicios</span>
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition text-left ${
                  activeTab === 'bookings' ? 'bg-blue-600' : 'hover:bg-gray-700'
                }`}
              >
                <span>📅</span>
                <span>Reservas</span>
              </button>
            </>
          )}

          {hasInventory &&  (
            <>
              <div className="border-t border-gray-700 my-3"></div>
                <p className="text-xs text-gray-400 px-4 py-1">📦 INVENTARIO</p>
                <button
                  onClick={() => setActiveTab('inventory')}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition text-left ${
                    activeTab === 'inventory' ? 'bg-blue-600' : 'hover:bg-gray-700'
                  }`}
                >
                  <span>📦</span>
                  <span>Inventario</span>
                </button>
                <button
                  onClick={() => setActiveTab('products')}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition text-left ${
                    activeTab === 'products' 
                      ? 'bg-blue-600' 
                      : 'hover:bg-gray-700'
                  }`}
                >
                  <span>📦</span>
                  <span>Productos</span>
                </button>
                <button
                  onClick={() => setActiveTab('categories')}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition text-left ${
                    activeTab === 'categories' 
                      ? 'bg-blue-600' 
                      : 'hover:bg-gray-700'
                  }`}
                >
                  <span>🏷️</span>
                  <span>Categorías</span>
                </button>
              </>
          )}
          {hasPOS && (
            <>
              <div className="border-t border-gray-700 my-3"></div>
              <p className="text-xs text-gray-400 px-4 py-1">💳 POS</p>
              <button
                onClick={() => setActiveTab('pos')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition text-left ${
                  activeTab === 'pos' ? 'bg-blue-600' : 'hover:bg-gray-700'
                }`}
              >
                <span>💳</span>
                <span>Punto de Venta</span>
              </button>
            </>
          )}
          {/* Landing Page */}
          {hasLandingCustomization && (
            <>
              <div className="border-t border-gray-700 my-3"></div>
              <p className="text-xs text-gray-400 px-4 py-1">🎨 PERSONALIZACIÓN</p>
              <button
                onClick={() => setActiveTab('landing')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition text-left ${
                  activeTab === 'landing' 
                    ? 'bg-blue-600' 
                    : 'hover:bg-gray-700'
                }`}
              >
                <span>🎨</span>
                <span>Landing Page</span>
              </button>
            </>
          )}
          
          <div className="border-t border-gray-700 my-3"></div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition text-left bg-red-600 hover:bg-red-700"
          >
            <span>🚪</span>
            <span>Cerrar Sesión</span>
          </button>
        </nav>
      </aside>

      {/* Contenido principal */}
      <main className={`lg:ml-64 pt-14 lg:pt-0 min-h-screen transition-all duration-300`}>
        <div className="p-4 md:p-6">
          {/* Mensaje de alerta */}
          {message && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {message}
            </div>
          )}

          {/* ============================================
              PESTAÑA: MÓDULOS (contratación)
              ============================================ */}
          {activeTab === 'modules' && (
            <>
              {/* Módulos activos */}
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
                    {Object.values(modules || {}).filter(v => v === true).length === 0 && (
                      <p className="text-gray-500 col-span-full">No tienes módulos activos. ¡Contrata algunos!</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Módulos disponibles */}
              <div className="bg-white rounded-lg shadow mb-8">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold">Módulos Disponibles</h2>
                  <p className="text-gray-600 text-sm">Contrata nuevos módulos para potenciar tu negocio</p>
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
                            <span className="text-sm font-normal text-gray-500"> (pago único)</span>
                          </div>
                          {module.isActive ? (
                            <button
                              disabled
                              className="w-full bg-gray-300 text-gray-500 py-2 rounded cursor-not-allowed"
                            >
                              Ya activo
                            </button>
                          ) : (
                            <button
                              onClick={() => setShowModal(module)}
                              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                            >
                              Contratar
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Historial de solicitudes */}
              {requests.length > 0 && (
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold">Historial de Solicitudes</h2>
                  </div>
                  <div className="p-6 overflow-x-auto">
                    <div className="space-y-3">
                      {requests.map(req => (
                        <div key={req._id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">{req.moduleName}</p>
                            <p className="text-sm text-gray-500">
                              Solicitado: {new Date(req.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <span className={`px-2 py-1 rounded text-sm ${
                              req.status === 'approved' ? 'bg-green-100 text-green-700' :
                              req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {req.status === 'approved' ? 'Aprobado' :
                               req.status === 'rejected' ? 'Rechazado' :
                               'Pendiente'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ============================================
              CONTENIDO DE CADA PESTAÑA
              ============================================ */}
          {activeTab === 'products' && hasEcommerce && <ProductsManager />}
          {activeTab === 'categories' && hasEcommerce && <CategoriesManager />}
          {activeTab === 'orders' && hasEcommerce && <OrdersManager />}
          {activeTab === 'coupons' && <CouponsManager />}
          {activeTab === 'accounting' && hasAccounting && <AccountingDashboard />}
          {activeTab === 'services' && hasAppointments && <ServicesManager />}
          {activeTab === 'bookings' && hasAppointments && <BookingsManager />}
          {activeTab === 'landing' && hasLandingCustomization && <SectionsManager />}
          {activeTab === 'inventory' && hasInventory && <InventoryManager />}
          {activeTab === 'products' && hasInventory && <ProductsManager />}
          {activeTab === 'categories' && hasInventory && <CategoriesManager />}
          {activeTab === 'pos' && hasPOS && <POSDashboard />}
          {activeTab === 'employees' && user?.role === 'admin' && <EmployeesManager />}

        </div>
      </main>

      {/* Modal de contratación */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Contratar {showModal.name}</h3>
            <p className="text-gray-600 mb-4">
              Precio: <span className="font-bold text-blue-600">${showModal.price}</span> (pago único)
            </p>
            <textarea
              placeholder="¿Alguna nota adicional? (opcional)"
              className="w-full p-2 border rounded mb-4"
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="flex gap-3">
              <button
                onClick={() => handleRequestModule(showModal)}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Solicitar
              </button>
              <button
                onClick={() => setShowModal(null)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Al solicitar, te contactaremos para coordinar el pago. Una vez confirmado, el módulo se activará automáticamente.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}