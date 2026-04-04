// client/src/components/sections/CTASection.jsx
export default function CTASection({ content }) {
  const { title, subtitle, buttonText = "Ver más", buttonLink = "/" } = content;
  
  return (
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
      {subtitle && <p className="text-lg mb-6 opacity-90">{subtitle}</p>}
      <a
        href={buttonLink}
        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        {buttonText}
      </a>
    </div>
  );
}