// client/src/pages/Landing.jsx
import { useEffect } from 'react';
import { useSections } from '../modules/landing/contexts/SectionContext';
import SectionRenderer from '../modules/landing/components/sections/SectionRenderer';
import MainHeader from '../modules/core/components/Layout/MainHeader';

export default function Landing() {
  const { sections, loading, reload } = useSections();

  useEffect(() => {
    reload();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <MainHeader />
      
      {/* Contenido principal con padding para el header fijo */}
      <div className="pt-20">
        {sections.map((section) => (
          <SectionRenderer key={section._id} section={section} />
        ))}
      </div>
    </div>
  );
}