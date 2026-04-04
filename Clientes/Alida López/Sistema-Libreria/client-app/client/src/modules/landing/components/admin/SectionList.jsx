// client/src/components/admin/SectionList.jsx
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const typeLabels = {
  hero: { label: 'Hero', icon: '🎬', color: 'blue' },
  text: { label: 'Texto', icon: '📝', color: 'gray' },
  image: { label: 'Imagen', icon: '🖼️', color: 'purple' },
  features: { label: 'Características', icon: '✨', color: 'green' },
  testimonials: { label: 'Testimonios', icon: '💬', color: 'yellow' },
  cta: { label: 'CTA', icon: '🎯', color: 'red' },
  divider: { label: 'Separador', icon: '➖', color: 'gray' },
  stats: { label: 'Estadísticas', icon: '📊', color: 'indigo' }
};

export default function SectionList({ sections, onEdit, onDelete, onReorder }) {
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    onReorder(items);
  };

  if (sections.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-soft p-12 text-center">
        <div className="text-6xl mb-4">📄</div>
        <p className="text-gray-500 text-lg">No hay secciones creadas</p>
        <p className="text-gray-400 text-sm mt-2">Haz clic en "Agregar Sección" para comenzar</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="divide-y divide-gray-100"
            >
              {sections.map((section, index) => {
                const typeInfo = typeLabels[section.type] || { label: section.type, icon: '📄', color: 'gray' };
                return (
                  <Draggable key={section._id} draggableId={section._id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`p-4 hover:bg-gray-50 transition-all ${
                          snapshot.isDragging ? 'shadow-hard bg-gray-50 ring-2 ring-primary-500' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-move text-gray-400 hover:text-gray-600 p-1"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6-12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
                              </svg>
                            </div>
                            <div className={`w-10 h-10 rounded-xl bg-${typeInfo.color}-100 flex items-center justify-center text-xl`}>
                              {typeInfo.icon}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-gray-900">
                                  {typeInfo.label}
                                </span>
                                {section.isPremium && (
                                  <span className="badge badge-warning text-xs">
                                    ⭐ Premium
                                  </span>
                                )}
                                {!section.isActive && (
                                  <span className="badge badge-neutral text-xs">
                                    Inactivo
                                  </span>
                                )}
                                {section.title && (
                                  <span className="text-sm text-gray-500">
                                    • {section.title}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                Orden: {section.order} • ID: {section._id.slice(-6)}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => onEdit(section)}
                              className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                              title="Editar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => onDelete(section._id)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Eliminar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}