// client/src/components/sections/TextSection.jsx
export default function TextSection({ content }) {
  const { title, text } = content;
  
  return (
    <div className="container mx-auto px-4 max-w-3xl">
      {title && <h2 className="text-3xl font-bold mb-6">{title}</h2>}
      {text && (
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: text }}
        />
      )}
    </div>
  );
}