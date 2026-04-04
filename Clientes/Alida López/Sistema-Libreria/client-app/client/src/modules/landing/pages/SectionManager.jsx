// client/src/pages/Admin/SectionsManager.jsx
import { useState, useEffect } from 'react';
import { getAdminSections, createSection, updateSection, deleteSection, reorderSections } from '../../../shared/services/sectionService';
import SectionForm from '../components/admin/SectionForm';
import SectionList from '../components/admin/SectionList';
import Button from '../../core/components/UI/Button';

export default function SectionsManager() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      const data = await getAdminSections();
      setSections(data);
    } catch (error) {
      console.error('Error cargando secciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (sectionData) => {
    try {
      await createSection(sectionData);
      setMessage('✅ Sección creada correctamente');
      loadSections();
      setShowForm(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error al crear sección');
    }
  };

  const handleUpdate = async (id, sectionData) => {
    try {
      await updateSection(id, sectionData);
      setMessage('✅ Sección actualizada correctamente');
      loadSections();
      setEditingSection(null);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error al actualizar sección');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta sección?')) return;
    try {
      await deleteSection(id);
      setMessage('✅ Sección eliminada');
      loadSections();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error al eliminar sección');
    }
  };

  const handleReorder = async (newOrder) => {
    try {
      const sectionsToReorder = newOrder.map((item, idx) => ({
        id: item._id,
        order: idx
      }));
      await reorderSections(sectionsToReorder);
      setSections(newOrder);
    } catch (error) {
      console.error('Error al reordenar:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span>🎨</span> Gestión del Landing Page
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Organiza las secciones de tu página principal
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(true)}>
          + Agregar Sección
        </Button>
      </div>

      {message && (
        <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 animate-fade-in">
          {message}
        </div>
      )}

      {/* Formulario de nueva sección */}
      {showForm && (
        <div className="animate-fade-in">
          <SectionForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Formulario de edición */}
      {editingSection && (
        <div className="animate-fade-in">
          <SectionForm
            initialData={editingSection}
            onSubmit={(data) => handleUpdate(editingSection._id, data)}
            onCancel={() => setEditingSection(null)}
          />
        </div>
      )}

      {/* Lista de secciones */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span>📋</span> Secciones activas
          </h2>
          <p className="text-sm text-gray-500">
            {sections.length} {sections.length === 1 ? 'sección' : 'secciones'}
          </p>
        </div>
        
        <SectionList
          sections={sections}
          onEdit={setEditingSection}
          onDelete={handleDelete}
          onReorder={handleReorder}
        />
        
        {sections.length === 0 && (
          <div className="bg-white rounded-2xl shadow-soft p-12 text-center">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-gray-500 text-lg">No hay secciones creadas</p>
            <p className="text-gray-400 text-sm mt-2">
              Haz clic en "Agregar Sección" para comenzar a construir tu landing page
            </p>
          </div>
        )}
      </div>
    </div>
  );
}