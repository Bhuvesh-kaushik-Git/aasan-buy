import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('aasanCart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      return [];
    }
  });
  const [stockWarnings, setStockWarnings] = useState({}); // { productId: availableStock }
  const [isInitialized, setIsInitialized] = useState(true);
  const [isValidatingStock, setIsValidatingStock] = useState(false);

  const auth = useAuth() || {};
  const { user } = auth;
  const syncTimeoutRef = useRef(null);

  // Save to localStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('aasanCart', JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

  // ── Sync with DB ─────────────────────────────────────────────────────────────
  
  // 1. Fetch & Merge on Login
  useEffect(() => {
    if (user && isInitialized) {
      const fetchRemoteCart = async () => {
        try {
          const res = await fetch(`${API_URL}/api/auth/cart`, { credentials: 'include' });
          if (res.ok) {
            const remoteCart = await res.json();
            if (remoteCart.length > 0) {
              // Simple Merge Logic: remote takes precedence for now, or concat
              setCart(prev => {
                const combined = [...prev];
                remoteCart.forEach(ri => {
                   const exists = combined.find(i => i.productId === ri.productId && i.selectedColor?.name === ri.selectedColor?.name && i.selectedSize === ri.selectedSize);
                   if (!exists) combined.push(ri);
                });
                return combined;
              });
            }
          }
        } catch (e) { console.error("Cart fetch failed", e); }
      };
      fetchRemoteCart();
    }
  }, [user, isInitialized]);

  // 2. Push to DB on Changes (Debounced)
  useEffect(() => {
    if (user && isInitialized) {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(async () => {
        try {
          await fetch(`${API_URL}/api/auth/cart`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cart }),
            credentials: 'include'
          });
        } catch (e) { console.error("Cart sync failed", e); }
      }, 2000); // 2 second debounce
    }
    return () => { if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current); };
  }, [cart, user, isInitialized]);

  // ── Active Stock Validation ───────────────────────────────────────────────
  // Optimized: Uses a single bulk endpoint to check stock for all items
  const validateCartStock = useCallback(async () => {
    if (cart.length === 0) { setStockWarnings({}); return; }
    setIsValidatingStock(true);
    try {
      const itemIds = [...new Set(cart.map(i => i.productId))];
      const res = await fetch(`${API_URL}/api/products/bulk-stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIds }),
      });
      if (res.ok) {
        const stockMap = await res.json();
        const warnings = {};
        cart.forEach(item => {
          const liveStock = stockMap[item.productId];
          if (liveStock !== undefined && liveStock < item.quantity) {
            warnings[item.productId] = liveStock;
          }
        });
        setStockWarnings(warnings);
      }
    } catch (e) {
      console.error('Stock validation error:', e);
    }
    setIsValidatingStock(false);
  }, [cart]);

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return removeFromCart(index);
    setCart(prev => {
      const newCart = [...prev];
      newCart[index] = { ...newCart[index], quantity: newQuantity };
      return newCart;
    });
  };

  const addToCart = (product, quantity = 1, selectedColor = null, selectedSize = null, giftWrap = null) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(item =>
        item.productId === product._id &&
        item.selectedColor?.name === selectedColor?.name &&
        item.selectedSize === selectedSize &&
        item.giftWrap?.id === giftWrap?.id
      );
      if (existingIdx >= 0) {
        const newCart = [...prev];
        newCart[existingIdx].quantity += quantity;
        return newCart;
      }
      return [...prev, {
        productId: product._id,
        name: product.name,
        price: product.price,
        image: selectedColor?.images?.[0] || product.images?.[0],
        quantity,
        selectedColor,
        selectedSize,
        giftWrap
      }];
    });
  };

  const removeFromCart = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
    // Clear warning for deleted item if any
    setStockWarnings(prev => {
        const newWarnings = { ...prev };
        const productId = cart[index]?.productId;
        if (productId) delete newWarnings[productId];
        return newWarnings;
    });
  };

  const clearCart = () => { setCart([]); setStockWarnings({}); };

  const getCartTotal = (discount = 0) => {
    const raw = cart.reduce((total, item) => {
      const itemBase = item.price * item.quantity;
      const wrapPrice = (item.giftWrap?.price || 0) * item.quantity;
      return total + itemBase + wrapPrice;
    }, 0);
    return Math.max(0, raw - discount);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Whether any cart item has a stock issue
  const hasStockIssues = Object.keys(stockWarnings).length > 0;

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      cartCount,
      stockWarnings,
      isValidatingStock,
      validateCartStock,
      hasStockIssues,
    }}>
      {children}
    </CartContext.Provider>
  );
};
