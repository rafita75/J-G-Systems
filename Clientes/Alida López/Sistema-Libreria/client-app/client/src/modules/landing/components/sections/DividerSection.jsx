// client/src/components/sections/DividerSection.jsx
export default function DividerSection({ content = {}, styles = {} }) {
  const { type = 'line', height = '2px', width = '80%', color = '#e5e7eb' } = content;
  
  if (type === 'space') {
    return null;
  }
  
  return (
    <div className="flex justify-center">
      <div 
        style={{ 
          height, 
          width, 
          backgroundColor: color, 
          borderRadius: '9999px' 
        }} 
      />
    </div>
  );
}