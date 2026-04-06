// client/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './modules/login/contexts/AuthContext';
import { ModuleProvider } from './modules/core/contexts/ModuleContext';
import { SectionProvider } from './modules/landing/contexts/SectionContext';
import { CartProvider } from './modules/ecommerce/contexts/CartContext';
import './index.css';
import { WishlistProvider } from './modules/ecommerce/contexts/WishlistContext';

// Registrar Service Worker para notificaciones push
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('Service Worker registrado'))
    .catch(err => console.log('Service Worker error:', err));
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ModuleProvider>
      <AuthProvider>
        <SectionProvider>
          <CartProvider>
            <WishlistProvider>
              <App />
            </WishlistProvider>
          </CartProvider>
        </SectionProvider>
      </AuthProvider>
    </ModuleProvider>
  </React.StrictMode>
);