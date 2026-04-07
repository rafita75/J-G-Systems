// client/src/modules/core/hooks/usePermissions.js
import { useAuth } from '../../login/contexts/AuthContext';

export function usePermissions() {
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isEmployee = user?.role === 'employee';
  const isSuperAdmin = user?.role === 'superadmin';

  // Función para verificar un permiso específico
  const hasPermission = (permission) => {
    if (isAdmin || isSuperAdmin) return true;
    if (isEmployee) return user?.[permission] === true;
    return false;
  };

  const permissions = {
    // Productos
    canViewProducts: hasPermission('viewProducts'),
    canCreateProducts: hasPermission('createProducts'),
    canEditProducts: hasPermission('editProducts'),
    canDeleteProducts: hasPermission('deleteProducts'),
    
    // Inventario
    canViewInventory: hasPermission('viewInventory'),
    canAdjustStock: hasPermission('adjustStock'),
    
    // POS
    canUsePOS: hasPermission('usePOS'),
    
    // Contabilidad
    canViewAccounting: hasPermission('viewAccounting'),
    
    // Pedidos
    canViewOrders: hasPermission('viewOrders'),
    canUpdateOrderStatus: hasPermission('updateOrderStatus'),
    
    // Reservas
    canViewAppointments: hasPermission('viewAppointments'),
    canCreateAppointments: hasPermission('createAppointments'),
    canUpdateAppointmentStatus: hasPermission('updateAppointmentStatus'),
    
    // Empleados (solo admin)
    canManageEmployees: isAdmin,
    
    // Clientes
    canViewCustomers: hasPermission('viewCustomers'),
    
    // Landing Page (solo admin)
    canEditLanding: isAdmin,
    
    // Configuración (solo admin)
    canEditSettings: isAdmin,
  };

  return {
    isAdmin,
    isEmployee,
    isSuperAdmin,
    hasPermission,
    permissions
  };
}