// client/src/components/sections/FeaturesSection.jsx
export default function FeaturesSection({ content }) {
  const { title, features = [], columns = 3 } = content;
  
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4'
  }[columns] || 'md:grid-cols-3';
  
  return (
    <div className="container mx-auto px-4">
      {title && <h2 className="text-3xl font-bold mb-12 text-center">{title}</h2>}
      <div className={`grid ${gridCols} gap-8`}>
        {features.map((feature, idx) => (
          <div key={idx} className="text-center">
            <div className="text-4xl mb-4">{feature.icon || '✨'}</div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="opacity-80">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}