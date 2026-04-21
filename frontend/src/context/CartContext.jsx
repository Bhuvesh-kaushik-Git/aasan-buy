import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

const API_URL = import.meta.env.VITE_API_URL;

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

  // Save to localStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('aasanCart', JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

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

  const addToCart = (product, quantity = 1, selectedColor = null, selectedSize = null) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(item =>
        item.productId === product._id &&
        item.selectedColor?.name === selectedColor?.name &&
        item.selectedSize === selectedSize
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
      }];
    });
  };

  const removeFromCart = (indexToRemove) => {
    setCart(prev => {
      const removed = prev[indexToRemove];
      const newCart = prev.filter((_, idx) => idx !== indexToRemove);
      // Clear any warning for this product
      if (removed?.productId) {
        setStockWarnings(prev => {
          const w = { ...prev };
          delete w[removed.productId];
          return w;
        });
      }
      return newCart;
    });
  };

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return removeFromCart(index);
    setCart(prev => {
      const newCart = [...prev];
      newCart[index] = { ...newCart[index], quantity: newQuantity };
      return newCart;
    });
  };

  const clearCart = () => { setCart([]); setStockWarnings({}); };

  const getCartTotal = (discount = 0) => {
    const raw = cart.reduce((total, item) => total + item.price * item.quantity, 0);
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
