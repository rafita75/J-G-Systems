// client/src/components/sections/HeroSection.jsx
export default function HeroSection({ content }) {
  const {
    heading = "Bienvenido",
    subheading = "Descripción del negocio",
    buttonText = "Ver más",
    buttonLink = "/",
    image = ""
  } = content;
  
  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{heading}</h1>
          {subheading && (
            <p className="text-lg mb-6 opacity-90">{subheading}</p>
          )}
          {buttonText && (
            <a
              href={buttonLink}
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {buttonText}
            </a>
          )}
        </div>
        {image && (
          <div className="flex-1">
            <img src={image} alt={heading} className="w-full rounded-lg" />
          </div>
        )}
      </div>
    </div>
  );
}