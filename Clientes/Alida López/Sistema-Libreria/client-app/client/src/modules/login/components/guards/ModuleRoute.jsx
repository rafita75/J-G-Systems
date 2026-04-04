// src/components/ModuleRoute.jsx
import { Navigate } from 'react-router-dom';
import { useModules } from '../../../core/contexts/ModuleContext';

export default function ModuleRoute({ module, children, redirectTo = '/' }) {
  const { hasModule, loading } = useModules();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!hasModule(module)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}