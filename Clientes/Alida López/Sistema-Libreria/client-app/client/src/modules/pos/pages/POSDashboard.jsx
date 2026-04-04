// client/src/modules/pos/pages/POSDashboard.jsx
import { useState } from 'react';
import POS from '../components/POS';

export default function POSDashboard() {
  const [showPOS, setShowPOS] = useState(true);

  if (!showPOS) {
    return (
      <div className="text-center py-12">
        <button
          onClick={() => setShowPOS(true)}
          className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700"
        >
          Abrir Caja
        </button>
      </div>
    );
  }

  return <POS onClose={() => setShowPOS(false)} />;
}