// src/components/ModuleGuard.jsx
import { useModules } from '../../../core/contexts/ModuleContext';

export default function ModuleGuard({ module, children, fallback = null }) {
  const { hasModule, loading } = useModules();

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!hasModule(module)) {
    return fallback;
  }

  return children;
}