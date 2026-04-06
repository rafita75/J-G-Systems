// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './modules/login/contexts/AuthContext';
import { useModules } from './modules/core/contexts/ModuleContext';

import { initSocket, getSocket, requestNotificationPermission, showNotification } from './shared/services/socketService';
import { useEffect } from 'react';

// Core
import Login from './modules/login/pages/Login';
import Register from './modules/login/pages/Register';
import Landing from './pages/Landing';

// Admin
import AdminDashboard from './modules/admin/pages/AdminDashboard';
import SectionsManager from './modules/landing/pages/SectionManager';

// Ecommerce
import Catalog from './modules/ecommerce/pages/Catalog';
import ProductDetail from './modules/ecommerce/pages/ProductDetail';
import Cart from './modules/ecommerce/pages/Cart';
import Checkout from './modules/ecommerce/pages/Checkout';
import OrderConfirmation from './modules/ecommerce/pages/OrderConfirmation';
import MyOrders from './modules/ecommerce/pages/MyOrders';
import OrderTracking from './modules/ecommerce/pages/OrderTracking';
import Wishlist from './modules/ecommerce/pages/Wishlist';

// Appointments
import Services from './modules/appointments/pages/Services';
import ServiceDetail from './modules/appointments/pages/ServiceDetail';
import Booking from './modules/appointments/pages/Booking';
import MyBookings from './modules/appointments/pages/MyBookings';

// POS e Inventario
import POSDashboard from './modules/pos/pages/POSDashboard';
import InventoryManager from './modules/inventory/pages/InventoryManager';
import AccountingDashboard from './modules/accounting/pages/AccountingDashboard';
import Profile from './modules/login/pages/Profile';

// Superadmin
import SuperAdminLogin from './pages/SuperAdmin/Login';
import SuperAdminDashboard from './pages/SuperAdmin/Dashboard';

// ============================================
// CONSTANTES
// ============================================

const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
  USER: 'user'
};

// ============================================
// COMPONENTE DE RUTA PROTEGIDA
// ============================================
function ProtectedRoute({ children, allowedRoles, redirectTo = '/login' }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }
  
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }
  
  return children;
}

// ============================================
// COMPONENTE DE RUTA PÚBLICA
// ============================================
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }
  
  if (user) {
    if (user.role === ROLES.ADMIN) return <Navigate to="/admin" replace />;
    if (user.role === ROLES.EMPLOYEE) return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }
  
  return children;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
function App() {
  const { user, loading: authLoading } = useAuth();
  const { hasModule, loading: modulesLoading } = useModules();

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'superadmin')) {
      console.log('👤 Admin:', user);
      
      // Asegurar que userId sea string
      const userId = String(user.id || user._id);
      console.log('📝 UserId:', userId);
      
      const socket = initSocket(userId);
      
      requestNotificationPermission();
      
      if (socket) {
        socket.on('new-notification', (notification) => {
          console.log('🔔 Notificación:', notification);
          
          showNotification(notification.title, {
            body: notification.body,
            icon: '/vite.svg',
            data: notification.data
          });
        });
        
        socket.on('user-registered', (data) => {
          console.log('✅ Registro confirmado:', data);
        });
      }
    }
  }, [user]);

  if (authLoading || modulesLoading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  const loginEnabled = hasModule('login');
  const hasEcommerce = hasModule('ecommerce');
  const hasAppointments = hasModule('appointments');
  const hasAccounting = hasModule('accounting');
  const hasPOS = hasModule('pos');
  const hasInventory = hasModule('inventory');
  const hasLandingCustomization = hasModule('landingCustomization');

  const getDefaultRedirect = () => {
    if (!user) return '/login';
    if (user.role === ROLES.ADMIN) return '/admin';
    if (user.role === ROLES.EMPLOYEE) return '/admin';
    return '/';
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Superadmin */}
        <Route path="/superadmin" element={<SuperAdminLogin />} />
        <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />

        {/* Rutas públicas */}
        {loginEnabled && (
          <>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          </>
        )}
        
        <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />

        {/* Ecommerce */}
        {hasEcommerce && (
          <>
            <Route path="/catalogo" element={<Catalog />} />
            <Route path="/producto/:slug" element={<ProductDetail />} />
            <Route path="/carrito" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/pedido/confirmacion/:orderNumber" element={<OrderConfirmation />} />
            <Route path="/mis-pedidos" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
            <Route path="/pedido/seguimiento/:orderNumber" element={<OrderTracking />} />
            <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          </>
        )}

        {/* Reservas */}
        {hasAppointments && (
          <>
            <Route path="/servicios" element={<Services />} />
            <Route path="/servicio/:id" element={<ServiceDetail />} />
            <Route path="/reservar/:serviceId" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
            <Route path="/mis-reservas" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
          </>
        )}

        {/* POS */}
        {hasPOS && (
          <Route 
            path="/pos" 
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.EMPLOYEE]} redirectTo="/login">
                <POSDashboard />
              </ProtectedRoute>
            } 
          />
        )}

        {/* Inventario */}
        {hasInventory && (
          <Route 
            path="/inventario" 
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.EMPLOYEE]} redirectTo="/login">
                <InventoryManager />
              </ProtectedRoute>
            } 
          />
        )}

        {/* Contabilidad - solo admin */}
        {hasAccounting && (
          <Route 
            path="/contabilidad" 
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]} redirectTo="/login">
                <AccountingDashboard />
              </ProtectedRoute>
            } 
          />
        )}

        {/* Perfil */}
        <Route 
          path="/perfil" 
          element={
            <ProtectedRoute redirectTo="/login">
              <Profile />
            </ProtectedRoute>
          } 
        />

        {/* Admin Dashboard - admin y empleado */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.EMPLOYEE]} redirectTo={getDefaultRedirect()}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Sections Manager - solo admin */}
        {hasLandingCustomization && (
          <Route 
            path="/admin/sections" 
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]} redirectTo="/admin">
                <SectionsManager />
              </ProtectedRoute>
            } 
          />
        )}

        {/* 404 */}
        <Route path="*" element={<Navigate to={getDefaultRedirect()} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;