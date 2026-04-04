// client/src/components/sections/TestimonialsSection.jsx
export default function TestimonialsSection({ content }) {
  const { title, testimonials = [] } = content;
  
  return (
    <div className="container mx-auto px-4">
      {title && <h2 className="text-3xl font-bold mb-12 text-center">{title}</h2>}
      <div className="grid md:grid-cols-2 gap-8">
        {testimonials.map((item, idx) => (
          <div key={idx} className="bg-gray-50 p-6 rounded-lg">
            <div className="flex mb-4">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < (item.rating || 5) ? 'text-yellow-400' : 'text-gray-300'}>
                  ★
                </span>
              ))}
            </div>
            <p className="mb-4 italic">"{item.text}"</p>
            <p className="font-semibold">{item.name}</p>
            {item.role && <p className="text-sm opacity-70">{item.role}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}