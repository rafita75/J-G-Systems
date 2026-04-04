// client/src/components/sections/StatsSection.jsx
import { useState, useEffect, useRef } from 'react';

export default function StatsSection({ content }) {
  const { title, stats = [] } = content;
  const [counts, setCounts] = useState(stats.map(() => 0));
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          stats.forEach((stat, idx) => {
            const target = stat.value;
            let current = 0;
            const interval = setInterval(() => {
              current += Math.ceil(target / 50);
              if (current >= target) {
                current = target;
                clearInterval(interval);
              }
              setCounts(prev => {
                const newCounts = [...prev];
                newCounts[idx] = current;
                return newCounts;
              });
            }, 20);
          });
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [stats]);
  
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4'
  }[stats.length] || 'md:grid-cols-4';
  
  return (
    <div ref={ref} className="container mx-auto px-4">
      {title && <h2 className="text-3xl font-bold mb-12 text-center">{title}</h2>}
      <div className={`grid ${gridCols} gap-8`}>
        {stats.map((stat, idx) => (
          <div key={idx} className="text-center">
            <div className="text-4xl font-bold mb-2">
              {stat.prefix || ''}{counts[idx]}{stat.suffix || ''}
            </div>
            <div className="text-lg opacity-80">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}