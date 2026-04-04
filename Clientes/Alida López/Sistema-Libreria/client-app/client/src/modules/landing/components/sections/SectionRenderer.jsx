// client/src/components/sections/SectionRenderer.jsx
import HeroSection from './HeroSection';
import TextSection from './TextSection';
import ImageSection from './ImageSection';
import FeaturesSection from './FeaturesSection';
import TestimonialsSection from './TestimonialsSection';
import CTASection from './CTASection';
import DividerSection from './DividerSection';
import StatsSection from './StatsSection';

// Mapa de componentes por tipo
const components = {
  hero: HeroSection,
  text: TextSection,
  image: ImageSection,
  features: FeaturesSection,
  testimonials: TestimonialsSection,
  cta: CTASection,
  divider: DividerSection,
  stats: StatsSection
};

const generateId = (section) => {
  if (section.title) {
    return section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  return section.type;
};

export default function SectionRenderer({ section }) {
  const Component = components[section.type];
  
  if (!Component) {
    console.warn(`Sección tipo "${section.type}" no encontrada`);
    return null;
  }
  
  // Obtener clase de animación
  const animationClass = section.styles?.animation !== 'none' 
    ? `animate-${section.styles?.animation || 'fadeIn'}` 
    : '';
  
  // Estilos de la sección
  const sectionStyle = {
    backgroundColor: section.styles?.backgroundColor || '#ffffff',
    color: section.styles?.textColor || '#1f2937',
    paddingTop: section.styles?.paddingTop || '4rem',
    paddingBottom: section.styles?.paddingBottom || '4rem',
    textAlign: section.styles?.textAlign || 'center'
  };
  
  const sectionId = generateId(section);
  
  return (
    <div id={sectionId} className={animationClass} style={sectionStyle}>
      <Component 
        content={section.content} 
        styles={section.styles}
      />
    </div>
  );
}