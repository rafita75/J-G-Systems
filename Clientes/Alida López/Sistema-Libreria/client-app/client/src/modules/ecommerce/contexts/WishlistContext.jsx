// client/src/contexts/WishlistContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../../login/contexts/AuthContext';
import api from '../../../shared/services/api';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState({ products: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadWishlist();
    } else {
      setWishlist({ products: [] });
      setLoading(false);
    }
  }, [user]);

  const loadWishlist = async () => {
    try {
      const { data } = await api.get('/wishlist');
      setWishlist(data);
    } catch (error) {
      console.error('Error cargando wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId) => {
    try {
      const { data } = await api.post('/wishlist/add', { productId });
      setWishlist(data);
      return true;
    } catch (error) {
      console.error('Error agregando a wishlist:', error);
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const { data } = await api.delete(`/wishlist/remove/${productId}`);
      setWishlist(data);
      return true;
    } catch (error) {
      console.error('Error removiendo de wishlist:', error);
      return false;
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.products.some(p => p.productId?._id === productId || p.productId === productId);
  };

  return (
    <WishlistContext.Provider value={{
      wishlist,
      loading,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      refresh: loadWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}