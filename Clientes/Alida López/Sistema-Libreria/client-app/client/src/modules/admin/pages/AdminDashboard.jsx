// src/pages/Admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../login/contexts/AuthContext';
import { useModules } from '../../core/contexts/ModuleContext';
import { usePermissions } from '../../core/hooks/usePermissions';
import api from '../../../shared/services/api';
import ProductsManager from './ProductsManager';
import CategoriesManager from './CategoriesManager';
import AccountingDashboard from '../../accounting/pages/AccountingDashboard';
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
  const [activeTab, setActiveTab] = useState(isAdmin ? 'dashboard' : 'pos');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [dashboardData, setDashboardData] = useState({
    ventasHoy: 0,
    ingresosHoy: 0,
    productosBajoStock: 0,
    deudasPendientes: 0,
    loading: true
  });

  const hasAccounting = hasModule('accounting');
  const hasLandingCustomization = hasModule('landingCustomization');
  const hasPOS = hasModule('pos');
  const hasInventory = hasModule('inventory');

  useEffect(() => {
    loadData();
    if (isAdmin) {
      loadDashboardData();
    }
  }, []);

  const loadData = async () => {
    try {
      if (isAdmin) {
        const [modulesRes, requestsRes] = await Promise.all([
          api.get('/modules/available').catch(() => ({ data: [] })),
          api.get('/modules/requests').catch(() => ({ data: [] }))
        ]);
        setAvailableModules(modulesRes.data);
        setRequests(requestsRes.data);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      if (isAdmin || permissions?.canViewAccounting) {
        const [incomesRes, debtsRes] = await Promise.all([
          api.get('/accounting/incomes', { params: { fechaInicio: hoy.toISOString() } }).catch(() => ({ data: [] })),
          api.get('/accounting/customer-debts').catch(() => ({ data: [] }))
        ]);
        
        const ventas = incomesRes.data || [];
        const ventasEfectivo = ventas.filter(v => !v.esDeuda);
        const ingresosHoy = ventasEfectivo.reduce((sum, v) => sum + v.monto, 0);
        
        const deudasPendientes = (debtsRes.data || []).filter(d => d.estado === 'pendiente');
        const totalDeudas = deudasPendientes.reduce((sum, d) => sum + d.monto, 0);
        
        setDashboardData(prev => ({
          ...prev,
          ventasHoy: ventas.length,
          ingresosHoy,
          deudasPendientes: totalDeudas,
        }));
      }
      
      if (isAdmin || permissions?.canViewInventory) {
        const inventoryRes = await api.get('/inventory/low-stock').catch(() => ({ data: [] }));
        setDashboardData(prev => ({
          ...prev,
          productosBajoStock: inventoryRes.data?.length || 0,
        }));
      }
      
      setDashboardData(prev => ({ ...prev, loading: false }));
    } catch (error) {
      console.error('Error cargando dashboard:', error);
      setDashboardData(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    const handleChangeTab = (event) => {
      if (event.detail?.tab) {
        setActiveTab(event.detail.tab);
      }
    };
    
    const handleOpenCreateProductModal = () => {
      setTimeout(() => {
        const newProductBtn = document.querySelector('[data-testid="new-product-btn"]');
        if (newProductBtn) {
          newProductBtn.click();
        }
      }, 100);
    };
    
    window.addEventListener('changeAdminTab', handleChangeTab);
    window.addEventListener('openCreateProductModal', handleOpenCreateProductModal);
    
    return () => {
      window.removeEventListener('changeAdminTab', handleChangeTab);
      window.removeEventListener('openCreateProductModal', handleOpenCreateProductModal);
    };
  }, []);

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

  if (isAdmin) {
    menuItems.push({ id: 'dashboard', label: 'Dashboard', icon: '📊' });
  }

  if (isAdmin) {
    menuItems.push({ id: 'employees', label: 'Empleados', icon: '👥' });
  }

  if (isAdmin || permissions?.canViewProducts) {
    menuItems.push({ id: 'products', label: 'Productos', icon: '📦' });
    menuItems.push({ id: 'categories', label: 'Categorías', icon: '🏷️' });
  }

  if (isAdmin || permissions?.canViewInventory) {
    menuItems.push({ id: 'inventory', label: 'Inventario', icon: '📊' });
  }

  if (isAdmin) {
    menuItems.push({ id: 'accounting', label: 'Contabilidad', icon: '💰' });
  }

  if (isAdmin || permissions?.canUsePOS) {
    menuItems.push({ id: 'pos', label: 'Punto de Venta', icon: '💳' });
  }

  if (hasLandingCustomization && isAdmin) {
    menuItems.push({ id: 'landing', label: 'Landing Page', icon: '🎨' });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header móvil */}
      <div className="lg:hidden bg-white shadow-md p-4 fixed top-0 left-0 right-0 z-50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center">
            <span className="text-white text-sm font-bold">A&C</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Librería A&C</h2>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="lg:hidden fixed top-14 left-0 right-0 bg-white shadow-lg z-40 max-h-[calc(100vh-56px)] overflow-y-auto">
          <div className="p-4 border-b border-gray-100">
            <p className="font-medium text-gray-800">{user?.name}</p>
            {isEmployee && <p className="text-xs text-yellow-600 mt-1">⚠️ Rol: Empleado</p>}
          </div>
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id 
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
            <div className="border-t border-gray-100 my-3"></div>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all">
              <span className="text-xl">🚪</span>
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </nav>
        </div>
      )}

      {/* Sidebar desktop - ENCOGIDA */}
      <aside className={`hidden lg:block fixed top-0 left-0 h-full bg-white shadow-xl transition-all duration-300 z-30 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={`p-5 border-b border-gray-100 flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">A&C</span>
              </div>
              {!sidebarCollapsed && (
                <div>
                  <h2 className="font-bold text-gray-800">Librería A&C</h2>
                  <p className="text-xs text-gray-400">Administración</p>
                </div>
              )}
            </div>
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`text-gray-400 hover:text-gray-600 transition-all ${sidebarCollapsed ? 'hidden' : 'block'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* Botón para expandir cuando está colapsado */}
          {sidebarCollapsed && (
            <button 
              onClick={() => setSidebarCollapsed(false)}
              className="mt-4 mx-auto w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Menú de navegación */}
          <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id 
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-50'
                } ${sidebarCollapsed ? 'justify-center' : ''}`}
                title={sidebarCollapsed ? item.label : ''}
              >
                <span className="text-xl">{item.icon}</span>
                {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
              </button>
            ))}
          </nav>

          {/* Usuario y logout */}
          <div className="p-4 border-t border-gray-100">
            <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
              <div className="w-10 h-10 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                {user?.name?.charAt(0) || 'U'}
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">{user?.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                </div>
              )}
              {!sidebarCollapsed && (
                <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              )}
            </div>
            {sidebarCollapsed && (
              <button onClick={handleLogout} className="mt-3 w-full py-2 text-red-500 hover:bg-red-50 rounded-xl transition-all">
                <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className={`lg:pt-0 min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <div className="pt-14 lg:pt-6 p-4 md:p-6">
          {message && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
              {message}
            </div>
          )}

          {/* DASHBOARD HOME - SOLO ADMIN */}
          {activeTab === 'dashboard' && isAdmin && (
            <div className="space-y-6">
              {/* Bienvenida */}
              <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white shadow-lg">
                <h2 className="text-2xl font-bold">¡Bienvenido, {user?.name}!</h2>
                <p className="text-green-100 mt-1">Aquí tienes el resumen de tu negocio</p>
              </div>

              {/* Tarjetas de estadísticas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Ventas hoy</p>
                      <p className="text-3xl font-bold text-gray-800">{dashboardData.ventasHoy}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                      <span className="text-2xl">💰</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Ingresos hoy</p>
                      <p className="text-3xl font-bold text-green-600">Q{dashboardData.ingresosHoy.toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                      <span className="text-2xl">💵</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Deudas pendientes</p>
                      <p className="text-3xl font-bold text-yellow-600">Q{dashboardData.deudasPendientes.toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
                      <span className="text-2xl">📝</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Stock bajo</p>
                      <p className={`text-3xl font-bold ${dashboardData.productosBajoStock > 0 ? 'text-red-600' : 'text-gray-800'}`}>
                        {dashboardData.productosBajoStock}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                      <span className="text-2xl">⚠️</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Accesos rápidos */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-green-600 rounded-full"></span>
                  ⚡ Accesos rápidos
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button onClick={() => setActiveTab('pos')} className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-green-50 hover:border-green-200 transition-all border border-transparent">
                    <span className="text-3xl">💳</span>
                    <span className="text-sm font-medium text-gray-700">Nueva Venta</span>
                  </button>
                  <button onClick={() => setActiveTab('products')} className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-green-50 hover:border-green-200 transition-all border border-transparent">
                    <span className="text-3xl">📦</span>
                    <span className="text-sm font-medium text-gray-700">Productos</span>
                  </button>
                  <button onClick={() => setActiveTab('inventory')} className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-green-50 hover:border-green-200 transition-all border border-transparent">
                    <span className="text-3xl">📊</span>
                    <span className="text-sm font-medium text-gray-700">Inventario</span>
                  </button>
                  <button onClick={() => setActiveTab('accounting')} className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-green-50 hover:border-green-200 transition-all border border-transparent">
                    <span className="text-3xl">💰</span>
                    <span className="text-sm font-medium text-gray-700">Contabilidad</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Empleado NO ve dashboard - mensaje de bienvenida simple */}
          {activeTab === 'dashboard' && isEmployee && (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
              <div className="text-6xl mb-4">👋</div>
              <h2 className="text-2xl font-bold text-gray-800">Bienvenido, {user?.name}</h2>
              <p className="text-gray-500 mt-2">Selecciona una opción del menú para comenzar</p>
            </div>
          )}

          {/* Empleados - solo admin */}
          {activeTab === 'employees' && isAdmin && <EmployeesManager />}

          {/* Productos */}
          {activeTab === 'products' && <ProductsManager />}

          {/* Categorías */}
          {activeTab === 'categories' && <CategoriesManager />}

          {/* Contabilidad - SOLO ADMIN */}
          {activeTab === 'accounting' && isAdmin && hasAccounting && <AccountingDashboard />}

          {/* Inventario */}
          {activeTab === 'inventory' && hasInventory && <InventoryManager />}

          {/* POS */}
          {activeTab === 'pos' && hasPOS && <POSDashboard />}

          {/* Landing Page - solo admin */}
          {activeTab === 'landing' && hasLandingCustomization && isAdmin && <SectionsManager />}
        </div>
      </main>

      {/* Modal de contratación */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-xl font-semibold mb-4">Contratar {showModal.name}</h3>
            <p className="text-gray-600 mb-4">Precio: <span className="font-bold text-green-600">${showModal.price}</span></p>
            <textarea
              placeholder="¿Alguna nota adicional?"
              className="w-full p-3 border border-gray-200 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="flex gap-3">
              <button onClick={() => handleRequestModule(showModal)} className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-2 rounded-xl hover:from-green-700 hover:to-green-800 transition-all">
                Solicitar
              </button>
              <button onClick={() => setShowModal(null)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl hover:bg-gray-200 transition-all">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}