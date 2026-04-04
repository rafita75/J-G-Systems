// client/src/components/sections/ImageSection.jsx
export default function ImageSection({ content }) {
  const { image, caption, link } = content;
  
  const imgElement = (
    <img src={image} alt={caption || "Imagen"} className="w-full rounded-lg shadow-md" />
  );
  
  return (
    <div className="container mx-auto px-4 text-center">
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer">
          {imgElement}
        </a>
      ) : (
        imgElement
      )}
      {caption && <p className="mt-2 text-sm opacity-75">{caption}</p>}
    </div>
  );
}