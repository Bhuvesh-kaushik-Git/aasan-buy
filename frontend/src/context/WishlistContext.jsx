import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '../components/Toast';

const WishlistContext = createContext();
export const useWishlist = () => useContext(WishlistContext);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const auth = useAuth() || {};
  const { user } = auth;
  const toast = useToast() || {};
  const { showToast } = toast;

  // Load from local storage for guests, or fetch from DB for logged-in users
  useEffect(() => {
    const loadWishlist = async () => {
      if (user) {
        setLoading(true);
        try {
          const res = await fetch(`${API_URL}/wishlist`, { credentials: 'include' });
          if (res.ok) {
            const data = await res.json();
            setWishlist(data || []);
            // Merge local storage items if they exist
            const local = JSON.parse(localStorage.getItem('aasanWishlist') || '[]');
            if (local.length > 0) {
              for (const item of local) {
                if (!data.find(d => d._id === item._id)) {
                  await fetch(`${API_URL}/wishlist/toggle`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ productId: item._id })
                  });
                }
              }
              localStorage.removeItem('aasanWishlist');
              const refreshed = await fetch(`${API_URL}/wishlist`, { credentials: 'include' });
              const refreshedData = await refreshed.json();
              setWishlist(refreshedData);
            }
          }
        } catch (e) {
          console.error("Wishlist fetch failed", e);
        } finally {
          setLoading(false);
        }
      } else {
        const local = JSON.parse(localStorage.getItem('aasanWishlist') || '[]');
        setWishlist(local);
      }
    };
    loadWishlist();
  }, [user]);

  const toggleWishlist = async (product) => {
    if (!product?._id) return;

    if (user) {
      try {
        const res = await fetch(`${API_URL}/wishlist/toggle`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ productId: product._id })
        });
        const data = await res.json();
        if (res.ok) {
          if (data.isWishlisted) {
            setWishlist(prev => [...prev, product]);
            showToast("Added to your favorites! ❤️", "success");
          } else {
            setWishlist(prev => prev.filter(item => item._id !== product._id));
            showToast("Removed from favorites", "success");
          }
        }
      } catch (e) {
        showToast("Action failed", "error");
      }
    } else {
      // Guest logic
      const isPresent = wishlist.find(item => item._id === product._id);
      let next;
      if (isPresent) {
        next = wishlist.filter(item => item._id !== product._id);
        showToast("Removed from favorites", "success");
      } else {
        next = [...wishlist, product];
        showToast("Added to your favorites! ❤️", "success");
      }
      setWishlist(next);
      localStorage.setItem('aasanWishlist', JSON.stringify(next));
    }
  };

  const isInWishlist = (id) => wishlist.some(item => item._id === id);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, loading }}>
      {children}
    </WishlistContext.Provider>
  );
};
