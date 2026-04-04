// client/src/components/admin/SectionForm.jsx
import { useState } from 'react';
import Button from '../../../core/components/UI/Button';
import Input from '../../../core/components/UI/Input';

const SECTION_TYPES = [
  { value: 'hero', label: '🎬 Hero (Banner principal)', category: 'Gratis', icon: '🎬' },
  { value: 'text', label: '📝 Texto', category: 'Gratis', icon: '📝' },
  { value: 'image', label: '🖼️ Imagen', category: 'Gratis', icon: '🖼️' },
  { value: 'features', label: '✨ Características', category: 'Gratis', icon: '✨' },
  { value: 'testimonials', label: '💬 Testimonios', category: 'Gratis', icon: '💬' },
  { value: 'cta', label: '🎯 Llamada a la acción', category: 'Gratis', icon: '🎯' },
  { value: 'divider', label: '➖ Separador', category: 'Gratis', icon: '➖' },
  { value: 'stats', label: '📊 Estadísticas / Números', category: 'Gratis', icon: '📊' }
];

const animations = [
  { value: 'none', label: 'Sin animación' },
  { value: 'fadeIn', label: 'Desvanecer' },
  { value: 'slideUp', label: 'Deslizar arriba' },
  { value: 'slideLeft', label: 'Deslizar izquierda' },
  { value: 'zoomIn', label: 'Zoom' }
];

export default function SectionForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    type: initialData?.type || 'hero',
    title: initialData?.title || '',
    isActive: initialData?.isActive ?? true,
    isPremium: initialData?.isPremium || false,
    content: initialData?.content || {},
    styles: initialData?.styles || {
      textColor: '#1f2937',
      backgroundColor: '#ffffff',
      paddingTop: '4rem',
      paddingBottom: '4rem',
      textAlign: 'center',
      animation: 'none'
    }
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleContentChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      content: { ...prev.content, [field]: value }
    }));
  };

  const handleStyleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      styles: { ...prev.styles, [field]: value }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const selectedType = SECTION_TYPES.find(t => t.value === formData.type);

  return (
    <div className="bg-white rounded-2xl shadow-hard p-6 animate-fade-in">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        {initialData ? '✏️ Editar Sección' : '➕ Nueva Sección'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Tipo de sección */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de sección</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {SECTION_TYPES.map(type => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleChange('type', type.value)}
                disabled={!!initialData}
                className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  formData.type === type.value
                    ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-soft'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                } ${initialData ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="text-xl mb-1">{type.icon}</div>
                <div className="font-medium">{type.label}</div>
                <div className="text-xs text-gray-400">{type.category}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Título */}
        <Input
          label="Título (opcional)"
          type="text"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Título de la sección"
          icon="📌"
        />

        {/* Activo */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => handleChange('isActive', e.target.checked)}
            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
          />
          <label htmlFor="isActive" className="text-sm text-gray-700 cursor-pointer">
            Activo (visible en el sitio)
          </label>
        </div>

        {/* Contenido según tipo */}
        <div className="border-t border-gray-100 pt-4">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <span>📦</span> Contenido
          </h3>
          
          {formData.type === 'hero' && (
            <div className="space-y-3">
              <Input
                label="Título principal"
                type="text"
                value={formData.content.heading || ''}
                onChange={(e) => handleContentChange('heading', e.target.value)}
                placeholder="Bienvenido a MiMarca"
                icon="✨"
              />
              <Input
                label="Subtítulo"
                type="text"
                value={formData.content.subheading || ''}
                onChange={(e) => handleContentChange('subheading', e.target.value)}
                placeholder="La mejor experiencia para tu negocio"
                icon="📝"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Texto del botón"
                  type="text"
                  value={formData.content.buttonText || ''}
                  onChange={(e) => handleContentChange('buttonText', e.target.value)}
                  placeholder="Ver más"
                  icon="🔘"
                />
                <Input
                  label="Link del botón"
                  type="text"
                  value={formData.content.buttonLink || ''}
                  onChange={(e) => handleContentChange('buttonLink', e.target.value)}
                  placeholder="/catalogo"
                  icon="🔗"
                />
              </div>
              <Input
                label="URL de la imagen"
                type="text"
                value={formData.content.image || ''}
                onChange={(e) => handleContentChange('image', e.target.value)}
                placeholder="https://..."
                icon="🖼️"
              />
            </div>
          )}

          {formData.type === 'text' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contenido del texto (HTML)</label>
              <textarea
                value={formData.content.text || ''}
                onChange={(e) => handleContentChange('text', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                rows="6"
                placeholder="<p>Escribe aquí tu contenido...</p>"
              />
            </div>
          )}

          {formData.type === 'image' && (
            <div className="space-y-3">
              <Input
                label="URL de la imagen"
                type="text"
                value={formData.content.image || ''}
                onChange={(e) => handleContentChange('image', e.target.value)}
                placeholder="https://..."
                icon="🖼️"
              />
              <Input
                label="Texto alternativo"
                type="text"
                value={formData.content.caption || ''}
                onChange={(e) => handleContentChange('caption', e.target.value)}
                placeholder="Descripción de la imagen"
                icon="📝"
              />
            </div>
          )}

          {formData.type === 'features' && (
            <div>
              <Input
                label="Título de la sección"
                type="text"
                value={formData.content.title || ''}
                onChange={(e) => handleContentChange('title', e.target.value)}
                placeholder="¿Por qué elegirnos?"
                icon="✨"
              />
              <p className="text-sm text-gray-500 mt-2 p-3 bg-gray-50 rounded-xl">
                ℹ️ Las características se editan directamente en la base de datos.
                <br />
                <span className="text-xs">Estructura: [{{ icon: "🚀", title: "Rápido", description: "Descripción" }}]</span>
              </p>
            </div>
          )}

          {formData.type === 'testimonials' && (
            <div>
              <Input
                label="Título de la sección"
                type="text"
                value={formData.content.title || ''}
                onChange={(e) => handleContentChange('title', e.target.value)}
                placeholder="Lo que dicen nuestros clientes"
                icon="💬"
              />
              <p className="text-sm text-gray-500 mt-2 p-3 bg-gray-50 rounded-xl">
                ℹ️ Los testimonios se editan directamente en la base de datos.
                <br />
                <span className="text-xs">Estructura: [{{ name: "Juan", text: "Excelente", rating: 5, avatar: "url" }}]</span>
              </p>
            </div>
          )}

          {formData.type === 'cta' && (
            <div className="space-y-3">
              <Input
                label="Título"
                type="text"
                value={formData.content.title || ''}
                onChange={(e) => handleContentChange('title', e.target.value)}
                placeholder="¿Listo para empezar?"
                icon="🎯"
              />
              <Input
                label="Subtítulo"
                type="text"
                value={formData.content.subtitle || ''}
                onChange={(e) => handleContentChange('subtitle', e.target.value)}
                placeholder="Únete hoy mismo"
                icon="📝"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Texto del botón"
                  type="text"
                  value={formData.content.buttonText || ''}
                  onChange={(e) => handleContentChange('buttonText', e.target.value)}
                  placeholder="Regístrate"
                  icon="🔘"
                />
                <Input
                  label="Link del botón"
                  type="text"
                  value={formData.content.buttonLink || ''}
                  onChange={(e) => handleContentChange('buttonLink', e.target.value)}
                  placeholder="/register"
                  icon="🔗"
                />
              </div>
            </div>
          )}

          {formData.type === 'stats' && (
            <div>
              <Input
                label="Título de la sección"
                type="text"
                value={formData.content.title || ''}
                onChange={(e) => handleContentChange('title', e.target.value)}
                placeholder="Nuestros números"
                icon="📊"
              />
              <p className="text-sm text-gray-500 mt-2 p-3 bg-gray-50 rounded-xl">
                ℹ️ Las estadísticas se editan directamente en la base de datos.
                <br />
                <span className="text-xs">Estructura: [{{ value: 1000, label: "Clientes", suffix: "+" }}]</span>
              </p>
            </div>
          )}
        </div>

        {/* Estilos */}
        <div className="border-t border-gray-100 pt-4">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <span>🎨</span> Estilos visuales
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Color de texto</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.styles.textColor}
                  onChange={(e) => handleStyleChange('textColor', e.target.value)}
                  className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.styles.textColor}
                  onChange={(e) => handleStyleChange('textColor', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-lg text-sm font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Color de fondo</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.styles.backgroundColor}
                  onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.styles.backgroundColor}
                  onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-lg text-sm font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Alineación</label>
              <select
                value={formData.styles.textAlign}
                onChange={(e) => handleStyleChange('textAlign', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="left">← Izquierda</option>
                <option value="center">↔️ Centro</option>
                <option value="right">→ Derecha</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Animación</label>
              <select
                value={formData.styles.animation}
                onChange={(e) => handleStyleChange('animation', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              >
                {animations.map(anim => (
                  <option key={anim.value} value={anim.value}>{anim.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Padding arriba</label>
              <input
                type="text"
                value={formData.styles.paddingTop}
                onChange={(e) => handleStyleChange('paddingTop', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                placeholder="4rem"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Padding abajo</label>
              <input
                type="text"
                value={formData.styles.paddingBottom}
                onChange={(e) => handleStyleChange('paddingBottom', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                placeholder="4rem"
              />
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
          >
            {initialData ? 'Actualizar' : 'Crear'} Sección
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}