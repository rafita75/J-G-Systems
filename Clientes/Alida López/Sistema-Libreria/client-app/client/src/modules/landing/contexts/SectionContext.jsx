// client/src/contexts/SectionContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { getSections } from '../../../shared/services/sectionService';

const SectionContext = createContext();

export function SectionProvider({ children }) {
  const [sections, setSections] = useState([]);
  const [menuSections, setMenuSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      const data = await getSections();
      setSections(data);
      // Filtrar secciones para el menú
      const filtered = data.filter(s => 
        s.isActive && s.type !== 'divider' && s.type !== 'stats'
      );
      setMenuSections(filtered);
    } catch (error) {
      console.error('Error cargando secciones:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionContext.Provider value={{ sections, menuSections, loading, reload: loadSections }}>
      {children}
    </SectionContext.Provider>
  );
}

export function useSections() {
  return useContext(SectionContext);
}